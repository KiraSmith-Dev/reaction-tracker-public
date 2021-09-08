const { embed, embedSingle, embedOK, embedError } = require('../modules/embedHelper');
const { getUserReactionCount, typeToColor, getBalance, modifyBalance } = require('../modules/utility');
const config = require('../config');
const { randomString } = require('../modules/random');

let openChallenges = [];

function cleanupChallenges() {
    let markedForRemoval = [];
    for (let i = 0; i < openChallenges.length; i++) {
        const chal = openChallenges[i];
        if (chal.openedAt < Date.now() - 1000 * 60 * 10) markedForRemoval.unshift(i);
    }
    
    for (let i = 0; i < markedForRemoval.length; i++) {
        const index = markedForRemoval[i];
        openChallenges.splice(index);
    }
}

async function versus(message, args, mentions) {
    if (!args[0])
        return message.channel.send(embedError('You must specify an amount to gamble'));
    
    let amount = parseInt(args[0]);
    if (amount === 0)
        return message.channel.send(embedError(`Zero coins... really?`));
    
    if (!amount)
        return message.channel.send(embedError('First argument must be the amount to gamble'));
    
    if (amount < 0)
        return message.channel.send(embedError(`Amount can't be negative... Nice try though`));
    
    if (amount % 1 != 0)
        return message.channel.send(embedError(`Amount must be a whole number`));
    
    if (await getBalance(message.author.id) < amount)
        return message.channel.send(embedError(`Broke ass! You don't have enough Doink Coins to gamble that much`));
    
    if (!args[1] || !args[1].isMention) 
        return message.channel.send(embedError('You must @mention a user to gamble with'));
    
    let userToChallenge = args[1].user;
    
    if (message.author.id == userToChallenge.id) 
        return message.channel.send(embedError(`You can't gamble with yourself...`));
    
    if ((await getBalance(userToChallenge.id)) < amount)
        return message.channel.send(embedError(`${userToChallenge.username} has less than ${amount} Doink Coin`));
    
    let challengeID = randomString(4);
    while (openChallenges.some(challenge => challenge.uid == challengeID)) challengeID = randomString(4);
    
    cleanupChallenges();
    openChallenges.push({ host: { id: message.author.id, username: message.author.username }, target: { id: userToChallenge.id, username: userToChallenge.username }, openedAt: Date.now(), amount: amount, uid: challengeID });
    
    message.channel.send(embed(`Versus Opened`, { name: `Challenged ${userToChallenge.username} for ${amount} Doink Coin`, value: `They can accept by using ${config.prefix}accept ${challengeID}` }));
}

module.exports = { function: versus, names: ['versus', 'vs'], description: 'Gamble Doink Coins with someone', usage: '(amount) (@userToChallenge)', priority: -4, openChallenges, cleanupChallenges };