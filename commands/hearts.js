const { embed, embedSingle, embedOK, embedError } = require('../modules/embedHelper');
const { getUserReactionCount, typeToColor } = require('../modules/utility');

async function hearts(message) {
    message.channel.send(embedSingle(`You have ${await getUserReactionCount(message.author.id, 'heart')} Hearts`, undefined, typeToColor('Hearts')));
}

module.exports = { function: hearts, names: ['hearts'], description: 'Shows how many hearts you have', priority: 3 };