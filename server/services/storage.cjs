const fs = require('fs');
const path = require('path');
const { USER_DATA_PATH, PASSWORD_FILE } = require('../config/constants.cjs');
const EncryptionService = require('./encryption.cjs');

class DataStorageService {
    constructor() {
        this.dataFile = path.join(USER_DATA_PATH, PASSWORD_FILE);
    }

    loadPasswords(key) {
        if (!fs.existsSync(this.dataFile)) {
            return [];
        }
        
        try {
            const encryptedContentStr = fs.readFileSync(this.dataFile, 'utf8');
            if (!encryptedContentStr) return [];
            
            const encryptedContent = JSON.parse(encryptedContentStr);
            const jsonStr = EncryptionService.decrypt(encryptedContent, key);
            return JSON.parse(jsonStr);
        } catch (err) {
            console.error('加载或解密失败:', err);
            return null;
        }
    }

    savePasswords(data, key) {
        try {
            const jsonStr = JSON.stringify(data);
            const encrypted = EncryptionService.encrypt(jsonStr, key);
            fs.writeFileSync(this.dataFile, JSON.stringify(encrypted), 'utf8');
            return true;
        } catch (err) {
            console.error('保存密码失败:', err);
            return false;
        }
    }

    clearAllData() {
        try {
            if (fs.existsSync(this.dataFile)) {
                fs.unlinkSync(this.dataFile);
            }
            return true;
        } catch (err) {
            console.error('清除数据失败:', err);
            return false;
        }
    }

    getDataFilePath() {
        return this.dataFile;
    }

    exists() {
        return fs.existsSync(this.dataFile);
    }
}

module.exports = DataStorageService; 