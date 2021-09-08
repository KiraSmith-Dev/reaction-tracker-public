const { embed, embedSingle, embedOK, embedError } = require('../modules/embedHelper');
const { getUserReactionCount, typeToColor, getBalance } = require('../modules/utility');
const db = require('../modules/database').get();
const messages = db.collection('messages');
const users = db.collection('users');

async function coinTop(message) {
    let allUsers = await users.find();
    
    let userObjs = [];
    
    await allUsers.forEach(item => {
        userObjs.push({ username: item.username, coins: item.coins ? item.coins : 0 });
    });
    
    userObjs.sort((a, b) => b.coins - a.coins);
    
    let fields = [];
    for (let i = 0; i < userObjs.length; i++) {
        const user = userObjs[i];
        fields.push({ name: `#${i + 1}`, value: `${user.username}: ${user.coins}` });
    }
    
    message.channel.send(embed(`__Coin Leaderboard__`, fields));
}

module.exports = { function: coinTop, names: ['cointop', 'ctop'], description: 'Leaderboard for Doink Coins', priority: -1 };