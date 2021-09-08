const { embed, embedSingle, embedOK, embedError } = require('../modules/embedHelper');
const { getUserReactionCount, typeToColor } = require('../modules/utility');

async function downvotes(message) {
    message.channel.send(embedSingle(`You have ${await getUserReactionCount(message.author.id, 'downvote')} Downvotes`, undefined, typeToColor('Downvotes')));
}

module.exports = { function: downvotes, names: ['downvotes'], description: 'Shows how many downvotes you have', priority: 2 };