const fs = require('fs').promises;
const config = require('../config');

let commandList = [];
let helpFields = [];

async function genCommandList() {
    if (commandList.length) return commandList;
    
    let fileNames = await fs.readdir('./commands');
    for (let i = 0; i < fileNames.length; i++) {
        const fileName = fileNames[i];
        let command = require(`../commands/${fileName}`);
        if (Object.keys(command).length == 0) continue;
        commandList.push(command);
        if (!command.hidden)
            helpFields.push({ name: command.names.map(name => config.prefix + name).join(' - ') + (command.usage ? ' ' + command.usage : ''), value: command.description, priority: command.priority });
    }
    
    helpFields.sort((a, b) => b.priority - a.priority);
    helpFields = helpFields.map((field) => {
        delete field.priority;
        return field;
    });
    
    return { commandList, helpFields };
}

module.exports = { genCommandList, commandList, helpFields };