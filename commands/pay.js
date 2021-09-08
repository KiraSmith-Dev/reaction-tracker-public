const { embed, embedSingle, embedOK, embedError } = require('../modules/embedHelper');
const { getUserReactionCount, typeToColor, getBalance, modifyBalance } = require('../modules/utility');

async function pay(message, args) {
    if (!args[0])
        return message.channel.send(embedError('You must specify an amount to pay'));
    
    let amount = parseInt(args[0]);
    if (amount === 0)
        return message.channel.send(embedError(`Zero coins... really?`));
    
    if (!amount)
        return message.channel.send(embedError('First argument must be the amount to pay'));
    
    if (amount < 0)
        return message.channel.send(embedError(`Amount can't be negative... Nice try though`));
    
    if (amount % 1 != 0)
        return message.channel.send(embedError(`Amount must be a whole number`));
    
    if (await getBalance(message.author.id) < amount)
        return message.channel.send(embedError(`Broke ass! You don't have enough Doink Coins to pay that much`));
    
    if (!args[1] || !args[1].isMention) 
        return message.channel.send(embedError('You must @mention a user to pay'));
    
    let userToPay = args[1].user;
    
    if (message.author.id == userToPay.id) 
        return message.channel.send(embedError(`You can't pay yourself...`));
    
    await modifyBalance(message.author, amount * -1);
    await modifyBalance(userToPay, amount);
    
    message.channel.send(embed(`Succecss`, { name: `Paid ${userToPay.username} ${amount} Doink Coin`, value: `You now have ${await getBalance(message.author.id)} Doink Coin` }));
}

module.exports = { function: pay, names: ['pay'], description: 'Pays someone Doink Coin', usage: '(amount) (@userToPay)', priority: -3 };