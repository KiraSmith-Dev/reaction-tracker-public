const { embed, embedSingle, embedOK, embedError } = require('../modules/embedHelper');
const db = require('../modules/database').get();
const messages = db.collection('messages');

async function invalidate(message, args) {
    if (!args[0])
        return message.channel.send(embedError('You need to supply a message URL to invalidate'));
    
    let messageURL = args[0];
    if (!messageURL.startsWith('https://discord.com/channels/428000566426468353/'))
        return message.channel.send(embedError('Invalid message URL'));
    
    let messageData = messageURL.substr('https://discord.com/channels/428000566426468353/'.length).split('/');
    let channelID = messageData[0];
    let messageID = messageData[1];
    
    let targetChannel;
    let targetMessage;
    try {
        targetChannel = await message.guild.channels.fetch(channelID);
        targetMessage = await targetChannel.messages.fetch(messageID);
    } catch {
        return message.channel.send(embedError('Failed to fetch message...'));
    }
    
    if (!message.member.permissionsIn(targetChannel).has('MANAGE_MESSAGES'))
        return message.channel.send(embedError('You don\'t have premission to do that'));
        
    let status = await messages.updateOne({ id: targetMessage.id }, { $set: { 
        invalid: true
    } }, { upsert: true });
    
    let totalChangeCount = status.modifiedCount + status.upsertedCount;
    
    if (totalChangeCount > 1) console.log('Somehow changed two entries with one updateOne?!');
    
    if (totalChangeCount != 1)
        return message.channel.send(embedError('Database failed to invalidate message!?'));
    
    let outEmbed = embed('Invalidated', { name: targetMessage.author.username, value: targetMessage.content.length ? targetMessage.content : '(attachment only)' }, undefined, 0x2dfc9f);
    
    if (targetMessage.attachments.size)
        outEmbed.embeds[0].setImage(targetMessage.attachments.entries().next().value[1].url);
    
    message.channel.send(outEmbed);
}

module.exports = { function: invalidate, names: ['invalidate', 'inval'], description: 'Admin Only: Invalidate all reactions on a message', usage: '(messageURL)', priority: -10 };