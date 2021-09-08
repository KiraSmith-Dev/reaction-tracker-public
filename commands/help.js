const { helpFields } = require('../modules/commandListHelper');
const { embed, embedSingle, embedOK, embedError } = require('../modules/embedHelper');

function help(message) {
    message.channel.send(embed('__Command Info__', helpFields, undefined, 0x2dfc9f));
}

module.exports = { function: help, names: ['help'], description: 'Shows this message', priority: 999 };