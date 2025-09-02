#!/usr/bin/env node

/**
 * 启动性能测试脚本
 * 用于测试应用启动时间和各个阶段的性能
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 开始启动性能测试...\n');

// 测试开发模式启动
async function testDevStartup() {
    console.log('📱 测试开发模式启动...');
    
    return new Promise((resolve) => {
        const startTime = Date.now();
        const devProcess = spawn('npm', ['run', 'dev'], {
            stdio: 'pipe',
            shell: true
        });

        let output = '';
        let isStarted = false;

        devProcess.stdout.on('data', (data) => {
            const text = data.toString();
            output += text;
            
            // 检测启动完成标志
            if (text.includes('Local:') || text.includes('ready in')) {
                if (!isStarted) {
                    const elapsed = Date.now() - startTime;
                    console.log(`✅ 开发模式启动完成: ${elapsed}ms`);
                    isStarted = true;
                    
                    // 等待几秒后关闭
                    setTimeout(() => {
                        devProcess.kill();
                        resolve(elapsed);
                    }, 3000);
                }
            }
        });

        devProcess.stderr.on('data', (data) => {
            console.error('❌ 开发模式错误:', data.toString());
        });

        // 超时保护
        setTimeout(() => {
            if (!isStarted) {
                console.log('⏰ 开发模式启动超时');
                devProcess.kill();
                resolve(-1);
            }
        }, 30000);
    });
}

// 测试生产模式启动
async function testProdStartup() {
    console.log('📦 测试生产模式启动...');
    
    return new Promise((resolve) => {
        const startTime = Date.now();
        const prodProcess = spawn('npm', ['run', 'electron:start'], {
            stdio: 'pipe',
            shell: true
        });

        let output = '';
        let isStarted = false;

        prodProcess.stdout.on('data', (data) => {
            const text = data.toString();
            output += text;
            
            // 检测启动完成标志
            if (text.includes('应用启动完成') || text.includes('窗口创建完成')) {
                if (!isStarted) {
                    const elapsed = Date.now() - startTime;
                    console.log(`✅ 生产模式启动完成: ${elapsed}ms`);
                    isStarted = true;
                    
                    // 等待几秒后关闭
                    setTimeout(() => {
                        prodProcess.kill();
                        resolve(elapsed);
                    }, 3000);
                }
            }
        });

        prodProcess.stderr.on('data', (data) => {
            console.error('❌ 生产模式错误:', data.toString());
        });

        // 超时保护
        setTimeout(() => {
            if (!isStarted) {
                console.log('⏰ 生产模式启动超时');
                prodProcess.kill();
                resolve(-1);
            }
        }, 30000);
    });
}

// 主测试函数
async function runStartupTests() {
    console.log('🔍 启动性能测试开始...\n');
    
    try {
        // 测试开发模式
        const devTime = await testDevStartup();
        console.log('');
        
        // 测试生产模式
        const prodTime = await testProdStartup();
        console.log('');
        
        // 输出结果
        console.log('📊 测试结果汇总:');
        console.log(`   开发模式启动时间: ${devTime > 0 ? devTime + 'ms' : '超时'}`);
        console.log(`   生产模式启动时间: ${prodTime > 0 ? prodTime + 'ms' : '超时'}`);
        
        if (devTime > 0 && prodTime > 0) {
            const diff = prodTime - devTime;
            console.log(`   差异: ${diff > 0 ? '+' : ''}${diff}ms`);
            
            if (prodTime > 10000) {
                console.log('\n⚠️  生产模式启动时间过长，建议检查:');
                console.log('   1. 文件系统操作是否过多');
                console.log('   2. 网络请求是否阻塞');
                console.log('   3. 依赖库是否过大');
                console.log('   4. 设备ID和设置文件加载是否优化');
            }
        }
        
    } catch (error) {
        console.error('❌ 测试过程中发生错误:', error);
    }
    
    console.log('\n🏁 测试完成');
}

// 运行测试
if (require.main === module) {
    runStartupTests();
}

module.exports = { runStartupTests }; 