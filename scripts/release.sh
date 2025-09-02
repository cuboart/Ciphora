#!/bin/bash

# Ciphora 发布脚本
# 使用方法: ./scripts/release.sh <版本号>
# 示例: ./scripts/release.sh 1.2.0

set -e

# 检查参数
if [ $# -eq 0 ]; then
    echo "错误: 请提供版本号"
    echo "使用方法: $0 <版本号>"
    echo "示例: $0 1.2.0"
    exit 1
fi

VERSION=$1
TAG="v$VERSION"
RELEASE_BRANCH="release/$TAG"

echo "🚀 开始发布 Ciphora $VERSION"

# 检查当前分支
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "develop" ]; then
    echo "❌ 错误: 请在 develop 分支上运行此脚本"
    echo "当前分支: $CURRENT_BRANCH"
    exit 1
fi

# 检查工作目录是否干净
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ 错误: 工作目录不干净，请先提交或暂存更改"
    git status --short
    exit 1
fi

# 拉取最新代码
echo "📥 拉取最新代码..."
git pull origin develop

# 创建发布分支
echo "🌿 创建发布分支: $RELEASE_BRANCH"
git checkout -b "$RELEASE_BRANCH"

# 更新版本号（如果需要）
echo "📝 更新版本号到 $VERSION..."
# 这里可以添加更新 package.json 版本号的逻辑

# 提交发布准备
echo "💾 提交发布准备..."
git add .
git commit -m "chore: 准备发布 $TAG"

# 推送到远程
echo "🚀 推送到远程仓库..."
git push origin "$RELEASE_BRANCH"

echo ""
echo "✅ 发布分支创建完成!"
echo ""
echo "📋 接下来的步骤:"
echo "1. 在 GitHub 上创建 Pull Request: $RELEASE_BRANCH → main"
echo "2. 进行代码审查"
echo "3. 合并到 main 分支"
echo "4. 创建 tag: git tag -a $TAG -m \"发布版本 $TAG\""
echo "5. 推送 tag: git push origin $TAG"
echo "6. GitHub Actions 将自动构建和发布"
echo ""
echo "🔗 发布分支: $RELEASE_BRANCH"
echo "🏷️  Tag: $TAG"
echo ""
echo "🎉 发布流程已启动!" 