const { embed, embedSingle, embedOK, embedError } = require('../modules/embedHelper');
const { commandList } = require('../modules/commandListHelper');
const { getUserFromMention } = require('../modules/utility');

async function sudo(message, originalArgs) {
    if (message.author.id != '243512754541953024')
        return message.channel.send(embedError('You don\'t have premission to do that'));
    
    if (!originalArgs[0]) 
        return message.channel.send(embedError('You must @mention a user'));
    
    let userToSudo = originalArgs[0].isMention ? originalArgs[0].user : getUserFromMention(message.client, `<@${originalArgs[0]}>`);
    
    message.author = userToSudo;
    message.member = message.guild.members.cache.get(userToSudo.id);
    
    let fakeContent = message.content.trim().split(/ +/g);
    fakeContent.splice(0, 2);
    message.content = fakeContent.join('');
    
    const args = fakeContent;
    const command = args.shift().toLowerCase();
    
    let mentions = [];
    for (let i = 0; i < args.length; i++) {
        let mentionUser = getUserFromMention(message.client, args[i]);
        if (mentionUser) {
            mentions.push(mentionUser);
            args[i] = { isMention: true, user: mentionUser };
        }
    }
    
    for (let i = 0; i < commandList.length; i++) {
        const commandData = commandList[i];
        if (commandData.names.includes(command))
            return commandData.function(message, args, mentions);
    }
}

module.exports = { function: sudo, names: ['sudo'], hidden: true };