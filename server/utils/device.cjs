const fs = require('fs');
const path = require('path');
const { USER_PATH, APP_ID_FILE_EXT } = require('../config/constants.cjs');

class DeviceManager {
    // 异步获取或创建设备ID
    static async getOrCreateDeviceIdAsync() {
        try {
            const appIdPath = path.join(USER_PATH, APP_ID_FILE_EXT);
            
            // 检查文件是否存在
            if (fs.existsSync(appIdPath)) {
                const deviceId = await fs.promises.readFile(appIdPath, 'utf8');
                if (deviceId && deviceId.trim()) {
                    return deviceId.trim();
                }
            }
            
            // 如果文件不存在或为空，创建新的设备ID
            const deviceId = this.generateUUID();
            await this.saveDeviceIdAsync(appIdPath, deviceId);
            return deviceId;
        } catch (error) {
            console.error('异步获取设备ID失败:', error);
            // 返回生成的UUID作为后备
            return this.generateUUID();
        }
    }

    // 同步获取或创建设备ID（保持向后兼容）
    static getOrCreateDeviceId() {
        try {
            const appIdPath = path.join(USER_PATH, APP_ID_FILE_EXT);
            
            if (fs.existsSync(appIdPath)) {
                const deviceId = fs.readFileSync(appIdPath, 'utf8');
                if (deviceId && deviceId.trim()) {
                    return deviceId.trim();
                }
            }
            
            const deviceId = this.generateUUID();
            this.saveDeviceIdSync(appIdPath, deviceId);
            return deviceId;
        } catch (error) {
            console.error('同步获取设备ID失败:', error);
            return this.generateUUID();
        }
    }

    // 异步保存设备ID
    static async saveDeviceIdAsync(filePath, deviceId) {
        try {
            // 确保目录存在
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) {
                await fs.promises.mkdir(dir, { recursive: true });
            }
            
            await fs.promises.writeFile(filePath, deviceId, 'utf8');
            console.log('设备ID已异步保存到:', filePath);
        } catch (error) {
            console.error('异步保存设备ID失败:', error);
            throw error;
        }
    }

    // 同步保存设备ID（保持向后兼容）
    static saveDeviceIdSync(filePath, deviceId) {
        try {
            // 确保目录存在
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            fs.writeFileSync(filePath, deviceId, 'utf8');
            console.log('设备ID已保存到:', filePath);
        } catch (error) {
            console.error('保存设备ID失败:', error);
            throw error;
        }
    }

    // 生成UUID
    static generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // 验证设备ID格式
    static isValidDeviceId(deviceId) {
        if (!deviceId || typeof deviceId !== 'string') {
            return false;
        }
        
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(deviceId);
    }

    // 获取设备ID文件路径
    static getDeviceIdFilePath() {
        return path.join(USER_PATH, APP_ID_FILE_EXT);
    }

    // 检查设备ID文件是否存在
    static deviceIdFileExists() {
        try {
            const filePath = this.getDeviceIdFilePath();
            return fs.existsSync(filePath);
        } catch (error) {
            console.error('检查设备ID文件失败:', error);
            return false;
        }
    }
}

module.exports = DeviceManager; 