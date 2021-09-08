const { embed, embedSingle, embedOK, embedError } = require('../modules/embedHelper');
const { getUserReactionCount, typeToColor, getBalance, modifyBalance } = require('../modules/utility');
const db = require('../modules/database').get();
const messages = db.collection('messages');
const users = db.collection('users');

async function rob(message, args) {
    if (!args[0] || !args[0].isMention) 
        return message.channel.send(embedError('You must @mention a user to rob'));
    
    let userToRob = args[0].user;
    
    if (message.author.id == userToRob.id) 
        return message.channel.send(embedError(`You can't rob yourself...`));
    
    let robbed = await users.findOne({ id: userToRob.id });
    
    message.channel.send(embed(`Succecss`, { name: `Robbed ${userToRob.username} for ${robbed.coins} Doink Coin`, value: `They now have 0 Doink Coin` }));
}

module.exports = { function: rob, names: ['rob'], description: 'Rob someone for their Doink Coin ;)', usage: '(@userToRob)', priority: -6 };