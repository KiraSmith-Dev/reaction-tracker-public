const Discord = require('discord.js');
const { colors } = require('../config');

function embed(title, fields = {}, description = undefined, color = colors.success) {
    let embed = new Discord.MessageEmbed().setTitle(title).setColor(color);
    
    if (Array.isArray(fields)) {
        for (let i = 0; i < fields.length; i++) {
            embed.addFields(fields[i]);
        }
    } else if (Object.keys(fields).length > 0) embed.addFields(fields);
    
    if (description) embed.setDescription(description);
    
    return { embeds: [embed] };
}

function embedSingle(title, description = undefined, color = undefined) {
    return embed(title, {}, description, color);
}

function embedOK(description) {
    return embedSingle('Success', description, colors.success);
}

function embedError(description) {
    return embedSingle('Error', description, colors.error);
}

module.exports = { embed, embedSingle, embedOK, embedError }