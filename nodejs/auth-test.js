const crypto = require('crypto');
var sh= crypto.createHash('sha512').update('1234').digest('base64');
console.log(sh)