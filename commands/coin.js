const { embed, embedSingle, embedOK, embedError } = require('../modules/embedHelper');
const { getUserReactionCount, typeToColor, getBalance } = require('../modules/utility');

async function coin(message) {
    message.channel.send(embedSingle(`You have ${await getBalance(message.author.id)} Doink Coin`));
}

module.exports = { function: coin, names: ['coin', 'coins'], description: 'Shows how many Doink Coins you have', priority: -1 };