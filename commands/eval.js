const { embed, embedSingle, embedOK, embedError } = require('../modules/embedHelper');

async function evalCmd(message, args) {
    if (message.author.id != '243512754541953024')
        return message.channel.send(embedError('You don\'t have premission to do that'));
    
    let output;
    try {
        output = JSON.stringify(await eval(args.join(' ')));
    } catch (ex) {
        output = String(ex);
    }
    
    if (!output.length)
        output = 'No output';
    
    message.channel.send(embedSingle(output));
}

module.exports = { function: evalCmd, names: ['eval'], hidden: true };