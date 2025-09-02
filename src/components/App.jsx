import React, { useState, useEffect } from 'react';
import Header from './Header';
import MainVault from './MainVault';
import SetupView from './SetupView';
import LoginView from './LoginView';
import Dashboard from './Dashboard';
import AddPasswordModal from './AddPasswordModal';
import EditPasswordModal from './EditPasswordModal';
import PasswordInputModal from './PasswordInputModal';
import ImportPreviewModal from './ImportPreviewModal';
import SettingsView from './SettingsView';

const App = () => {
    const [currentView, setCurrentView] = useState('loading'); // 'loading', 'setup', 'login', 'dashboard', 'main', 'settings'
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [editingPassword, setEditingPassword] = useState(null);
    const [passwords, setPasswords] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pendingImportData, setPendingImportData] = useState(null);
    const [pendingBackupAction, setPendingBackupAction] = useState(null);
    const [pendingExportData, setPendingExportData] = useState(null);
    const [showImportPreview, setShowImportPreview] = useState(false);
    const [importPreviewData, setImportPreviewData] = useState(null);
    const [autoLockTimer, setAutoLockTimer] = useState(null);
    const [settings, setSettings] = useState(null);
    const [startupProgress, setStartupProgress] = useState(0);
    const [startupMessage, setStartupMessage] = useState('正在启动应用...');

    useEffect(() => {
        // 应用启动初始化
        const initializeApp = async () => {
            try {
                setStartupProgress(10);
                setStartupMessage('正在检查应用状态...');

                // 等待一小段时间让用户看到进度
                await new Promise(resolve => setTimeout(resolve, 100));

                setStartupProgress(30);
                setStartupMessage('正在连接后端服务...');

                // 检查是否已经设置过主密码
                const result = await window.api.checkInitializationStatus();

                setStartupProgress(60);
                setStartupMessage('正在加载配置...');

                if (result.success && result.isInitialized) {
                    setStartupProgress(80);
                    setStartupMessage('正在准备登录界面...');
                    setCurrentView('login');
                } else {
                    setStartupProgress(80);
                    setStartupMessage('正在准备设置界面...');
                    setCurrentView('setup');
                }

                setStartupProgress(100);
                setStartupMessage('启动完成');

                // 短暂显示完成消息后清除
                setTimeout(() => {
                    setStartupProgress(0);
                }, 500);

            } catch (error) {
                console.error('应用初始化失败:', error);
                setStartupMessage('启动失败，请重试');
                // 如果检查失败，默认显示设置页面
                setCurrentView('setup');
            }
        };

        initializeApp();
    }, []);

    // 加载设置
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const result = await window.api.getSettings();
                if (result.success) {
                    setSettings(result.settings);
                }
            } catch (error) {
                console.error('加载设置失败:', error);
            }
        };

        if (isAuthenticated) {
            loadSettings();
        }
    }, [isAuthenticated]);

    // 自动锁定功能
    useEffect(() => {
        if (!isAuthenticated || !settings?.autoLock?.enabled) {
            return;
        }

        let currentTimer = null;

        const resetAutoLockTimer = () => {
            // 清除现有定时器
            if (currentTimer) {
                clearTimeout(currentTimer);
            }

            // 设置新的定时器
            const timeout = settings.autoLock.timeout;
            if (timeout > 0) {
                currentTimer = setTimeout(() => {
                    handleAutoLock();
                }, timeout);
                setAutoLockTimer(currentTimer);
            }
        };

        const handleAutoLock = () => {
            setIsAuthenticated(false);
            setCurrentView('login');
            setPasswords([]);
            setAutoLockTimer(null);
        };

        // 监听用户活动
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

        const handleUserActivity = () => {
            resetAutoLockTimer();
        };

        // 添加事件监听器
        events.forEach(event => {
            document.addEventListener(event, handleUserActivity, true);
        });

        // 初始化定时器
        resetAutoLockTimer();

        // 清理函数
        return () => {
            events.forEach(event => {
                document.removeEventListener(event, handleUserActivity, true);
            });
            if (currentTimer) {
                clearTimeout(currentTimer);
            }
        };
    }, [isAuthenticated, settings?.autoLock?.enabled, settings?.autoLock?.timeout]);

    // 启动加载界面
    if (currentView === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
                    <div className="text-center">
                        {/* Logo */}
                        <div className="mb-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto flex items-center justify-center">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                        </div>

                        {/* 标题 */}
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Ciphora</h1>
                        <p className="text-gray-600 mb-6">安全密码管理器</p>

                        {/* 进度条 */}
                        <div className="mb-4">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
                                    style={{ width: `${startupProgress}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* 进度文本 */}
                        <p className="text-sm text-gray-500">{startupMessage}</p>

                        {/* 进度百分比 */}
                        {startupProgress > 0 && (
                            <p className="text-xs text-gray-400 mt-2">{startupProgress}%</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    const handleSetupComplete = () => {
        setCurrentView('dashboard');
        setIsAuthenticated(true);
    };

    const handleLoginSuccess = () => {
        setCurrentView('main');
        setIsAuthenticated(true);
        // 登录成功后加载密码数据
        loadPasswords();
    };

    const handleLogout = async () => {
        try {
            // 调用后端退出API
            await window.api.logout();
            setIsAuthenticated(false);
            setCurrentView('login');
        } catch (error) {
            console.error('退出失败:', error);
            // 即使后端调用失败，也要清除前端状态
            setIsAuthenticated(false);
            setCurrentView('login');
        }
    };

    const openAddModal = () => setShowAddModal(true);
    const closeAddModal = () => setShowAddModal(false);

    const openEditModal = (password) => {
        setEditingPassword(password);
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setEditingPassword(null);
        setShowEditModal(false);
    };

    const handleViewChange = (newView) => {
        setCurrentView(newView);
    };

    const handleDashboardAction = (action) => {
        switch (action) {
            case 'addPassword':
                openAddModal();
                break;
            case 'search':
                setCurrentView('main');
                break;
            case 'settings':
                setCurrentView('settings');
                break;
            case 'clearData':
                // 处理清空数据
                break;
            default:
                break;
        }
    };

    const handleBackToDashboard = () => {
        setCurrentView('dashboard');
    };

    // 加载密码数据
    const loadPasswords = async () => {
        try {
            setIsLoading(true);
            console.log('开始加载密码数据...');

            // 调用后端 API 来获取密码数据
            const result = await window.api.getPasswords();
            console.log('获取密码结果:', result);

            if (Array.isArray(result)) {
                // 转换数据格式，确保前端组件能正确显示
                const formattedPasswords = result.map(pwd => ({
                    ...pwd,
                    type: pwd.dataType || pwd.type || 'password' // 统一使用 type 字段
                }));
                console.log('格式化后的密码数据:', formattedPasswords);
                setPasswords(formattedPasswords);
            } else {
                console.error('获取密码失败:', result);
                setPasswords([]);
            }
        } catch (error) {
            console.error('加载密码失败:', error);
            setPasswords([]);
        } finally {
            setIsLoading(false);
        }
    };

    // 添加新密码
    const handleAddPassword = async (passwordData) => {
        try {
            setIsLoading(true);
            console.log('开始添加密码，数据:', passwordData);

            // 调用后端 API 来保存密码
            const result = await window.api.addPassword({
                ...passwordData,
                dataType: passwordData.type || 'password'
            });

            console.log('后端返回结果:', result);

            if (result.success) {
                // 重新加载密码列表
                await loadPasswords();
                console.log('密码添加成功');
                closeAddModal();
            } else {
                console.error('添加密码失败:', result.message);
                alert('添加密码失败: ' + result.message);
            }
        } catch (error) {
            console.error('添加密码失败:', error);
            alert('添加密码过程中发生错误: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // 更新密码
    const handleUpdatePassword = async (updatedPassword) => {
        try {
            setIsLoading(true);
            // 调用后端 API 来更新密码
            const result = await window.api.updatePassword(updatedPassword.id, {
                ...updatedPassword,
                dataType: updatedPassword.type || 'password'
            });

            if (result.success) {
                // 重新加载密码列表
                await loadPasswords();
                console.log('密码更新成功');
                closeEditModal();
            } else {
                console.error('更新密码失败:', result.message);
            }
        } catch (error) {
            console.error('更新密码失败:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // 删除密码
    const handleDeletePassword = async (passwordId) => {
        try {
            setIsLoading(true);
            // 调用后端 API 来删除密码
            const result = await window.api.deletePassword(passwordId);

            if (result.success) {
                // 重新加载密码列表
                await loadPasswords();
                console.log('密码删除成功');
            } else {
                console.error('删除密码失败:', result.message);
            }
        } catch (error) {
            console.error('删除密码失败:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // 读取文件内容
    const readFileContent = async (filePath) => {
        try {
            const result = await window.api.readFile(filePath);
            if (result === null) {
                throw new Error('读取文件失败');
            }
            return result;
        } catch (error) {
            throw new Error(`读取文件失败: ${error.message}`);
        }
    };

    // 导入密码功能
    const handleImportPasswords = async (fileType) => {
        try {
            let filters;
            let apiCall;

            switch (fileType) {
                case 'excel':
                    filters = [
                        { name: 'Excel文件', extensions: ['xlsx', 'xls'] }
                    ];
                    apiCall = 'importPasswords';
                    break;
                case 'csv':
                    filters = [
                        { name: 'CSV文件', extensions: ['csv', 'txt'] }
                    ];
                    apiCall = 'importPasswords';
                    break;
                case 'ciphora':
                    filters = [
                        { name: 'Ciphora备份文件', extensions: ['ciphora'] }
                    ];
                    apiCall = 'importCiphoraBackup';
                    break;
                default:
                    throw new Error('不支持的文件类型');
            }

            const result = await window.api.selectFile(filters);
            if (!result.success) {
                throw new Error(result.message);
            }

            let importResult;
            if (fileType === 'ciphora') {
                // 对于Ciphora备份文件，需要用户输入密码
                // 读取文件内容
                const fileContent = await readFileContent(result.filePath);
                const backupData = JSON.parse(fileContent);

                // 存储待处理的导入数据，显示密码输入modal
                setPendingImportData({
                    apiCall,
                    backupData,
                    filePath: result.filePath,
                    fileType
                });
                setShowPasswordModal(true);
                return; // 等待用户输入密码
            } else {
                // 将前端的文件类型映射到后端期望的类型
                let backendFileType = fileType;
                if (fileType === 'csv') {
                    backendFileType = 'text'; // 后端使用 'text' 表示CSV文件
                }
                importResult = await window.api[apiCall](result.filePath, backendFileType);
            }

            if (importResult.success) {
                if (importResult.requiresPreview) {
                    // 需要预览导入数据
                    setImportPreviewData(importResult.analysis);
                    setShowImportPreview(true);
                } else {
                    alert(`导入成功！${importResult.message}`);
                    // 重新加载密码列表
                    await loadPasswords();
                }
            } else {
                throw new Error(importResult.message);
            }
        } catch (error) {
            console.error('导入失败:', error);
            alert(`导入失败: ${error.message}`);
        }
    };

    // 处理密码输入确认
    const handlePasswordConfirm = async (password) => {
        try {
            if (pendingImportData) {
                // 处理导入操作
                const { apiCall, backupData, filePath, fileType } = pendingImportData;
                let importResult;

                if (apiCall === 'importCiphoraBackup') {
                    // Ciphora备份导入
                    importResult = await window.api[apiCall](backupData, password);
                } else {
                    // 普通文件导入（Excel、CSV）
                    let backendFileType = fileType;
                    if (fileType === 'csv') {
                        backendFileType = 'text'; // 后端使用 'text' 表示CSV文件
                    }
                    importResult = await window.api[apiCall](filePath, backendFileType);
                }

                if (importResult.success) {
                    alert(`导入成功！${importResult.message}`);
                    // 重新加载密码列表
                    await loadPasswords();
                } else {
                    throw new Error(importResult.message);
                }
            } else if (pendingBackupAction) {
                // 处理备份操作
                const { type, backupData } = pendingBackupAction;

                if (type === 'create') {
                    const result = await window.api.createBackup(password);
                    if (result.success) {
                        // 保存备份文件
                        const filters = [
                            { name: 'Ciphora备份文件', extensions: ['ciphora'] }
                        ];

                        const saveResult = await window.api.saveFile(filters);
                        if (saveResult.success) {
                            let filePath = saveResult.filePath;
                            if (!filePath.endsWith('.ciphora')) {
                                filePath += '.ciphora';
                            }

                            // 写入备份数据
                            const writeResult = await window.api.writeFile(filePath, JSON.stringify(result.backupData, null, 2));
                            if (writeResult) {
                                alert('备份创建成功！');
                            } else {
                                throw new Error('写入备份文件失败');
                            }
                        } else {
                            throw new Error('保存备份文件失败');
                        }
                    } else {
                        throw new Error(result.message);
                    }
                } else if (type === 'restore') {
                    const restoreResult = await window.api.restoreBackup(backupData, password);
                    if (restoreResult.success) {
                        alert(`恢复成功！${restoreResult.message}`);
                        // 重新加载密码列表
                        await loadPasswords();
                    } else {
                        throw new Error(restoreResult.message);
                    }
                }
            } else if (pendingExportData) {
                // 处理导出操作
                const { filePath, fileType } = pendingExportData;

                // 创建带密码的备份
                const result = await window.api.createBackup(password);
                if (result.success) {
                    // 写入备份文件
                    const writeResult = await window.api.writeFile(filePath, JSON.stringify(result.backupData, null, 2));
                    if (writeResult) {
                        alert(`导出成功！备份文件已创建。`);
                    } else {
                        throw new Error('写入备份文件失败');
                    }
                } else {
                    throw new Error(result.message);
                }
            }
        } catch (error) {
            console.error('操作失败:', error);
            alert(`操作失败: ${error.message}`);
        } finally {
            // 清理状态
            setPendingImportData(null);
            setPendingBackupAction(null);
            setPendingExportData(null);
            setShowPasswordModal(false);
        }
    };

    // 处理导入预览确认
    const handleImportPreviewConfirm = async (resolution) => {
        try {
            if (!importPreviewData) return;

            // 合并所有导入数据
            const allImportData = [...importPreviewData.new, ...importPreviewData.conflicts.map(c => c.imported)];

            const result = await window.api.processImportWithResolution(allImportData, resolution);

            if (result.success) {
                alert(`导入成功！${result.message}`);
                // 重新加载密码列表
                await loadPasswords();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('导入失败:', error);
            alert(`导入失败: ${error.message}`);
        } finally {
            // 清理状态
            setShowImportPreview(false);
            setImportPreviewData(null);
        }
    };

    // 导出密码功能
    const handleExportPasswords = async (fileType) => {
        try {
            let filters;
            let extension;

            switch (fileType) {
                case 'excel':
                    filters = [
                        { name: 'Excel文件', extensions: ['xlsx'] }
                    ];
                    extension = '.xlsx';
                    break;
                case 'csv':
                    filters = [
                        { name: 'CSV文件', extensions: ['csv'] }
                    ];
                    extension = '.csv';
                    break;
                case 'ciphora':
                    filters = [
                        { name: 'Ciphora备份文件', extensions: ['ciphora'] }
                    ];
                    extension = '.ciphora';
                    break;
                default:
                    throw new Error('不支持的文件类型');
            }

            const result = await window.api.saveFile(filters);
            if (!result.success) {
                throw new Error(result.message);
            }

            let filePath = result.filePath;
            if (!filePath.endsWith(extension)) {
                filePath += extension;
            }

            // 将前端的文件类型映射到后端期望的类型
            let backendFileType = fileType;
            if (fileType === 'csv') {
                backendFileType = 'text'; // 后端使用 'text' 表示CSV文件
            }

            if (fileType === 'ciphora') {
                // 对于Ciphora备份文件，需要用户设置密码
                setPendingExportData({
                    filePath,
                    fileType: backendFileType
                });
                setShowPasswordModal(true);
                return; // 等待用户输入密码
            } else {
                const exportResult = await window.api.exportPasswords(filePath, backendFileType);
                if (exportResult.success) {
                    alert(`导出成功！${exportResult.message}`);
                } else {
                    throw new Error(exportResult.message);
                }
            }
        } catch (error) {
            console.error('导出失败:', error);
            alert(`导出失败: ${error.message}`);
        }
    };

    // 创建备份功能
    const handleCreateBackup = async () => {
        try {
            // 显示密码输入modal
            setPendingBackupAction({ type: 'create' });
            setShowPasswordModal(true);
            return; // 等待用户输入密码
        } catch (error) {
            console.error('创建备份失败:', error);
            alert(`创建备份失败: ${error.message}`);
        }
    };

    // 恢复备份功能
    const handleRestoreBackup = async () => {
        try {
            const filters = [
                { name: 'Ciphora备份文件', extensions: ['ciphora'] }
            ];

            const result = await window.api.selectFile(filters);
            if (!result.success) {
                throw new Error(result.message);
            }

            // 读取文件内容
            const fileContent = await readFileContent(result.filePath);
            const backupData = JSON.parse(fileContent);

            // 存储待处理的恢复数据，显示密码输入modal
            setPendingBackupAction({
                type: 'restore',
                backupData
            });
            setShowPasswordModal(true);
            return; // 等待用户输入密码
        } catch (error) {
            console.error('恢复备份失败:', error);
            alert(`恢复备份失败: ${error.message}`);
        }
    };

    return (
        <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-inter overflow-hidden">
            {currentView === 'setup' && (
                <SetupView onComplete={handleSetupComplete} />
            )}

            {currentView === 'login' && (
                <LoginView onSuccess={handleLoginSuccess} />
            )}

            {currentView === 'dashboard' && (
                <div>
                    <Header
                        onLogout={handleLogout}
                        currentView={currentView}
                        onViewChange={handleViewChange}
                    />
                    <Dashboard
                        onAddPassword={() => handleDashboardAction('addPassword')}
                        onSearch={() => handleDashboardAction('search')}
                        onSettings={() => handleDashboardAction('settings')}
                        onClearData={() => handleDashboardAction('clearData')}
                        onImportPasswords={handleImportPasswords}
                        onExportPasswords={handleExportPasswords}
                        onCreateBackup={handleCreateBackup}
                        onRestoreBackup={handleRestoreBackup}
                        passwordCount={passwords.length}
                    />
                </div>
            )}

            {currentView === 'main' && (
                <div className="h-full flex flex-col">
                    <Header
                        onLogout={handleLogout}
                        currentView={currentView}
                        onViewChange={handleViewChange}
                        showBack={true}
                        onBack={handleBackToDashboard}
                    />
                    <MainVault
                        passwords={passwords}
                        isLoading={isLoading}
                        onAddPassword={openAddModal}
                        onEditPassword={openEditModal}
                        onDeletePassword={handleDeletePassword}
                        onBack={handleBackToDashboard}
                        hideSensitiveButtons={settings?.ui?.hideSensitiveButtons || false}
                    />
                </div>
            )}

            {currentView === 'settings' && (
                <div>
                    <Header
                        onLogout={handleLogout}
                        currentView={currentView}
                        onViewChange={handleViewChange}
                        showBack={true}
                        onBack={handleBackToDashboard}
                    />
                    <SettingsView
                        onBack={handleBackToDashboard}
                        onLogout={handleLogout}
                    />
                </div>
            )}

            {showAddModal && (
                <AddPasswordModal
                    onClose={closeAddModal}
                    onSave={handleAddPassword}
                />
            )}

            {showEditModal && editingPassword && (
                <EditPasswordModal
                    password={editingPassword}
                    onClose={closeEditModal}
                    onSave={handleUpdatePassword}
                />
            )}

            {showPasswordModal && (
                <PasswordInputModal
                    isOpen={showPasswordModal}
                    onClose={() => {
                        setShowPasswordModal(false);
                        setPendingImportData(null);
                        setPendingBackupAction(null);
                        setPendingExportData(null);
                    }}
                    onConfirm={handlePasswordConfirm}
                    title={
                        pendingImportData
                            ? "🔐 输入备份密码"
                            : pendingBackupAction?.type === 'create'
                                ? "🔐 创建备份密码"
                                : pendingBackupAction?.type === 'restore'
                                    ? "🔐 恢复备份密码"
                                    : pendingExportData
                                        ? "🔐 设置导出密码"
                                        : "🔐 输入密码"
                    }
                    message={
                        pendingImportData
                            ? "请输入Ciphora备份文件的密码以继续导入"
                            : pendingBackupAction?.type === 'create'
                                ? "请设置备份文件的密码"
                                : pendingBackupAction?.type === 'restore'
                                    ? "请输入备份文件的密码以继续恢复"
                                    : pendingExportData
                                        ? "请设置导出文件的密码"
                                        : "请输入密码"
                    }
                    placeholder="请输入密码"
                />
            )}

            {showImportPreview && importPreviewData && (
                <ImportPreviewModal
                    isOpen={showImportPreview}
                    onClose={() => {
                        setShowImportPreview(false);
                        setImportPreviewData(null);
                    }}
                    onConfirm={handleImportPreviewConfirm}
                    importData={[...importPreviewData.new, ...importPreviewData.conflicts.map(c => c.imported)]}
                    existingData={importPreviewData.existing}
                    conflicts={importPreviewData.conflicts}
                />
            )}
        </div>
    );
};

export default App; 