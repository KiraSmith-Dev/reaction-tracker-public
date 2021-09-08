const random = require('random');

var characters = 'ABCEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
function randomString(length) {
    var result = '';
    for ( var i = 0; i < length; i++ ) {
        result += characters[random.int(0, characters.length - 1)];
    }
    
    return result;
}

module.exports = { random, randomString };