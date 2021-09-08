const { embed, embedSingle, embedOK, embedError } = require('../modules/embedHelper');
const { getUserReactionCount, typeToColor, getBalance, modifyBalance } = require('../modules/utility');
const config = require('../config');
const { random } = require('../modules/random');
let { openChallenges, cleanupChallenges } = require('./versus');

async function accept(message, args) {
    if (!args[0])
        return message.channel.send(embedError('You must specify a versus to accept'));
    
    let versusID = args[0];
    let challenge = openChallenges.find(challenge => challenge.uid == versusID);
    
    if (!challenge)
        return message.channel.send(embedError('Challenge not found or expired'));
        
    if (message.author.id != challenge.target.id)
        return message.channel.send(embedError('You can\'t accept this versus'));
    
    // 10 min timer
    let now = Date.now();
    if (challenge.openedAt < now - 1000 * 60 * 10)
        return message.channel.send(embedError('Challenge expired'));
    
    cleanupChallenges();
    
    if ((await getBalance(challenge.host.id)) < challenge.amount)
        return message.channel.send(embedError(`${challenge.host.username} has less than ${challenge.amount} Doink Coin`));
        
    if ((await getBalance(challenge.target.id)) < challenge.amount)
        return message.channel.send(embedError(`${challenge.target.username} has less than ${challenge.amount} Doink Coin`));
    
    let result = random.boolean();
    let winner = result ? challenge.host : challenge.target;
    let loser = result ? challenge.target : challenge.host;
    
    await modifyBalance(winner, challenge.amount);
    await modifyBalance(loser, challenge.amount * -1);
    
    let chalIndex = openChallenges.findIndex(item => item.uid == challenge.uid);
    if (chalIndex != -1) openChallenges.splice(chalIndex, 1);

    message.channel.send(embed(`Versus Result`, { name: `${winner.username} wins!`, value: `They gain ${challenge.amount} Doink Coin${challenge.amount > 1 ? 's' : ''}` }));
}

module.exports = { function: accept, names: ['accept'], description: 'Accept a versus', usage: '(versusID)', priority: -5, };