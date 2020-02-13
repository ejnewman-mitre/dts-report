'use strict';

const crypto = require('crypto');

const ENCRYPTION_KEY = crypto.randomBytes(32); // Must be 256 bits (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16

function encrypt(text) {
 let iv = crypto.randomBytes(IV_LENGTH);
 let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
 let encrypted = cipher.update(text);

 encrypted = Buffer.concat([encrypted, cipher.final()]);

 return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
 let textParts = text.split(':');
 let iv = Buffer.from(textParts.shift(), 'hex');
 let encryptedText = Buffer.from(textParts.join(':'), 'hex');
 let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
 let decrypted = decipher.update(encryptedText);

 decrypted = Buffer.concat([decrypted, decipher.final()]);

 return decrypted.toString();
}

module.exports = { decrypt, encrypt };

let hw = encrypt("Some serious stuff")
console.log(hw)
console.log(typeof hw)

console.log(decrypt(hw))
console.log(decrypt('68ed3c942fa01bb11731b6fe0fd2dbe2:9c08681139c5b35177c15a5c4707ca682e8aa806a28dd6d74b6d2103a5b716fb'))


