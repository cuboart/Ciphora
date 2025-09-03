#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 获取版本号的优先级：
// 1. 环境变量 VERSION
// 2. Git tag (如果存在)
// 3. package.json 中的版本号
function getVersion() {
    // 检查环境变量
    if (process.env.VERSION) {
        return process.env.VERSION;
    }
    
    // 尝试从 Git tag 获取版本号
    try {
        // 使用跨平台兼容的 Git 命令
        const isWindows = process.platform === 'win32';
        let gitTag;
        
        if (isWindows) {
            // Windows 环境下的 Git 命令
            try {
                gitTag = execSync('git describe --tags --exact-match', { 
                    encoding: 'utf8',
                    stdio: ['pipe', 'pipe', 'ignore']
                }).trim();
            } catch {
                gitTag = execSync('git describe --tags --abbrev=0', { 
                    encoding: 'utf8',
                    stdio: ['pipe', 'pipe', 'ignore']
                }).trim();
            }
        } else {
            // Unix/Linux/macOS 环境下的 Git 命令
            gitTag = execSync('git describe --tags --exact-match 2>/dev/null || git describe --tags --abbrev=0 2>/dev/null', { 
                encoding: 'utf8'
            }).trim();
        }
        
        if (gitTag && gitTag.startsWith('v')) {
            return gitTag.substring(1); // 移除 'v' 前缀
        }
    } catch (error) {
        // Git 命令失败，忽略
        console.log('Git tag not found, using package.json version');
    }
    
    // 从 package.json 获取版本号
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    return packageJson.version;
}

const version = getVersion();
console.log(`Updating version to: ${version}`);

// 读取 SettingsView.jsx
const settingsViewPath = path.join(__dirname, '..', 'src', 'components', 'SettingsView.jsx');
let content = fs.readFileSync(settingsViewPath, 'utf8');

// 使用正则表达式替换硬编码的版本号
// 匹配 "版本: dev" 或 "版本: v1.2.0" 这种格式
const versionRegex = /版本:\s*(dev|v[\d.]+)/g;
content = content.replace(versionRegex, `版本: v${version}`);

// 写回文件
fs.writeFileSync(settingsViewPath, content, 'utf8');

console.log('Version updated successfully in SettingsView.jsx');
console.log(`Current version: v${version}`); 