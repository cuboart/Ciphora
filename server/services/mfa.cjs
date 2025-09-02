const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { MFA_BACKUP_CODES_COUNT, MFA_WINDOW } = require('../config/constants.cjs');

class MFAService {
    static generateSecret() {
        return speakeasy.generateSecret({
            name: 'Ciphora',
            issuer: 'Ciphora Password Manager'
        });
    }

    static generateTOTP(secret) {
        try {
            // 使用当前时间生成 TOTP，让 speakeasy 自动处理时间步长
            const token = speakeasy.totp({
                secret: secret,
                encoding: 'base32',
                time: Math.floor(Date.now() / 1000)
            });
            return { success: true, totp: token };
        } catch (error) {
            console.error('生成 TOTP 失败:', error);
            return { success: false, error: error.message };
        }
    }

    static verifyToken(token, secret) {
        return speakeasy.totp.verify({
            secret: secret,
            encoding: 'base32',
            token: token,
            window: MFA_WINDOW
        });
    }

    static async generateQRCode(secret) {
        try {
            return await QRCode.toDataURL(secret.otpauth_url);
        } catch (err) {
            console.error('生成QR码失败:', err);
            return null;
        }
    }

    static generateBackupCodes() {
        const codes = [];
        for (let i = 0; i < MFA_BACKUP_CODES_COUNT; i++) {
            codes.push(this.generateRandomCode());
        }
        return codes;
    }

    static generateRandomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    static validateBackupCode(code, backupCodes) {
        return backupCodes.includes(code.toUpperCase());
    }
}

module.exports = MFAService; 