const db = require('./database').get();
const messages = db.collection('messages');
const users = db.collection('users');
const { DateTime, Settings } = require('luxon');
Settings.defaultZone = 'America/New_York';

function typeToDisplayName(type) {
    type = type[0].toUpperCase() + type.toLowerCase().substr(1);
    if (type.endsWith('s')) type = type.substr(0, type.length -  1);
    
    if (!['Heart', 'Downvote', 'Gold'].includes(type))
        return 'invalid';
    
    return type + (type == 'Gold' ? '' : 's');
}

let types = ['Hearts', 'Downvotes', 'Gold'];
let colors = [0xff4060, 0xcf0e0e, 0xffe121];
function typeToColor(type) {
    return colors[types.indexOf(type)];
}

async function getUserReactionCount(userID, _type, timestampMin = 0) {
    type = typeToDisplayName(_type);
    
    if (type == 'invalid') throw `Invalid reaction type: ${_type}`;
    
    let allMessagess = await messages.find({ author: userID });
    
    let totalCount = 0;
    await allMessagess.forEach(item => {
        if (!item.invalid && item[`total${type}`] && item.timestamp > timestampMin)
            totalCount += item[`total${type}`];
    });
    
    return totalCount;
}

async function canGiveGold(userID, local) {
    let goldGiver = await users.findOne({id: userID});
    if (!goldGiver) return true;
                
    if (typeof local == 'undefined') local = DateTime.local();
    
    let canGive = true;
    if (typeof goldGiver.lastGoldGive == 'string') {
        let lastGoldGiveData = goldGiver.lastGoldGive.split('-');
        let year = lastGoldGiveData[0];
        let month = lastGoldGiveData[1];
        
        canGive = (year != local.year || month != local.month);
    }
    
    return canGive;
}

async function getBalance(userID) {
    let user = await users.findOne({ id: userID });
    if (!user) return 0;
    
    if (!user.coins) return 0;
    
    return user.coins;
}

async function modifyBalance(user, amount) {
    await users.updateOne({ id: user.id }, { $inc: { coins: amount }, $set: { id: user.id, username: user.username } }, { upsert: true });
}

function getUserFromMention(client, mention) {
    if (!mention || !mention.startsWith('<@') || !mention.endsWith('>')) return;
    
    mention = mention.slice(2, -1);
    
    if (mention.startsWith('!'))
        mention = mention.slice(1);
    
    return client.users.cache.get(mention);
}

module.exports = { typeToDisplayName, typeToColor, getUserReactionCount, canGiveGold, getBalance, modifyBalance, getUserFromMention };