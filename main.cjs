const { app } = require('electron');
const path = require('path');

// 导入服务模块
const IPCHandler = require('./server/services/ipcHandler.cjs');
const WindowManager = require('./server/services/windowManager.cjs');
const AppStateManager = require('./server/services/appState.cjs');

// 全局变量
let ipcHandler;
let windowManager;
let appStateManager;

// 启动性能监控
const startupTiming = {
    start: Date.now(),
    stages: {}
};

function logTiming(stage) {
    const now = Date.now();
    const elapsed = now - startupTiming.start;
    startupTiming.stages[stage] = elapsed;
    console.log(`⏱️  ${stage}: ${elapsed}ms`);
}

// ==================== 应用生命周期管理 ====================
class AppLifecycleManager {
    static async initialize() {
        logTiming('应用启动开始');
        
        try {
            // 立即创建窗口，不等待服务完全初始化
            logTiming('开始创建窗口');
            windowManager = new WindowManager();
            const mainWindow = windowManager.createMainWindow();
            logTiming('窗口创建完成');
            
            // 并行初始化服务
            const initPromise = this.initializeServicesAsync();
            
            // 注册所有IPC处理器
            logTiming('开始注册IPC处理器');
            ipcHandler = new IPCHandler();
            ipcHandler.registerAll();
            logTiming('IPC处理器注册完成');
            
            // 设置应用事件处理
            this.setupAppEvents();
            
            // 等待服务初始化完成（但不阻塞窗口显示）
            initPromise.then(() => {
                logTiming('服务初始化完成');
                console.log('🚀 应用启动完成，总耗时:', Date.now() - startupTiming.start, 'ms');
                console.log('📊 启动阶段详情:', startupTiming.stages);
            }).catch((error) => {
                console.error('服务初始化失败:', error);
                logTiming('服务初始化失败');
            });
            
        } catch (error) {
            console.error('应用启动失败:', error);
            logTiming('应用启动失败');
            // 即使初始化失败，也要创建窗口让用户知道有问题
            this.createErrorWindow();
        }
    }

    static async initializeServicesAsync() {
        logTiming('开始初始化服务');
        
        try {
            // 初始化IPC处理器
            ipcHandler = new IPCHandler();
            logTiming('IPC处理器初始化完成');
            
            // 异步初始化应用状态管理器
            logTiming('开始初始化应用状态管理器');
            appStateManager = ipcHandler.getAppState();
            await appStateManager.initialize();
            logTiming('应用状态管理器初始化完成');
            
            // 设置窗口管理器到应用状态
            appStateManager.setMainWindow(windowManager.getMainWindow());
            
            console.log('所有服务初始化完成');
            console.log('用户路径:', app.getPath('home'));
            console.log('用户数据路径:', app.getPath('userData'));
            console.log('设备ID:', await appStateManager.getDeviceId());
        } catch (error) {
            console.error('服务初始化失败:', error);
            throw error;
        }
    }

    static createErrorWindow() {
        try {
            const { BrowserWindow } = require('electron');
            const errorWindow = new BrowserWindow({
                width: 600,
                height: 400,
                webPreferences: {
                    nodeIntegration: false,
                    contextIsolation: true
                },
                show: false
            });

            errorWindow.loadURL(`data:text/html,
                <html>
                    <head>
                        <title>启动错误</title>
                        <style>
                            body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
                            .error { color: red; margin: 20px 0; }
                            .retry { margin: 20px 0; }
                            button { padding: 10px 20px; font-size: 16px; cursor: pointer; }
                        </style>
                    </head>
                    <body>
                        <h1>应用启动失败</h1>
                        <div class="error">应用初始化过程中发生错误，请尝试重新启动。</div>
                        <div class="retry">
                            <button onclick="window.close()">关闭</button>
                            <button onclick="location.reload()">重试</button>
                        </div>
                    </body>
                </html>
            `);

            errorWindow.once('ready-to-show', () => {
                errorWindow.show();
            });
        } catch (error) {
            console.error('创建错误窗口失败:', error);
        }
    }

    static setupAppEvents() {
        // 应用事件处理
        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                app.quit();
            }
        });

        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                windowManager.createMainWindow();
            }
        });

        // 应用即将退出
        app.on('before-quit', () => {
            console.log('应用即将退出...');
            // 这里可以添加清理逻辑
        });

        // 应用退出
        app.on('quit', () => {
            console.log('应用已退出');
        });
    }
}

// ==================== 错误处理 ====================
process.on('uncaughtException', (error) => {
    console.error('未捕获的异常:', error);
    // 这里可以添加错误报告逻辑
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('未处理的Promise拒绝:', reason);
    // 这里可以添加错误报告逻辑
});

// ==================== 启动应用 ====================
app.whenReady().then(async () => {
    try {
        await AppLifecycleManager.initialize();
    } catch (error) {
        console.error('应用启动失败:', error);
        app.quit();
    }
});

// ==================== 开发模式支持 ====================
if (!app.isPackaged) {
    // 开发模式下的额外配置
    console.log('开发模式已启用');
} 