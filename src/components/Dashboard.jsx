import React, { useState } from 'react';
import {
    LockClosedIcon,
    PlusIcon,
    HashtagIcon,
    ShieldCheckIcon,
    KeyIcon,
    CogIcon,
    TrashIcon,
    ArrowUpTrayIcon,
    ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

import { BentoCard, BentoGrid } from "./ui/bento-grid";
import ImportExportModal from "./ImportExportModal";
import SecurityModal from "./SecurityModal";

// 创建 features 数组的函数
const createFeatures = (passwordCount) => [
    {
        Icon: PlusIcon,
        name: "添加新密码",
        description: "安全地存储您的网站登录信息、应用程序密码等敏感数据。",
        href: "#",
        cta: "立即添加",
        background: (
            <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 blur-3xl" />
        ),
        className: "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3",
    },
    {
        Icon: HashtagIcon,
        name: "密码数量",
        description: "您已经保存了多少密码？",
        href: "#",
        cta: "",
        comment: (
            <div className="absolute w-full h-full text-7xl items-center justify-center flex -top-10 text-green-600 font-bold">
                {passwordCount}
            </div>
        ),
        background: (
            <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-green-500/20 to-blue-600/20 blur-3xl" />
        ),
        className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
    },
    {
        Icon: ShieldCheckIcon,
        name: "安全加密",
        description: "基于 AES-256-CBC 加密算法，使用 PBKDF2 密钥派生，确保数据安全。",
        href: "#",
        cta: "查看原理",
        background: (
            <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-red-500/20 to-orange-600/20 blur-3xl" />
        ),
        className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
    },
    {
        Icon: ArrowUpTrayIcon,
        name: "导出备份",
        description: "定期备份您的密码数据，确保数据安全和可移植性。",
        href: "#",
        cta: "创建备份",
        background: (
            <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-teal-500/20 to-green-600/20 blur-3xl" />
        ),
        className: "lg:col-start-3 lg:col-end-4 lg:row-start-2 lg:row-end-4",
    },
    {
        Icon: ArrowDownTrayIcon,
        name: "导入数据",
        description: "从其他密码管理器或CSV文件导入您现有的密码数据。",
        href: "#",
        cta: "导入数据",
        background: (
            <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20 blur-3xl" />
        ),
        className: "lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-2",
    },
];

function Dashboard({ onAddPassword, onSearch, onSettings, onClearData, onImportPasswords, onExportPasswords, onCreateBackup, onRestoreBackup, passwordCount = 0 }) {
    const [showImportModal, setShowImportModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [showSecurityModal, setShowSecurityModal] = useState(false);

    // 处理导入功能
    const handleImportClick = () => {
        setShowImportModal(true);
    };

    // 处理导出功能
    const handleExportClick = () => {
        setShowExportModal(true);
    };

    // 处理导入确认
    const handleImportConfirm = (format) => {
        onImportPasswords(format);
    };

    // 处理导出确认
    const handleExportConfirm = (format) => {
        onExportPasswords(format);
    };

    // 处理安全原理查看
    const handleSecurityClick = () => {
        setShowSecurityModal(true);
    };

    // 创建动态功能数组
    const features = createFeatures(passwordCount);

    // 更新功能数组，添加点击处理
    const featuresWithHandlers = features.map(feature => {
        if (feature.name === "添加新密码") {
            return { ...feature, onClick: onAddPassword };
        } else if (feature.name === "导入数据") {
            return { ...feature, onClick: handleImportClick };
        } else if (feature.name === "导出备份") {
            return { ...feature, onClick: handleExportClick };
        } else if (feature.name === "安全加密") {
            return { ...feature, onClick: handleSecurityClick };
        }
        return feature;
    });

    return (
        <div className="h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8 overflow-hidden">
            {/* Bento Grid Features */}
            <div className="mb-12">
                <div className="max-w-7xl mx-auto">
                    <BentoGrid className="lg:grid-rows-3">
                        {featuresWithHandlers.map((feature) => (
                            <BentoCard key={feature.name} {...feature} />
                        ))}
                    </BentoGrid>
                </div>
            </div>

            {/* Import Modal */}
            <ImportExportModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                onImport={handleImportConfirm}
                onExport={null}
                type="import"
            />

            {/* Export Modal */}
            <ImportExportModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                onImport={null}
                onExport={handleExportConfirm}
                type="export"
            />

            {/* Security Modal */}
            <SecurityModal
                isOpen={showSecurityModal}
                onClose={() => setShowSecurityModal(false)}
            />
        </div>
    );
}

export default Dashboard; 