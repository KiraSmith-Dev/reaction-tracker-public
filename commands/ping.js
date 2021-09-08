function ping(message) {
    message.channel.send('Pong!');
}

module.exports = { function: ping, names: ['ping'], description: 'Ping Pong', priority: -9 };