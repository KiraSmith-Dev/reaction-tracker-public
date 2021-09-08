const { embed, embedSingle, embedOK, embedError } = require('../modules/embedHelper');
const { getUserReactionCount, typeToDisplayName, typeToColor } = require('../modules/utility');
const db = require('../modules/database').get();
const messages = db.collection('messages');
const users = db.collection('users');

async function leaderboard(message, args) {
    return message.channel.send(embedSingle(`__Leaderboard__`, 'Leaderboard currently disabled'));
    
    let type = 'heart';
    if (args[0]) type = args[0];
    type = typeToDisplayName(type);
    
    if (type == 'invalid')
        return message.channel.send(embedError('Invalid type - Valid are: "Hearts", "Downvotes", and "gold"'));
    
    let time = 'all';
    if (args[1]) time = args[1].toLowerCase();
    
    let timeOptions = ['week', 'month', 'year', 'all'];
    
    if (!timeOptions.includes(time))
        return message.channel.send(embedError('Invalid time search - Valid are: "Week", "Month", "Year", and "All"'));
    
    let now = Date.now();
    let timestampMin = now - [7 * 86400 * 1000, 30 * 86400 * 1000, 365 * 86400 * 1000, now][timeOptions.indexOf(time)];
    
    let allUsers = await users.find();
    
    let userObjs = [];
    
    await allUsers.forEach(item => {
        userObjs.push({ id: item.id, username: item.username });
    });
    
    let userCounts = [];
    for (let i = 0; i < userObjs.length; i++) {
        const userObj = userObjs[i];
        userCounts.push({ name: userObj.username, count: await getUserReactionCount(userObj.id, type, timestampMin) });
    }
    
    userCounts.sort((a, b) => b.count - a.count);
    
    let fields = [];
    for (let i = 0; i < userCounts.length; i++) {
        const userCount = userCounts[i];
        fields.push({ name: `#${i + 1}`, value: `${userCount.name}: ${userCount.count} ${type}` });
    }
    
    message.channel.send(embed(`__Leaderboard (${type})__`, fields, undefined, typeToColor(type)));
}

module.exports = { function: leaderboard, names: ['leaderboard', 'lb'], description: 'Shows the leaderboard of the specified type', usage: '[type] [time]', priority: 51 };