const crypto = require('crypto');
const { DEFAULT_PASSWORD_LENGTH, DEFAULT_PASSWORD_CHARSET } = require('../config/constants.cjs');

class PasswordGeneratorService {
    static generate(options = {}) {
        const {
            length = DEFAULT_PASSWORD_LENGTH,
            includeUppercase = true,
            includeLowercase = true,
            includeNumbers = true,
            includeSymbols = true,
            excludeSimilar = false,
            customCharset = null
        } = options;

        let charset = '';
        
        if (customCharset) {
            charset = customCharset;
        } else {
            if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
            if (includeNumbers) charset += '0123456789';
            if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
            
            if (excludeSimilar) {
                charset = charset.replace(/[il1Lo0O]/g, '');
            }
        }

        if (!charset) {
            throw new Error('至少需要选择一种字符类型');
        }

        let password = '';
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        
        for (let i = 0; i < length; i++) {
            password += charset[array[i] % charset.length];
        }

        return password;
    }

    static checkStrength(password) {
        let score = 0;
        const feedback = [];

        if (password.length < 8) {
            feedback.push('密码长度至少8位');
        } else if (password.length >= 12) {
            score += 2;
        } else {
            score += 1;
        }

        if (/[a-z]/.test(password)) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;

        if (/(.)\1{2,}/.test(password)) {
            score -= 1;
            feedback.push('避免重复字符');
        }

        if (/^(.)\1+$/.test(password)) {
            score -= 2;
            feedback.push('避免所有字符相同');
        }

        let strength;
        if (score <= 1) strength = 'weak';
        else if (score <= 3) strength = 'medium';
        else if (score <= 4) strength = 'strong';
        else strength = 'very-strong';

        return {
            score: Math.max(0, score),
            strength: strength,
            feedback: feedback
        };
    }

    static generatePassphrase(wordCount = 4, separator = '-') {
        const words = [
            'apple', 'banana', 'cherry', 'dragon', 'eagle', 'forest', 'garden', 'house',
            'island', 'jungle', 'knight', 'lemon', 'mountain', 'ocean', 'planet', 'queen',
            'river', 'sunset', 'tiger', 'umbrella', 'village', 'waterfall', 'xylophone', 'yellow'
        ];
        
        const selectedWords = [];
        for (let i = 0; i < wordCount; i++) {
            const randomIndex = Math.floor(Math.random() * words.length);
            selectedWords.push(words[randomIndex]);
        }
        
        return selectedWords.join(separator);
    }
}

module.exports = PasswordGeneratorService; 