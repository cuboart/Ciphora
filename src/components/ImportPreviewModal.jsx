import React, { useState } from 'react';
import { XMarkIcon, CheckIcon, ExclamationTriangleIcon, ClockIcon } from '@heroicons/react/24/outline';

const ImportPreviewModal = ({
    isOpen,
    onClose,
    onConfirm,
    importData,
    existingData,
    conflicts = []
}) => {
    const [selectedConflicts, setSelectedConflicts] = useState({});
    const [importMode, setImportMode] = useState('add'); // 'add', 'update', 'replace'

    const handleConflictResolution = (conflictId, choice) => {
        setSelectedConflicts(prev => ({
            ...prev,
            [conflictId]: choice
        }));
    };

    const handleConfirm = () => {
        const resolution = {
            mode: importMode,
            conflicts: selectedConflicts
        };
        onConfirm(resolution);
    };

    const getConflictStatus = (item) => {
        const conflict = conflicts.find(c => c.imported.id === item.id);
        if (conflict) {
            return {
                type: 'conflict',
                message: '数据冲突',
                icon: <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" />
            };
        }
        return {
            type: 'new',
            message: '新数据',
            icon: <CheckIcon className="w-4 h-4 text-green-500" />
        };
    };

    const formatDate = (dateString) => {
        if (!dateString) return '未知';
        return new Date(dateString).toLocaleString('zh-CN');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            📋 导入预览
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            预览将要导入的数据，解决可能的冲突
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <XMarkIcon className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Import Mode Selection */}
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">导入模式</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${importMode === 'add' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                            }`}>
                            <input
                                type="radio"
                                name="importMode"
                                value="add"
                                checked={importMode === 'add'}
                                onChange={(e) => setImportMode(e.target.value)}
                                className="sr-only"
                            />
                            <div className="flex items-center space-x-3">
                                <CheckIcon className="w-5 h-5 text-green-600" />
                                <div>
                                    <div className="font-medium text-gray-900">仅添加新数据</div>
                                    <div className="text-sm text-gray-500">只导入不存在的记录</div>
                                </div>
                            </div>
                        </label>

                        <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${importMode === 'update' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                            }`}>
                            <input
                                type="radio"
                                name="importMode"
                                value="update"
                                checked={importMode === 'update'}
                                onChange={(e) => setImportMode(e.target.value)}
                                className="sr-only"
                            />
                            <div className="flex items-center space-x-3">
                                <ClockIcon className="w-5 h-5 text-blue-600" />
                                <div>
                                    <div className="font-medium text-gray-900">智能更新</div>
                                    <div className="text-sm text-gray-500">根据时间戳更新数据</div>
                                </div>
                            </div>
                        </label>

                        <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${importMode === 'replace' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                            }`}>
                            <input
                                type="radio"
                                name="importMode"
                                value="replace"
                                checked={importMode === 'replace'}
                                onChange={(e) => setImportMode(e.target.value)}
                                className="sr-only"
                            />
                            <div className="flex items-center space-x-3">
                                <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                                <div>
                                    <div className="font-medium text-gray-900">完全替换</div>
                                    <div className="text-sm text-gray-500">用导入数据替换现有数据</div>
                                </div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Data Preview */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">
                            数据预览 ({importData.length} 条记录)
                        </h3>
                        {conflicts.length > 0 && (
                            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                                {conflicts.length} 个冲突
                            </span>
                        )}
                    </div>

                    <div className="space-y-3">
                        {importData.map((item, index) => {
                            const status = getConflictStatus(item);
                            const conflict = conflicts.find(c => c.imported.id === item.id);

                            return (
                                <div key={index} className={`p-4 border rounded-lg ${status.type === 'conflict' ? 'border-orange-200 bg-orange-50' : 'border-gray-200 bg-gray-50'
                                    }`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                            {status.icon}
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {item.website || '未知网站'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {item.username || '无用户名'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {status.message}
                                        </div>
                                    </div>

                                    {conflict && (
                                        <div className="mt-3 p-3 bg-white border border-orange-200 rounded-lg">
                                            <div className="text-sm font-medium text-gray-900 mb-2">冲突解决：</div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="flex items-center space-x-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name={`conflict-${item.id}`}
                                                            value="keep"
                                                            checked={selectedConflicts[item.id] === 'keep'}
                                                            onChange={(e) => handleConflictResolution(item.id, e.target.value)}
                                                        />
                                                        <span className="text-sm">保留现有数据</span>
                                                    </label>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        创建时间: {formatDate(conflict.existing.createdAt)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="flex items-center space-x-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name={`conflict-${item.id}`}
                                                            value="replace"
                                                            checked={selectedConflicts[item.id] === 'replace'}
                                                            onChange={(e) => handleConflictResolution(item.id, e.target.value)}
                                                        />
                                                        <span className="text-sm">使用导入数据</span>
                                                    </label>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        创建时间: {formatDate(conflict.imported.createdAt)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-2 text-xs text-gray-500">
                                        类型: {item.type || 'password'} |
                                        创建时间: {formatDate(item.createdAt)} |
                                        更新时间: {formatDate(item.updatedAt)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                        {importMode === 'add' && '将添加新数据，保留现有数据'}
                        {importMode === 'update' && '将根据时间戳智能更新数据'}
                        {importMode === 'replace' && '将完全替换现有数据'}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            取消
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            确认导入
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImportPreviewModal;