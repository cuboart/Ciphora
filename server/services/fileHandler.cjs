const fs = require('fs');
const xlsx = require('xlsx');
const { dialog } = require('electron');

class FileHandlerService {
    static async selectFile(filters) {
        const result = await dialog.showOpenDialog({
            properties: ['openFile'],
            filters: filters
        });
        
        if (result.canceled) {
            return { success: false, message: '用户取消选择' };
        }
        
        return {
            success: true,
            filePath: result.filePaths[0]
        };
    }

    static async saveFile(filters) {
        const result = await dialog.showSaveDialog({
            filters: filters
        });
        
        if (result.canceled) {
            return { success: false, message: '用户取消保存' };
        }
        
        return {
            success: true,
            filePath: result.filePath
        };
    }

    static exportToExcel(passwords, filePath) {
        try {
            const workbook = xlsx.utils.book_new();
            const worksheet = xlsx.utils.json_to_sheet(passwords);
            xlsx.utils.book_append_sheet(workbook, worksheet, 'Passwords');
            xlsx.writeFile(workbook, filePath);
            return true;
        } catch (error) {
            console.error('导出Excel失败:', error);
            return false;
        }
    }

    static exportToCSV(passwords, filePath) {
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
            passwords.forEach(password => {
                csvContent += `${escapeField(password.website)},${escapeField(password.username)},${escapeField(password.password)},${escapeField(password.notes)},${escapeField(password.type)},${escapeField(password.secret)},${escapeField(password.base64Data)},${escapeField(password.stringData)},${escapeField(password.createdAt)},${escapeField(password.updatedAt)}\n`;
            });

            fs.writeFileSync(filePath, '\uFEFF' + csvContent, 'utf8');
            return true;
        } catch (error) {
            console.error('导出CSV失败:', error);
            return false;
        }
    }

    static readFile(filePath) {
        try {
            return fs.readFileSync(filePath, 'utf8');
        } catch (error) {
            console.error('读取文件失败:', error);
            return null;
        }
    }

    static writeFile(filePath, content) {
        try {
            fs.writeFileSync(filePath, content, 'utf8');
            return true;
        } catch (error) {
            console.error('写入文件失败:', error);
            return false;
        }
    }

    static getFileExtension(filePath) {
        return filePath.split('.').pop().toLowerCase();
    }

    static isValidFileType(filePath, allowedTypes) {
        const extension = this.getFileExtension(filePath);
        return allowedTypes.includes(extension);
    }
}

module.exports = FileHandlerService; 