const EncryptionService = require('./encryption.cjs');
const DataStorageService = require('./storage.cjs');
const MFAService = require('./mfa.cjs');

class AuthService {
    constructor() {
        this.storage = new DataStorageService();
    }

    isInitialized() {
        return this.storage.exists();
    }

    async initialize(password, deviceId) {
        try {
            console.log('开始初始化，密码长度:', password.length);
            
            if (!this.storage.exists()) {
                const key = EncryptionService.getKeyFromPassword(password, deviceId);
                
                console.log('生成MFA密钥...');
                const mfaSecret = MFAService.generateSecret();
                console.log('MFA密钥生成成功:', mfaSecret.base32);
                
                console.log('生成QR码...');
                let qrCode;
                try {
                    qrCode = await MFAService.generateQRCode(mfaSecret);
                    console.log('QR码生成成功，长度:', qrCode ? qrCode.length : 0);
                } catch (qrError) {
                    console.error('QR码生成失败:', qrError);
                    qrCode = null;
                }
                
                console.log('生成备份码...');
                const backupCodes = MFAService.generateBackupCodes();
                console.log('备份码生成成功，数量:', backupCodes.length);
                
                // 创建完整的数据结构，包含MFA配置
                const initialData = {
                    passwords: [],
                    mfaConfig: {
                        enabled: false, // 初始时MFA未启用
                        mfaSecret: mfaSecret.base32,
                        backupCodes: backupCodes
                    }
                };
                
                const result = this.storage.savePasswords(initialData, key);
                if (!result) {
                    return { success: false, message: '初始化密码存储失败' };
                }
                
                return { 
                    success: true, 
                    message: '初始化成功',
                    mfaSecret: mfaSecret.base32,
                    mfaQRCode: qrCode,
                    mfaBackupCodes: backupCodes
                };
            } else {
                return { success: false, message: '应用已经初始化过了' };
            }
        } catch (err) {
            console.error('初始化主密码失败:', err);
            return { success: false, message: '初始化失败: ' + err.message };
        }
    }

    async login(password, deviceId, mfaToken) {
        const key = EncryptionService.getKeyFromPassword(password, deviceId);
        try {
            const data = this.storage.loadPasswords(key);
            if (data === null) {
                return { success: false, message: '密码错误' };
            }
            
            // 处理旧的数据格式（直接是数组）和新格式（包含passwords和mfaConfig）
            let passwords, mfaConfig;
            if (Array.isArray(data)) {
                // 旧格式：直接是密码数组
                passwords = data;
                mfaConfig = null;
            } else {
                // 新格式：包含passwords和mfaConfig
                passwords = data.passwords || [];
                mfaConfig = data.mfaConfig;
            }
            
            if (mfaConfig && mfaConfig.enabled && mfaConfig.mfaSecret) {
                if (!mfaToken) {
                    return { success: false, message: '需要MFA验证', requiresMFA: true };
                }
                
                const isValidMFA = MFAService.verifyToken(mfaToken, mfaConfig.mfaSecret);
                if (!isValidMFA) {
                    return { success: false, message: 'MFA验证码错误' };
                }
            }
            
            return { 
                success: true, 
                message: '登录成功',
                key: key
            };
        } catch (err) {
            console.error('登录验证失败:', err);
            if (!this.storage.exists()) {
                return { success: false, message: '尚未设置密码' };
            }
            return { success: false, message: '验证失败' };
        }
    }

    async changeMasterPassword(oldPassword, newPassword, deviceId, currentKey) {
        try {
            const oldKey = EncryptionService.getKeyFromPassword(oldPassword, deviceId);
            const newKey = EncryptionService.getKeyFromPassword(newPassword, deviceId);
            
            const oldData = this.storage.loadPasswords(oldKey);
            if (oldData === null) {
                return { success: false, message: '当前密码错误' };
            }
            
            const result = this.storage.savePasswords(oldData, newKey);
            if (!result) {
                return { success: false, message: '密码更新失败' };
            }
            
            return { 
                success: true, 
                message: '主密码已成功更新',
                newKey: newKey
            };
        } catch (err) {
            console.error('修改主密码失败:', err);
            return { success: false, message: '修改密码失败: ' + err.message };
        }
    }

    async setupMFA(deviceId, currentKey) {
        try {
            const mfaSecret = MFAService.generateSecret();
            const qrCode = await MFAService.generateQRCode(mfaSecret);
            const backupCodes = MFAService.generateBackupCodes();
            
            return {
                success: true,
                mfaSecret: mfaSecret.base32,
                mfaQRCode: qrCode,
                mfaBackupCodes: backupCodes
            };
        } catch (err) {
            console.error('设置MFA失败:', err);
            return { success: false, message: '设置MFA失败: ' + err.message };
        }
    }

    async verifyMFA(token, secret) {
        try {
            const isValid = MFAService.verifyToken(token, secret);
            return {
                success: true,
                isValid: isValid
            };
        } catch (err) {
            console.error('验证MFA失败:', err);
            return { success: false, message: '验证MFA失败: ' + err.message };
        }
    }

    async validateBackupCode(code, backupCodes) {
        try {
            const isValid = MFAService.validateBackupCode(code, backupCodes);
            return {
                success: true,
                isValid: isValid
            };
        } catch (err) {
            console.error('验证备份码失败:', err);
            return { success: false, message: '验证备份码失败: ' + err.message };
        }
    }

    logout() {
        return { success: true, message: '已退出登录' };
    }
}

module.exports = AuthService; 