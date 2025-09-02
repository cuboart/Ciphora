const { BrowserWindow } = require('electron');
const path = require('path');

class WindowManager {
    constructor() {
        this.mainWindow = null;
    }

    createMainWindow() {
        this.mainWindow = new BrowserWindow({
            width: 1200,
            height: 800,
            minWidth: 800,
            minHeight: 600,
            icon: path.join(__dirname, '../../res/logo.ico'),
            autoHideMenuBar: true,
            webPreferences: {
                preload: path.join(__dirname, '../../preload.js'),
                contextIsolation: true,
                nodeIntegration: false,
                enableRemoteModule: false,
                webSecurity: true
            },
            show: false, // 先不显示，等内容加载完成后再显示
            titleBarStyle: 'default',
            frame: true
        });

        // 设置窗口标题
        this.mainWindow.setTitle('Ciphora | 安全密码管理器');

        // 在开发模式下加载 Vite 开发服务器，在生产模式下加载本地文件
        this.loadContent();

        // 窗口事件处理
        this.setupWindowEvents();

        // 开发工具
        if (!require('electron').app.isPackaged) {
            this.mainWindow.webContents.openDevTools();
        }

        return this.mainWindow;
    }

    loadContent() {
        if (!require('electron').app.isPackaged) {
            console.log('开发模式运行');
            const ports = [3000, 3001, 3002, 3003];
            let loaded = false;
            
            for (const port of ports) {
                try {
                    console.log(`尝试连接到端口 ${port}...`);
                    this.mainWindow.loadURL(`http://localhost:${port}`);
                    loaded = true;
                    console.log(`成功连接到端口 ${port}`);
                    break;
                } catch (error) {
                    console.log(`端口 ${port} 连接失败:`, error.message);
                }
            }
            
            if (!loaded) {
                console.log('无法连接到任何 Vite 开发服务器端口，加载本地文件');
                this.mainWindow.loadFile('index.html');
            }
        } else {
            console.log('生产模式运行，加载构建后的文件');
            this.mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
        }
    }

    setupWindowEvents() {
        // 窗口准备好显示时
        this.mainWindow.once('ready-to-show', () => {
            this.mainWindow.show();
            this.mainWindow.focus();
        });

        // 窗口关闭时
        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });

        // 窗口失去焦点时（可选：自动锁定）
        this.mainWindow.on('blur', () => {
            // 这里可以添加自动锁定逻辑
        });

        // 窗口最小化时（可选：自动锁定）
        this.mainWindow.on('minimize', () => {
            // 这里可以添加自动锁定逻辑
        });

        // 窗口恢复时
        this.mainWindow.on('restore', () => {
            this.mainWindow.focus();
        });

        // 新窗口创建时阻止
        this.mainWindow.webContents.setWindowOpenHandler(() => {
            return { action: 'deny' };
        });
    }

    getMainWindow() {
        return this.mainWindow;
    }

    isMainWindowCreated() {
        return !!this.mainWindow;
    }

    showMainWindow() {
        if (this.mainWindow) {
            if (this.mainWindow.isMinimized()) {
                this.mainWindow.restore();
            }
            this.mainWindow.show();
            this.mainWindow.focus();
        }
    }

    hideMainWindow() {
        if (this.mainWindow) {
            this.mainWindow.hide();
        }
    }

    minimizeMainWindow() {
        if (this.mainWindow) {
            this.mainWindow.minimize();
        }
    }

    maximizeMainWindow() {
        if (this.mainWindow) {
            if (this.mainWindow.isMaximized()) {
                this.mainWindow.unmaximize();
            } else {
                this.mainWindow.maximize();
            }
        }
    }

    closeMainWindow() {
        if (this.mainWindow) {
            this.mainWindow.close();
        }
    }

    // 设置窗口大小
    setWindowSize(width, height) {
        if (this.mainWindow) {
            this.mainWindow.setSize(width, height);
        }
    }

    // 设置窗口位置
    setWindowPosition(x, y) {
        if (this.mainWindow) {
            this.mainWindow.setPosition(x, y);
        }
    }

    // 获取窗口状态
    getWindowState() {
        if (!this.mainWindow) {
            return { exists: false };
        }

        const bounds = this.mainWindow.getBounds();
        return {
            exists: true,
            isMaximized: this.mainWindow.isMaximized(),
            isMinimized: this.mainWindow.isMinimized(),
            isFullScreen: this.mainWindow.isFullScreen(),
            bounds: bounds,
            size: { width: bounds.width, height: bounds.height },
            position: { x: bounds.x, y: bounds.y }
        };
    }

    // 重置窗口到默认状态
    resetWindow() {
        if (this.mainWindow) {
            this.mainWindow.setSize(1200, 800);
            this.mainWindow.center();
            if (this.mainWindow.isMaximized()) {
                this.mainWindow.unmaximize();
            }
        }
    }

    // 发送消息到渲染进程
    sendMessage(channel, data) {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.webContents.send(channel, data);
        }
    }

    // 重新加载窗口内容
    reloadWindow() {
        if (this.mainWindow) {
            this.mainWindow.reload();
        }
    }

    // 打开开发者工具
    openDevTools() {
        if (this.mainWindow) {
            this.mainWindow.webContents.openDevTools();
        }
    }

    // 关闭开发者工具
    closeDevTools() {
        if (this.mainWindow) {
            this.mainWindow.webContents.closeDevTools();
        }
    }
}

module.exports = WindowManager; 