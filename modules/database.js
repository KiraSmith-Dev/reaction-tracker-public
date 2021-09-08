const MongoClient = require('mongodb').MongoClient;

let db = null;

// Connecting to mongo
async function startCon() {
    let client = await MongoClient.connect('-login-details-censored-', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    db = client.db('HeartBotV2');
    return db;
}

// Connect to mongo if needed, and then return the db
function getDB() {
    if (!db) throw new Error('Tried to get DB before initilizing');
    return db;
}

module.exports = { init: startCon, get: getDB };