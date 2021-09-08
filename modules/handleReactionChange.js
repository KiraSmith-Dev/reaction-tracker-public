const emoji = require('node-emoji');
const db = require('./database').get();
const messages = db.collection('messages');
const users = db.collection('users');
const { canGiveGold } = require('./utility');
const { DateTime, Settings } = require('luxon');
Settings.defaultZone = 'America/New_York';

async function fetchReaction(reaction) {
    // If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
    try {
        await reaction.fetch();
        return true;
    } catch (error) {
        console.error('Something went wrong when fetching the message: ', error);
    }
    
    return false;
}

function reactionIsQuote(reaction) {
    if (reaction.message.channel.id != '597114467205251082') return false;
    
    if (reaction.message.author.id == '332737714900434946' && reaction.message.content.includes('-')) return true;
    
    let quoteIndex = reaction.message.content.indexOf('"');
    if (quoteIndex == -1 || quoteIndex == reaction.message.content.lastIndexOf('"')) return false;
    
    return true;
}

async function tryGiveDoinkGold(reaction, innerReaction, user) {
    let local = DateTime.local();
    let canGive = await canGiveGold(user.id, local);
                
    let msg = await messages.findOne({ id: reaction.message.id });
    let isAGoldGiver = msg && msg.goldGivers && msg.goldGivers.includes(user.id);
    
    if (!canGive && !isAGoldGiver) {
        innerReaction.users.remove(user.id);
        return false;
    }
    
    await users.updateOne({ id: user.id }, { $set: { id: user.id, username: user.username, lastGoldGive: `${local.year}-${local.month}` } }, { upsert: true });
    
    let updateObject = msg && msg.goldGivers ? { '$addToSet': { goldGivers: user.id } } : { '$set': { goldGivers: [ user.id ] } };
    
    await messages.updateOne({ id: reaction.message.id }, updateObject, { upsert: true });
    
    return true;
}

async function countReactions(reaction, author, authorFilter) {
    let reactions = [];
    
    for (let [snowflake, innerReaction] of reaction.message.reactions.cache) {
        let emoteName = emoji.unemojify(innerReaction.emoji.toString()).toLowerCase().trim();
        
        let reactionObj = { name: emoteName, ids: [] };
        
        let reactionUsers = await innerReaction.users.fetch();
        for (let [snowflake, thisUser] of reactionUsers)  {
            if (authorFilter.map(filter => emoteName.includes(filter)).includes(true) && thisUser.id == author.id) {
                innerReaction.users.remove(author.id);
                continue;
            }
            
            if (emoteName.includes('doinkgold') && !(await tryGiveDoinkGold(reaction, innerReaction, thisUser))) continue;
            
            reactionObj.ids.push(thisUser.id);
        }
            
        reactions.push(reactionObj);
    }
    
    return reactions;
}

function countWithoutDuplicates(reactions, filterName, authorID) {
    reactions = reactions.filter(reaction => reaction.name.includes(filterName));
    
    let alreadyVoted = [authorID];
    let count = 0;
    for (let i = 0; i < reactions.length; i++) {
        const reactionObj = reactions[i];
        for (let i = 0; i < reactionObj.ids.length; i++) {
            const id = reactionObj.ids[i];
            if (alreadyVoted.includes(id)) continue;
            alreadyVoted.push(id);
            ++count;
        }
    }
    
    return count;
}

async function handleReactionChange(reaction) {
    // When we receive a reaction we check if the reaction is partial or not
    if (reaction.partial)
        if (!(await fetchReaction(reaction))) return; // Return as `reaction.message.author` may be undefined/null
    
    let author = reaction.message.author;
    
    // reaction.message.createdTimestamp < 1613772319478
    if (!reaction.message.channel.guild || reaction.message.channel.guild.id != 428000566426468353) return;
    
    if (reactionIsQuote(reaction)) {
        if (reaction.message.mentions.users.size != 1) return;
        author = reaction.message.mentions.users.entries().next().value[1];
    }
    
    let reactions = await countReactions(reaction, author, ['heart', 'downvote', 'gold']);
    let totalHearts = countWithoutDuplicates(reactions, 'heart', author.id);
    let totalDownvotes = countWithoutDuplicates(reactions, 'downvote', author.id);
    
    let msg = await messages.findOne({ id: reaction.message.id });
    let totalGold = msg ? msg.goldGivers ? msg.goldGivers.length : 0 : 0;
    
    await users.updateOne({ id: author.id }, { $set: { id: author.id, username: author.username } }, { upsert: true });
    await messages.updateOne({ id: reaction.message.id }, { $set: { 
        author: author.id, 
        channel: reaction.message.channel.id, 
        id: reaction.message.id, 
        timestamp: reaction.message.createdTimestamp, 
        reactions: reactions, 
        totalHearts: totalHearts, 
        totalDownvotes: totalDownvotes, 
        totalGold: totalGold
    }, $setOnInsert: { goldGivers: [] } }, { upsert: true });
}

module.exports = handleReactionChange;