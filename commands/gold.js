const { embed, embedSingle, embedOK, embedError } = require('../modules/embedHelper');
const { getUserReactionCount, typeToColor, canGiveGold } = require('../modules/utility');
const db = require('../modules/database').get();
const users = db.collection('users');

async function gold(message) {
    let canGive = await canGiveGold(message.author.id);
     
    message.channel.send(embed(`You have been awarded ${await getUserReactionCount(message.author.id, 'gold')} gold`, { name: `You ${canGive ? 'can' : `can't`} currently give out gold`, value: 'Everyone has 1 gold every month to give out. You can\'t save gold for the next month.' }, undefined, typeToColor('Gold')));
}

module.exports = { function: gold, names: ['gold'], description: 'Shows how many gold you\'ve been awarded, and if you can award gold', priority: 1 };