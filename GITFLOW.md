# Git Flow 工作流程

## 概述

本项目使用 Git Flow 工作流程进行版本管理和发布。当推送 tag 时，GitHub Actions 会自动构建多平台应用并发布到 Releases。

## 分支结构

```
main (主分支)
├── develop (开发分支)
├── feature/* (功能分支)
├── release/* (发布分支)
└── hotfix/* (热修复分支)
```

## 工作流程

### 1. 开发新功能

```bash
# 从 develop 分支创建功能分支
git checkout develop
git pull origin develop
git checkout -b feature/新功能名称

# 开发完成后提交
git add .
git commit -m "feat: 添加新功能"

# 推送到远程
git push origin feature/新功能名称

# 创建 Pull Request 合并到 develop
```

### 2. 准备发布

```bash
# 从 develop 分支创建发布分支
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# 更新版本号和文档
# 提交发布准备
git add .
git commit -m "chore: 准备发布 v1.2.0"

# 推送到远程
git push origin release/v1.2.0

# 创建 Pull Request 合并到 main
```

### 3. 发布版本

```bash
# 合并到 main 后，创建 tag
git checkout main
git pull origin main
git tag -a v1.2.0 -m "发布版本 v1.2.0"
git push origin v1.2.0

# GitHub Actions 会自动触发构建和发布
```

### 4. 热修复

```bash
# 从 main 分支创建热修复分支
git checkout main
git pull origin main
git checkout -b hotfix/紧急修复

# 修复完成后提交
git add .
git commit -m "fix: 紧急修复问题"

# 推送到远程
git push origin hotfix/紧急修复

# 创建 Pull Request 合并到 main 和 develop
```

## 构建脚本

### 本地构建

```bash
# 构建所有平台
npm run build:all

# 构建特定平台
npm run build:win        # Windows
npm run build:win:32     # Windows 32位
npm run build:win:64     # Windows 64位
npm run build:mac        # macOS
npm run build:mac:arm64  # macOS ARM64
npm run build:mac:x64    # macOS x64
npm run build:linux      # Linux
npm run build:linux:32   # Linux 32位
npm run build:linux:64   # Linux 64位

# 发布构建
npm run release          # 所有平台
npm run release:win      # 仅 Windows
npm run release:mac      # 仅 macOS
npm run release:linux    # 仅 Linux
```

### 自动构建

当推送 tag 时，GitHub Actions 会自动：

1. **构建多平台应用**
   - Windows (x64, ia32) - NSIS 安装包
   - Linux (x64, ia32) - AppImage
   - macOS (x64, arm64) - DMG

2. **创建 Release**
   - 自动生成发布说明
   - 上传所有构建产物
   - 标记为正式版本

## 版本命名规范

- **主版本号**：不兼容的 API 修改
- **次版本号**：向下兼容的功能性新增
- **修订号**：向下兼容的问题修正

示例：`v1.2.3`

## 提交信息规范

```
feat: 新功能
fix: 修复问题
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建过程或辅助工具的变动
```

## 注意事项

1. **develop 分支**：日常开发的主要分支
2. **main 分支**：只包含发布版本，不要直接提交
3. **tag 命名**：必须使用 `v*` 格式才能触发自动构建
4. **分支保护**：main 和 develop 分支应该设置保护规则
5. **代码审查**：所有合并都应该通过 Pull Request 和代码审查

## 快速发布流程

```bash
# 1. 确保 develop 分支是最新的
git checkout develop
git pull origin develop

# 2. 创建发布分支
git checkout -b release/v1.2.0

# 3. 更新版本号（如果需要）
# 4. 提交发布准备
git add .
git commit -m "chore: 准备发布 v1.2.0"

# 5. 推送到远程
git push origin release/v1.2.0

# 6. 创建 PR 合并到 main
# 7. 合并后创建 tag
git checkout main
git pull origin main
git tag -a v1.2.0 -m "发布版本 v1.2.0"
git push origin v1.2.0

# 8. 自动构建和发布完成！
``` 