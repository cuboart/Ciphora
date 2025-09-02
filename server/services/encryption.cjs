const crypto = require('crypto');
const { ALGORITHM, SALT_LENGTH, IV_LENGTH } = require('../config/constants.cjs');

class EncryptionService {
    static getKeyFromPassword(password, salt) {
        return crypto.scryptSync(password, salt, SALT_LENGTH);
    }

    static encrypt(data, key) {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        const encrypted = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);
        
        return {
            iv: iv.toString('hex'),
            data: encrypted.toString('hex')
        };
    }

    static decrypt(encrypted, key) {
        const iv = Buffer.from(encrypted.iv, 'hex');
        const data = Buffer.from(encrypted.data, 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
        
        return decrypted.toString('utf8');
    }

    static generateRandomBytes(length) {
        return crypto.randomBytes(length);
    }

    static hash(data, algorithm = 'sha256') {
        return crypto.createHash(algorithm).update(data).digest('hex');
    }
}

module.exports = EncryptionService; 