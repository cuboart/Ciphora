# Ciphora 后端服务架构

## 概述

Ciphora 的后端服务采用模块化架构设计，将不同功能分离到独立的服务模块中，提高代码的可维护性和可扩展性。

## 目录结构

```
server/
├── config/          # 配置文件
│   └── constants.js # 应用常量
├── services/        # 核心服务
│   ├── appState.js      # 应用状态管理
│   ├── auth.js          # 认证服务
│   ├── encryption.js    # 加密服务
│   ├── fileHandler.js   # 文件处理服务
│   ├── importExport.js  # 导入导出服务
│   ├── ipcHandler.js    # IPC处理器
│   ├── mfa.js           # MFA服务
│   ├── passwordGenerator.js # 密码生成服务
│   ├── passwordManager.js   # 密码管理服务
│   ├── storage.js       # 数据存储服务
│   └── windowManager.js # 窗口管理服务
├── utils/           # 工具函数
│   └── device.js   # 设备管理工具
└── README.md        # 本文档
```

## 核心服务模块

### 1. 应用状态管理 (appState.js)

管理应用的全局状态，包括：
- 当前用户认证状态
- 应用设置
- 设备ID管理
- 窗口引用

### 2. 认证服务 (auth.js)

处理用户认证相关功能：
- 主密码初始化
- 用户登录验证
- 主密码修改
- MFA设置和验证

### 3. 加密服务 (encryption.js)

提供数据加密解密功能：
- AES-256-CBC 加密
- 密码派生 (PBKDF2)
- 随机数生成
- 哈希计算

### 4. 数据存储服务 (storage.js)

管理密码数据的持久化：
- 加密数据读写
- 文件存在性检查
- 数据清理

### 5. 密码管理服务 (passwordManager.js)

处理密码的CRUD操作：
- 添加/更新/删除密码
- 密码搜索
- 统计信息
- 批量操作

### 6. 导入导出服务 (importExport.js)

处理数据导入导出：
- 支持多种格式 (Excel, CSV, Ciphora)
- 数据合并和冲突处理
- 备份和恢复

### 7. MFA服务 (mfa.js)

多因素认证功能：
- TOTP密钥生成
- QR码生成
- 备份码管理
- 验证逻辑

### 8. 密码生成服务 (passwordGenerator.js)

密码生成和强度检查：
- 可配置的密码生成
- 密码强度评估
- 密码短语生成

### 9. 文件处理服务 (fileHandler.js)

文件操作相关：
- 文件选择对话框
- Excel/CSV导出
- 文件类型验证

### 10. 窗口管理服务 (windowManager.js)

主窗口管理：
- 窗口创建和配置
- 开发/生产模式切换
- 窗口事件处理

### 11. IPC处理器 (ipcHandler.js)

统一管理所有IPC通信：
- 认证处理器
- 密码管理处理器
- 导入导出处理器
- 工具功能处理器
- 设置处理器

## 配置管理

### 常量配置 (config/constants.js)

集中管理应用配置：
- 文件路径配置
- 加密算法参数
- 默认值设置
- 环境相关配置

## 工具函数

### 设备管理 (utils/device.js)

设备相关功能：
- 设备ID生成和管理
- UUID生成

## 架构特点

### 1. 模块化设计
- 每个服务都有明确的职责
- 服务间通过接口通信
- 易于测试和维护

### 2. 依赖注入
- 服务通过构造函数注入依赖
- 降低模块间耦合
- 便于单元测试

### 3. 错误处理
- 统一的错误处理机制
- 详细的错误日志
- 用户友好的错误消息

### 4. 安全性
- 所有敏感操作都需要认证
- 数据加密存储
- 安全的IPC通信

### 5. 可扩展性
- 新功能可以轻松添加新服务
- 现有服务可以独立升级
- 支持插件化架构

## 使用示例

### 创建服务实例

```javascript
const AuthService = require('./services/auth');
const PasswordManagerService = require('./services/passwordManager');

const authService = new AuthService();
const passwordManager = new PasswordManagerService();
```

### 调用服务方法

```javascript
// 初始化应用
const result = await authService.initialize(password, deviceId);

// 添加密码
const addResult = await passwordManager.addPassword(passwordData, currentKey);
```

## 开发指南

### 添加新服务

1. 在 `services/` 目录下创建新的服务文件
2. 实现服务类和相关方法
3. 在 `ipcHandler.js` 中注册新的IPC处理器
4. 在 `preload.js` 中暴露新的API

### 修改现有服务

1. 保持接口兼容性
2. 更新相关文档
3. 添加必要的测试
4. 更新依赖该服务的其他模块

### 错误处理

```javascript
try {
    const result = await service.method();
    return { success: true, data: result };
} catch (error) {
    console.error('操作失败:', error);
    return { success: false, message: error.message };
}
```

## 测试

每个服务都应该有对应的测试文件，测试应该覆盖：
- 正常流程
- 异常情况
- 边界条件
- 错误处理

## 部署

服务模块支持：
- 开发模式热重载
- 生产模式优化
- 错误监控和日志
- 性能分析

## 维护

定期维护任务：
- 依赖包更新
- 安全漏洞修复
- 性能优化
- 代码重构

## 贡献

欢迎贡献代码，请遵循：
- 代码风格规范
- 测试覆盖率要求
- 文档更新
- 代码审查流程 