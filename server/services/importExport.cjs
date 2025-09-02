const crypto = require('crypto');
const FileHandlerService = require('./fileHandler.cjs');
const DataStorageService = require('./storage.cjs');
const EncryptionService = require('./encryption.cjs');

class ImportExportService {
    constructor() {
        this.storage = new DataStorageService();
    }

    async importPasswords(filePath, fileType, currentKey) {
        if (!currentKey) {
            return { success: false, message: '未验证身份' };
        }

        try {
            let importedPasswords = [];
            
            if (fileType === 'excel') {
                const workbook = require('xlsx').readFile(filePath);
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const rawData = require('xlsx').utils.sheet_to_json(worksheet);
                // 确保每个导入的密码都有正确的类型字段
                importedPasswords = rawData.map(item => ({
                    ...item,
                    type: item.type || 'password' // 如果没有type字段，默认为password
                }));
            } else if (fileType === 'text') {
                const content = FileHandlerService.readFile(filePath);
                if (!content) {
                    return { success: false, message: '读取文件失败' };
                }
                
                const lines = content.split('\n').filter(line => line.trim());
                importedPasswords = lines.map(line => {
                    const [website, username, password, notes] = line.split(',').map(field => field.trim());
                    return { website, username, password, notes, type: 'password' };
                });
            } else if (fileType === 'ciphora') {
                const encryptedContent = FileHandlerService.readFile(filePath);
                if (!encryptedContent) {
                    return { success: false, message: '读取文件失败' };
                }
                
                const backupData = JSON.parse(encryptedContent);
                
                if (!backupData.encrypted || !backupData.iv || !backupData.version) {
                    return { success: false, message: '无效的Ciphora备份文件格式' };
                }
                
                return { 
                    success: false, 
                    requiresPassword: true, 
                    message: '需要备份文件密码',
                    backupData: backupData 
                };
            }

            // 分析导入数据，检测冲突
            const analysis = this.analyzeImportData(importedPasswords, currentKey);
            
            return {
                success: true,
                requiresPreview: true,
                message: '需要预览导入数据',
                analysis: analysis
            };
        } catch (err) {
            console.error('导入密码失败:', err);
            return { success: false, message: `导入失败: ${err.message}` };
        }
    }

    async exportPasswords(filePath, fileType, currentKey) {
        if (!currentKey) {
            return { success: false, message: '未验证身份' };
        }

        try {
            const passwords = this.storage.loadPasswords(currentKey) || [];
            
            if (fileType === 'excel') {
                const result = FileHandlerService.exportToExcel(passwords, filePath);
                if (!result) {
                    return { success: false, message: '导出Excel失败' };
                }
            } else if (fileType === 'text') {
                const result = FileHandlerService.exportToCSV(passwords, filePath);
                if (!result) {
                    return { success: false, message: '导出CSV失败' };
                }
            } else if (fileType === 'ciphora') {
                const backupData = {
                    version: '1.0',
                    exportDate: new Date().toISOString(),
                    passwords: passwords
                };
                
                const encrypted = EncryptionService.encrypt(JSON.stringify(passwords), currentKey);
                const backupFile = {
                    version: '1.0',
                    encrypted: encrypted.data,
                    iv: encrypted.iv,
                    exportDate: new Date().toISOString()
                };
                
                const result = FileHandlerService.writeFile(filePath, JSON.stringify(backupFile, null, 2));
                if (!result) {
                    return { success: false, message: '导出Ciphora备份失败' };
                }
            }

            return { success: true, message: `成功导出 ${passwords.length} 条记录` };
        } catch (err) {
            console.error('导出密码失败:', err);
            return { success: false, message: `导出失败: ${err.message}` };
        }
    }

    analyzeImportData(importedPasswords, currentKey) {
        const existingPasswords = this.storage.loadPasswords(currentKey) || [];
        const conflicts = [];
        const newData = [];
        
        // 创建现有数据的映射
        const existingMap = new Map();
        existingPasswords.forEach(p => {
            const key = `${p.website}|${p.username}`;
            existingMap.set(key, p);
        });

        importedPasswords.forEach(importedPassword => {
            const key = `${importedPassword.website}|${importedPassword.username}`;
            const existing = existingMap.get(key);
            
            if (existing) {
                // 检测冲突
                conflicts.push({
                    imported: importedPassword,
                    existing: existing,
                    key: key
                });
            } else {
                // 新数据
                newData.push(importedPassword);
            }
        });

        return {
            total: importedPasswords.length,
            new: newData,
            conflicts: conflicts,
            existing: existingPasswords
        };
    }

    async processImportWithResolution(importData, resolution, currentKey) {
        try {
            const { mode, conflicts } = resolution;
            const existingPasswords = this.storage.loadPasswords(currentKey) || [];
            let finalPasswords = [...existingPasswords];

            if (mode === 'replace') {
                // 完全替换模式
                finalPasswords = importData;
            } else if (mode === 'add') {
                // 仅添加新数据模式
                const existingKeys = existingPasswords.map(p => `${p.website}|${p.username}`);
                const newData = importData.filter(item => 
                    !existingKeys.includes(`${item.website}|${item.username}`)
                );
                finalPasswords = [...existingPasswords, ...newData];
            } else if (mode === 'update') {
                // 智能更新模式
                const existingMap = new Map();
                existingPasswords.forEach(p => {
                    const key = `${p.website}|${p.username}`;
                    existingMap.set(key, p);
                });

                // 处理冲突
                Object.entries(conflicts).forEach(([key, choice]) => {
                    const conflict = importData.find(item => item.id === key);
                    if (conflict && choice === 'replace') {
                        // 用导入数据替换现有数据
                        const existingKey = `${conflict.website}|${conflict.username}`;
                        const index = finalPasswords.findIndex(p => 
                            `${p.website}|${p.username}` === existingKey
                        );
                        if (index !== -1) {
                            finalPasswords[index] = conflict;
                        }
                    }
                });

                // 添加新数据
                const existingKeys = finalPasswords.map(p => `${p.website}|${p.username}`);
                const newData = importData.filter(item => 
                    !existingKeys.includes(`${item.website}|${item.username}`)
                );
                finalPasswords = [...finalPasswords, ...newData];
            }

            const result = this.storage.savePasswords(finalPasswords, currentKey);
            if (result) {
                return {
                    success: true,
                    message: `成功导入 ${importData.length} 条记录`,
                    importedCount: importData.length
                };
            } else {
                return { success: false, message: '保存导入的密码失败' };
            }
        } catch (err) {
            console.error('处理导入失败:', err);
            return { success: false, message: `导入失败: ${err.message}` };
        }
    }

    async createBackup(backupPassword, currentKey) {
        if (!currentKey) {
            return { success: false, message: '未验证身份' };
        }

        try {
            const passwords = this.storage.loadPasswords(currentKey) || [];
            
            // 从备份密码生成正确的密钥
            const salt = crypto.randomBytes(16); // 生成随机盐
            const backupKey = EncryptionService.getKeyFromPassword(backupPassword, salt);
            
            const encrypted = EncryptionService.encrypt(JSON.stringify(passwords), backupKey);
            
            const backupFile = {
                version: '1.0',
                encrypted: encrypted.data,
                iv: encrypted.iv,
                salt: salt.toString('hex'), // 存储盐值用于解密
                exportDate: new Date().toISOString()
            };
            
            return { success: true, backupData: backupFile };
        } catch (err) {
            console.error('创建备份失败:', err);
            return { success: false, message: `创建备份失败: ${err.message}` };
        }
    }



    async restoreBackup(backupData, backupPassword, currentKey) {
        if (!currentKey) {
            return { success: false, message: '未验证身份' };
        }

        try {
            let decryptedContent;
            
            // 检查是否有盐值（新版本备份文件）
            if (backupData.salt) {
                // 从备份密码和盐值生成正确的密钥
                const salt = Buffer.from(backupData.salt, 'hex');
                const backupKey = EncryptionService.getKeyFromPassword(backupPassword, salt);
                
                decryptedContent = EncryptionService.decrypt({
                    iv: backupData.iv,
                    data: backupData.encrypted
                }, backupKey);
            } else {
                // 兼容旧版本备份文件（直接使用密码作为密钥）
                decryptedContent = EncryptionService.decrypt({
                    iv: backupData.iv,
                    data: backupData.encrypted
                }, backupPassword);
            }
            
            const backupPasswords = JSON.parse(decryptedContent);
            const result = this.storage.savePasswords(backupPasswords, currentKey);
            
            if (result) {
                return {
                    success: true,
                    message: `成功恢复 ${backupPasswords.length} 条记录`,
                    restoredCount: backupPasswords.length
                };
            } else {
                return { success: false, message: '恢复备份失败' };
            }
        } catch (err) {
            console.error('恢复备份失败:', err);
            return { success: false, message: '备份文件密码错误或文件损坏' };
        }
    }

    async getExportFormats() {
        return [
            { id: 'excel', name: 'Excel文件 (.xlsx)', extension: '.xlsx' },
            { id: 'text', name: 'CSV文件 (.csv)', extension: '.csv' },
            { id: 'ciphora', name: 'Ciphora备份 (.ciphora)', extension: '.ciphora' }
        ];
    }

    async getImportFormats() {
        return [
            { id: 'excel', name: 'Excel文件 (.xlsx, .xls)', extensions: ['.xlsx', '.xls'] },
            { id: 'text', name: 'CSV文件 (.csv, .txt)', extensions: ['.csv', '.txt'] },
            { id: 'ciphora', name: 'Ciphora备份 (.ciphora)', extensions: ['.ciphora'] }
        ];
    }

    async generateImportTemplate(templateType) {
        try {
            const templateData = this.createTemplateData(templateType);
            
            if (templateType === 'excel') {
                return await this.generateExcelTemplate(templateData);
            } else if (templateType === 'csv') {
                return await this.generateCSVTemplate(templateData);
            } else {
                return { success: false, message: '不支持的模板类型' };
            }
        } catch (err) {
            console.error('生成模板失败:', err);
            return { success: false, message: `生成模板失败: ${err.message}` };
        }
    }

    createTemplateData(templateType) {
        const baseData = [
            {
                website: 'example.com',
                username: 'user@example.com',
                password: 'your_password_here',
                notes: '示例备注',
                type: 'password',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                website: 'github.com',
                username: 'your_username',
                password: 'your_github_password',
                notes: 'GitHub账户',
                type: 'password',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                website: 'Google Authenticator',
                username: 'your_email@example.com',
                secret: 'JBSWY3DPEHPK3PXP',
                notes: 'MFA验证码',
                type: 'mfa',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];

        return baseData;
    }

    async generateExcelTemplate(templateData) {
        try {
            const xlsx = require('xlsx');
            const workbook = xlsx.utils.book_new();
            const worksheet = xlsx.utils.json_to_sheet(templateData);
            
            // 设置列宽
            const colWidths = [
                { wch: 20 }, // website
                { wch: 25 }, // username
                { wch: 20 }, // password
                { wch: 30 }, // notes
                { wch: 15 }, // type
                { wch: 20 }, // createdAt
                { wch: 20 }  // updatedAt
            ];
            worksheet['!cols'] = colWidths;

            xlsx.utils.book_append_sheet(workbook, worksheet, '密码模板');
            
            // 生成Excel文件内容
            const excelBuffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
            
            return {
                success: true,
                data: excelBuffer,
                filename: 'Ciphora导入模板.xlsx',
                mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            };
        } catch (err) {
            console.error('生成Excel模板失败:', err);
            return { success: false, message: '生成Excel模板失败' };
        }
    }

    async generateCSVTemplate(templateData) {
        try {
            const escapeField = (field) => {
                if (!field) return '';
                const str = String(field);
                if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            };

            let csvContent = '网站,用户名,密码,备注,数据类型,MFA密钥,Base64数据,字符串数据,创建时间,更新时间\n';
            templateData.forEach(item => {
                csvContent += `${escapeField(item.website)},${escapeField(item.username)},${escapeField(item.password)},${escapeField(item.notes)},${escapeField(item.type)},${escapeField(item.secret)},${escapeField(item.base64Data)},${escapeField(item.stringData)},${escapeField(item.createdAt)},${escapeField(item.updatedAt)}\n`;
            });

            return {
                success: true,
                data: Buffer.from('\uFEFF' + csvContent, 'utf8'), // 添加BOM以支持中文
                filename: 'Ciphora导入模板.csv',
                mimeType: 'text/csv;charset=utf-8'
            };
        } catch (err) {
            console.error('生成CSV模板失败:', err);
            return { success: false, message: '生成CSV模板失败' };
        }
    }
}

module.exports = ImportExportService; 