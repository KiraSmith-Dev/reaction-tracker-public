const { embed, embedSingle, embedOK, embedError } = require('../modules/embedHelper');
const { typeToDisplayName, typeToColor } = require('../modules/utility');
const db = require('../modules/database').get();
const messages = db.collection('messages');
const users = db.collection('users');

async function top(message, args) {
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
    
    // Has reactions property, has > 0 of the type we're looking for, invalid == false or doesn't have the invalid property at all
    let top10 = await messages.find({ 'timestamp': { '$gt': timestampMin }, 'reactions': { '$exists': true }, [`total${type}`]: { '$gt': 0 }, '$or':  [ { invalid: false }, { invalid: { $exists: false } } ] }).sort({[`total${type}`]:-1}).limit(10);
    
    let fields = [];
    let i = 0;
    await top10.forEach(item => {
        fields.push({ name: `#${++i} (${item[`total${type}`]} ${type})`, value: `https://discord.com/channels/428000566426468353/${item.channel}/${item.id}` });
    });
    
    message.channel.send(embed(`__Top 10 Messages (${type}) (${time[0].toUpperCase()}${time.substr(1)})__`, fields, undefined, typeToColor(type)));
}

module.exports = { function: top, names: ['top'], description: 'Shows the top 10 messages of the specified type', usage: '[type] [time]', priority: 50 };