const { embed, embedSingle, embedOK, embedError } = require('../modules/embedHelper');
const { getUserReactionCount, typeToColor, getBalance, modifyBalance } = require('../modules/utility');
const config = require('../config');
const db = require('../modules/database').get();
const messages = db.collection('messages');
const users = db.collection('users');
const { DateTime, Settings } = require('luxon');
Settings.defaultZone = 'America/New_York';

function formatTimeProperty(duration, property) {
    let value = duration[property];
    if (!value) return '';
    
    let output = `${value} ${property}`;
    
    if (value < 2) output = output.substr(0, output.length - 1);
    
    return output;
}

function formatTimeToNextReset(local) {
    let duration = local.until(local.endOf('week'));
    duration = duration.toDuration(['days', 'hours', 'minutes']).toObject();
    
    // Round minutes up, if we reach the next hour, increment hours
    duration.minutes = Math.ceil(duration.minutes);
    if (duration.minutes == 60) {
        duration.minutes = 0;
        ++duration.hours;
    }
    
    // Convert object -> ['5 days', '1 hour'] / ect...
    let i = 0;
    let output = [];
    for (const [key, value] of Object.entries(duration)) {
        output.push(formatTimeProperty(duration, key));
        i++;
    }
    
    // Remove empty strings, ex: 0 hours
    output = output.filter(item => item.length);
    
    let emptyOutpts = 3 - output.length;
    
    let didAddComma = false;
    // Only need comma seperation when 3 elements exist
    if (output.length >= 3) {
        didAddComma = true;
        output = output.join(', ').split(' ');
    }
    
    // Only use 'and' if there are 2 or more elements
    if (output.length >= 2)
        output.splice(output.length - (didAddComma ? 2 : 1), 0, 'and');
    
    // Join it together nicely...
    outputStr = `Weekly resets in ${output.join(' ')}`;    
    
    if (output.length == 0)
        outputStr = 'Weekly resets now';
    
    return outputStr;
}

async function weekly(message) {
    let user = await users.findOne({ id: message.author.id });
    let local = DateTime.local();
    let currentWeek = local.year + '-' + local.weekNumber;
    if (!user || !user.lastWeeklyClaim || user.lastWeeklyClaim != currentWeek) await users.updateOne({ id: message.author.id }, { $set: { id: message.author.id, username: message.author.username, lastWeeklyClaim: currentWeek } }, { upsert: true });
    
    if (user && user.lastWeeklyClaim == currentWeek)
        return message.channel.send(embedError(`You've already claimed your weekly Doink Coins\n${formatTimeToNextReset(local)}`));
    
    await modifyBalance(message.author, config.weeklyAmount);
    
    message.channel.send(embed(`Success`, { name: `Claimed ${config.weeklyAmount} Doink Coin`, value: `You now have ${await getBalance(message.author.id)} Doink Coin` }));
}

module.exports = { function: weekly, names: ['weekly'], description: `Claim your ${config.weeklyAmount} weekly Doink Coin`, priority: -2 };