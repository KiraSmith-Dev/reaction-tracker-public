const { embed, embedSingle, embedOK, embedError } = require('../modules/embedHelper');
const { getUserReactionCount } = require('../modules/utility');

async function net(message, args) {
    let target = message.author;
    if (args[0] && args[0].isMention) 
        target = args[0].user;
    
    let netScore = (await getUserReactionCount(target.id, 'heart')) - (await getUserReactionCount(target.id, 'downvote'));
    message.channel.send(embedSingle(`${target.username}'s net score is ${netScore}`, undefined, netScore > 0 ? 0x22b50e : 0xbd1313));
}

module.exports = { function: net, names: ['net'], description: 'Shows your net score (Hearts - Downvotes)', priority: 0 };