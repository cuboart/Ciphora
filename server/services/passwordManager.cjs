const DataStorageService = require('./storage.cjs');
const EncryptionService = require('./encryption.cjs');

class PasswordManagerService {
    constructor() {
        this.storage = new DataStorageService();
    }

    async addPassword(item, currentKey) {
        if (!currentKey) {
            return { success: false, message: '未验证身份' };
        }

        try {
            const data = this.storage.loadPasswords(currentKey);
            if (data === null) {
                return { success: false, message: '数据加载失败' };
            }
            
            // 处理旧的数据格式（直接是数组）和新格式（包含passwords和mfaConfig）
            let passwords, mfaConfig;
            if (Array.isArray(data)) {
                passwords = data;
                mfaConfig = null;
            } else {
                passwords = data.passwords || [];
                mfaConfig = data.mfaConfig;
            }
            
            const newItem = {
                ...item,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                dataType: item.dataType || 'password'
            };
            
            passwords.push(newItem);
            
            // 保存时保持数据结构
            const saveData = mfaConfig ? { passwords, mfaConfig } : passwords;
            const result = this.storage.savePasswords(saveData, currentKey);
            return result ? { success: true } : { success: false, message: '保存失败' };
        } catch (err) {
            console.error('添加密码失败:', err);
            return { success: false, message: '添加失败' };
        }
    }

    async updatePassword(id, item, currentKey) {
        if (!currentKey) {
            return { success: false, message: '未验证身份' };
        }

        try {
            const data = this.storage.loadPasswords(currentKey);
            if (data === null) {
                return { success: false, message: '数据加载失败' };
            }
            
            // 处理旧的数据格式（直接是数组）和新格式（包含passwords和mfaConfig）
            let passwords, mfaConfig;
            if (Array.isArray(data)) {
                passwords = data;
                mfaConfig = null;
            } else {
                passwords = data.passwords || [];
                mfaConfig = data.mfaConfig;
            }
            
            const index = parseInt(id);
            
            if (index >= 0 && index < passwords.length) {
                passwords[index] = {
                    ...item,
                    createdAt: passwords[index].createdAt || new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    dataType: item.dataType || passwords[index].dataType || 'password'
                };
                
                // 保存时保持数据结构
                const saveData = mfaConfig ? { passwords, mfaConfig } : passwords;
                const result = this.storage.savePasswords(saveData, currentKey);
                return result ? { success: true } : { success: false, message: '保存失败' };
            } else {
                return { success: false, message: '索引无效' };
            }
        } catch (err) {
            console.error('更新密码失败:', err);
            return { success: false, message: '更新失败' };
        }
    }

    async deletePassword(id, currentKey) {
        if (!currentKey) {
            return { success: false, message: '未验证身份' };
        }

        try {
            const data = this.storage.loadPasswords(currentKey);
            if (data === null) {
                return { success: false, message: '数据加载失败' };
            }
            
            // 处理旧的数据格式（直接是数组）和新格式（包含passwords和mfaConfig）
            let passwords, mfaConfig;
            if (Array.isArray(data)) {
                passwords = data;
                mfaConfig = null;
            } else {
                passwords = data.passwords || [];
                mfaConfig = data.mfaConfig;
            }
            
            const index = parseInt(id);
            
            if (index >= 0 && index < passwords.length) {
                passwords.splice(index, 1);
                
                // 保存时保持数据结构
                const saveData = mfaConfig ? { passwords, mfaConfig } : passwords;
                const result = this.storage.savePasswords(saveData, currentKey);
                return result ? { success: true } : { success: false, message: '保存失败' };
            } else {
                return { success: false, message: '索引无效' };
            }
        } catch (err) {
            console.error('删除密码失败:', err);
            return { success: false, message: '删除失败' };
        }
    }

    async getPasswords(currentKey) {
        if (!currentKey) {
            return { success: false, message: '未验证身份' };
        }

        try {
            const data = this.storage.loadPasswords(currentKey);
            if (data === null) {
                return [];
            }
            
            // 处理旧的数据格式（直接是数组）和新格式（包含passwords和mfaConfig）
            let passwords;
            if (Array.isArray(data)) {
                passwords = data;
            } else {
                passwords = data.passwords || [];
            }
            
            const passwordsWithId = passwords.map((item, index) => ({
                ...item,
                id: index.toString()
            }));
            return passwordsWithId;
        } catch (err) {
            console.error('加载密码列表失败:', err);
            return [];
        }
    }

    async getPassword(id, currentKey) {
        if (!currentKey) {
            return { success: false, message: '未验证身份' };
        }

        try {
            const data = this.storage.loadPasswords(currentKey);
            if (data === null) {
                return { success: false, message: '数据加载失败' };
            }
            
            // 处理旧的数据格式（直接是数组）和新格式（包含passwords和mfaConfig）
            let passwords;
            if (Array.isArray(data)) {
                passwords = data;
            } else {
                passwords = data.passwords || [];
            }
            
            const index = parseInt(id);
            
            if (index >= 0 && index < passwords.length) {
                return { success: true, password: passwords[index] };
            } else {
                return { success: false, message: '索引无效' };
            }
        } catch (err) {
            console.error('获取密码失败:', err);
            return { success: false, message: '获取失败' };
        }
    }

    async clearAllPasswords(currentKey) {
        if (!currentKey) {
            return { success: false, message: '未验证身份' };
        }

        try {
            const result = this.storage.savePasswords([], currentKey);
            return result ? { success: true } : { success: false, message: '清空失败' };
        } catch (err) {
            console.error('清空密码失败:', err);
            return { success: false, message: '清空失败' };
        }
    }

    async searchPasswords(searchTerm, currentKey) {
        if (!currentKey) {
            return { success: false, message: '未验证身份' };
        }

        try {
            const list = this.storage.loadPasswords(currentKey) || [];
            const results = list.filter(item => {
                const searchLower = searchTerm.toLowerCase();
                return (
                    (item.website && item.website.toLowerCase().includes(searchLower)) ||
                    (item.username && item.username.toLowerCase().includes(searchLower)) ||
                    (item.notes && item.notes.toLowerCase().includes(searchLower))
                );
            });
            
            const passwordsWithId = results.map((item, index) => ({
                ...item,
                id: index.toString()
            }));
            
            return { success: true, results: passwordsWithId };
        } catch (err) {
            console.error('搜索密码失败:', err);
            return { success: false, message: '搜索失败' };
        }
    }

    async getStatistics(currentKey) {
        if (!currentKey) {
            return { success: false, message: '未验证身份' };
        }

        try {
            const list = this.storage.loadPasswords(currentKey) || [];
            const stats = {
                totalEntries: list.length,
                byType: {},
                byWebsite: {},
                recentActivity: []
            };

            list.forEach(item => {
                // 按类型统计
                const type = item.dataType || 'password';
                stats.byType[type] = (stats.byType[type] || 0) + 1;

                // 按网站统计
                if (item.website) {
                    stats.byWebsite[item.website] = (stats.byWebsite[item.website] || 0) + 1;
                }

                // 最近活动
                if (item.updatedAt) {
                    stats.recentActivity.push({
                        id: item.id,
                        website: item.website,
                        action: 'updated',
                        timestamp: item.updatedAt
                    });
                }
            });

            // 排序最近活动
            stats.recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            stats.recentActivity = stats.recentActivity.slice(0, 10);

            return { success: true, stats };
        } catch (err) {
            console.error('获取统计信息失败:', err);
            return { success: false, message: '获取统计信息失败' };
        }
    }
}

module.exports = PasswordManagerService; 