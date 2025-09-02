import React from 'react';
import PasswordItem from './PasswordItem';

const PasswordList = ({ searchQuery, onEditPassword }) => {
    // 模拟数据，实际应该从状态管理或API获取
    const passwords = [
        {
            id: 1,
            type: 'password',
            website: 'google.com',
            username: 'user@example.com',
            password: 'securepassword123',
            notes: 'Google账户密码'
        },
        {
            id: 2,
            type: 'mfa',
            website: 'github.com',
            username: '',
            secret: 'JBSWY3DPEHPK3PXP',
            notes: 'GitHub MFA密钥'
        }
    ];

    const filteredPasswords = passwords.filter(password => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            password.website.toLowerCase().includes(query) ||
            (password.type !== 'mfa' && password.username.toLowerCase().includes(query)) ||
            password.notes?.toLowerCase().includes(query) ||
            password.type.toLowerCase().includes(query)
        );
    });

    if (filteredPasswords.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <svg
                        className="w-10 h-10 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <circle cx="12" cy="16" r="1"></circle>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {searchQuery ? '没有找到匹配的记录' : '还没有密码记录'}
                </h3>
                <p className="text-gray-600">
                    {searchQuery ? '尝试使用不同的搜索词' : '开始添加您的第一个密码记录'}
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPasswords.map(password => (
                <PasswordItem
                    key={password.id}
                    password={password}
                    onEdit={() => onEditPassword(password)}
                />
            ))}
        </div>
    );
};

export default PasswordList; 