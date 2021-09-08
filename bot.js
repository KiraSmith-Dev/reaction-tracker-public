(async () => {
    const config = require('./config');
    const Discord = require('discord.js');
    const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.DIRECT_MESSAGES, Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS], partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
    
    const db = await require('./modules/database').init();
    
    const { genCommandList } = require('./modules/commandListHelper');
    const commandList = (await genCommandList()).commandList;
    
    const { embedError } = require('./modules/embedHelper');
    
    client.on('ready', () => {
        console.log('Bot Online');
        client.user.setActivity(`${config.prefix}help for info`);
    });
    
    const { getUserFromMention } = require('./modules/utility');
    
    client.on('messageCreate', message => {
        if (message.content.toLowerCase().includes('i forgor')) message.channel.send('he forgor💀');
        if (message.author.bot || !message.content.startsWith(config.prefix)) return;
        
        const args = message.content.trim().slice(config.prefix.length).split(/ +/g);
        const command = args.shift().toLowerCase();
        
        let mentions = [];
        for (let i = 0; i < args.length; i++) {
            let mentionUser = getUserFromMention(client, args[i]);
            if (mentionUser) {
                mentions.push(mentionUser);
                args[i] = { isMention: true, user: mentionUser };
            }
        }
        
        for (let i = 0; i < commandList.length; i++) {
            const commandData = commandList[i];
            if (commandData.names.includes(command))
                try {
                    return commandData.function(message, args, mentions);
                } catch (ex) { 
                    console.error(ex);
                    try {
                        message.channel.send(embedError('Exception occured while processing command')); 
                    } catch (ex2) { console.error(ex2); }
                    return;
                }
        }
    });
    
    let handleReactionChange = require('./modules/handleReactionChange');
    
    client.on('messageReactionAdd', handleReactionChange);
    client.on('messageReactionRemove', handleReactionChange);
    
    // So that heroku doesn't kill the process for failing to bind to port...
    var http = require('http');
    http.createServer((req, res) => { res.end(); }).listen(process.env.PORT || 3123);
    
    client.login(config.token);
})();