const DeviceManager = require('../utils/device.cjs');
const fs = require('fs');
const path = require('path');
const { USER_DATA_PATH } = require('../config/constants.cjs');

class AppStateManager {
    constructor() {
        this.mainWindow = null;
        this.currentKey = null;
        this.deviceId = null;
        this.isInitialized = false;
        this.isLoading = true;
        this.settingsPath = path.join(USER_DATA_PATH, 'settings.json');
        this.settings = null;
        this.initPromise = null;
    }

    // 异步初始化
    async initialize() {
        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = this._performInitialization();
        return this.initPromise;
    }

    async _performInitialization() {
        try {
            console.log('开始初始化 AppStateManager...');
            this.isLoading = true;

            // 异步初始化设备ID
            this.deviceId = await DeviceManager.getOrCreateDeviceIdAsync();
            console.log('设备ID初始化完成:', this.deviceId);

            // 异步加载设置
            this.settings = await this.loadSettingsAsync();
            console.log('设置加载完成');

            this.isInitialized = true;
            console.log('AppStateManager 初始化完成');
        } catch (error) {
            console.error('AppStateManager 初始化失败:', error);
            // 使用默认值作为后备
            this.deviceId = DeviceManager.generateUUID();
            this.settings = this.loadDefaultSettings();
        } finally {
            this.isLoading = false;
        }
    }

    // 检查是否正在加载
    isLoading() {
        return this.isLoading;
    }

    // 等待初始化完成
    async waitForInitialization() {
        if (!this.isInitialized) {
            await this.initialize();
        }
        return true;
    }

    setMainWindow(window) {
        this.mainWindow = window;
    }

    getMainWindow() {
        return this.mainWindow;
    }

    setCurrentKey(key) {
        this.currentKey = key;
        this.isInitialized = !!key;
    }

    getCurrentKey() {
        return this.currentKey;
    }

    isAuthenticated() {
        return !!this.currentKey;
    }

    clearAuth() {
        this.currentKey = null;
        this.isInitialized = false;
    }

    async getDeviceId() {
        await this.waitForInitialization();
        return this.deviceId;
    }

    isAppInitialized() {
        return this.isInitialized;
    }

    async getSettings() {
        await this.waitForInitialization();
        return this.settings;
    }

    async updateSetting(key, value) {
        await this.waitForInitialization();
        this.settings[key] = value;
        await this.saveSettingsAsync();
    }

    // 异步加载设置
    async loadSettingsAsync() {
        try {
            // 确保数据目录存在
            const dataDir = path.dirname(this.settingsPath);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }

            // 如果设置文件存在，异步加载它
            if (fs.existsSync(this.settingsPath)) {
                const settingsData = await fs.promises.readFile(this.settingsPath, 'utf8');
                const savedSettings = JSON.parse(settingsData);
                // 合并默认设置和保存的设置
                return { ...this.loadDefaultSettings(), ...savedSettings };
            }
        } catch (error) {
            console.error('异步加载设置失败:', error);
        }
        
        // 如果加载失败，返回默认设置
        return this.loadDefaultSettings();
    }

    // 异步保存设置
    async saveSettingsAsync() {
        try {
            // 确保数据目录存在
            const dataDir = path.dirname(this.settingsPath);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }

            // 异步保存设置到文件
            await fs.promises.writeFile(this.settingsPath, JSON.stringify(this.settings, null, 2), 'utf8');
            console.log('设置已异步保存到:', this.settingsPath);
        } catch (error) {
            console.error('异步保存设置失败:', error);
        }
    }

    // 同步加载设置（保持向后兼容）
    loadSettings() {
        try {
            // 确保数据目录存在
            const dataDir = path.dirname(this.settingsPath);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }

            // 如果设置文件存在，加载它
            if (fs.existsSync(this.settingsPath)) {
                const settingsData = fs.readFileSync(this.settingsPath, 'utf8');
                const savedSettings = JSON.parse(settingsData);
                // 合并默认设置和保存的设置
                return { ...this.loadDefaultSettings(), ...savedSettings };
            }
        } catch (error) {
            console.error('加载设置失败:', error);
        }
        
        // 如果加载失败，返回默认设置
        return this.loadDefaultSettings();
    }

    // 同步保存设置（保持向后兼容）
    saveSettings() {
        try {
            // 确保数据目录存在
            const dataDir = path.dirname(this.settingsPath);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }

            // 保存设置到文件
            fs.writeFileSync(this.settingsPath, JSON.stringify(this.settings, null, 2), 'utf8');
            console.log('设置已保存到:', this.settingsPath);
        } catch (error) {
            console.error('保存设置失败:', error);
        }
    }

    loadDefaultSettings() {
        return {
            // 安全设置
            autoLock: {
                enabled: true,
                timeout: 1800000, // 30分钟 (30 * 60 * 1000)
                onMinimize: true,
                onBlur: false
            },
            // 密码生成设置
            passwordGenerator: {
                defaultLength: 16,
                includeUppercase: true,
                includeLowercase: true,
                includeNumbers: true,
                includeSymbols: true,
                excludeSimilar: true, // 默认排除相似字符
                customCharset: ''
            },
            // 界面设置
            ui: {
                hideSensitiveButtons: true, // 默认隐藏敏感按钮
                showPasswordStrength: true,
                compactMode: false,
                theme: 'system' // system, light, dark
            },
            // MFA设置
            mfa: {
                enabled: false,
                secret: null,
                backupCodes: []
            },
            // 导入导出设置
            importExport: {
                autoBackup: true,
                backupInterval: 86400000, // 24小时
                lastBackup: null
            }
        };
    }

    // 获取应用信息
    async getAppInfo() {
        await this.waitForInitialization();
        return {
            name: 'Ciphora',
            version: '1.0.0',
            description: '安全密码管理器',
            author: 'Ciphora Team',
            deviceId: this.deviceId,
            isInitialized: this.isInitialized,
            isAuthenticated: this.isAuthenticated()
        };
    }

    // 获取系统信息
    getSystemInfo() {
        return {
            platform: process.platform,
            arch: process.arch,
            nodeVersion: process.version,
            electronVersion: process.versions.electron,
            chromeVersion: process.versions.chrome
        };
    }

    // 重置所有设置
    async resetSettings() {
        await this.waitForInitialization();
        this.settings = this.loadDefaultSettings();
        await this.saveSettingsAsync();
        return { success: true, message: '设置已重置为默认值' };
    }

    // 导出设置
    async exportSettings() {
        try {
            await this.waitForInitialization();
            const exportData = {
                version: '1.0',
                exportDate: new Date().toISOString(),
                settings: this.settings,
                deviceId: this.deviceId
            };
            return { success: true, data: exportData };
        } catch (error) {
            return { success: false, message: '导出设置失败: ' + error.message };
        }
    }

    // 导入设置
    async importSettings(settingsData) {
        try {
            await this.waitForInitialization();
            if (settingsData.version && settingsData.settings) {
                this.settings = { ...this.loadDefaultSettings(), ...settingsData.settings };
                await this.saveSettingsAsync();
                return { success: true, message: '设置导入成功' };
            } else {
                return { success: false, message: '无效的设置文件格式' };
            }
        } catch (error) {
            return { success: false, message: '导入设置失败: ' + error.message };
        }
    }
}

module.exports = AppStateManager; 