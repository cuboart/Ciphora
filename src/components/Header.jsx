import React, { useState } from 'react';
import {
    Bars3Icon,
    XMarkIcon,
    ArrowLeftIcon,
    CogIcon,
    UserIcon,
    ShieldCheckIcon,
    HomeIcon,
    PlusIcon,
    MagnifyingGlassIcon,
    QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';

const Header = ({ onLogout, onBack, showBack = false, currentView = 'main', onViewChange }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleTabChange = (newValue) => {
        if (newValue === 'vault') {
            onViewChange('main');
        } else if (newValue === 'dashboard') {
            onViewChange('dashboard');
        } else if (newValue === 'settings') {
            onViewChange('settings');
        }
    };

    return (
        <header className=" top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col">
                    {/* Top Row - Logo and User Actions */}
                    <div className="flex justify-between items-center h-16">
                        {/* Left side - Logo and Back button */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                                <img src="../res/logo.png" alt="Ciphora" className="w-10 h-10 rounded-lg" />
                                <h1 className="text-2xl font-bold">Ciphora</h1>
                            </div>
                        </div>
                        {/* Navigation Row - Tabs */}
                        <div className="flex justify-center py-4">
                            <Tabs
                                defaultValue={currentView === 'main' ? 'vault' : currentView === 'dashboard' ? 'dashboard' : 'settings'}
                                className="text-sm text-gray-600"
                                onChange={handleTabChange}
                            >
                                <TabsList variant="button" className="w-auto grid grid-cols-3 gap-2">
                                    <TabsTrigger tabValue="vault" className="mx-1">
                                        <HomeIcon className="w-4 h-4 mr-2" />
                                        保险库
                                    </TabsTrigger>
                                    <TabsTrigger tabValue="dashboard" className="mx-1">
                                        <ShieldCheckIcon className="w-4 h-4 mr-2" />
                                        操作面板
                                    </TabsTrigger>
                                    <TabsTrigger tabValue="settings" className="mx-1">
                                        <CogIcon className="w-4 h-4 mr-2" />
                                        设置
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>

                        {/* Mobile Navigation */}
                        {isMenuOpen && (
                            <div className="md:hidden border-t border-gray-200/50 py-4">
                                <nav className="flex flex-col gap-2">
                                    <button
                                        onClick={() => onViewChange('main')}
                                        className="text-left px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200 font-medium"
                                    >
                                        保险库
                                    </button>
                                    <button
                                        onClick={() => onViewChange('dashboard')}
                                        className="text-left px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200 font-medium"
                                    >
                                        操作面板
                                    </button>
                                    <button className="text-left px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200 font-medium">
                                        设置
                                    </button>
                                </nav>
                            </div>
                        )}
                        {/* Right side - User menu and Logout */}
                        <div className="flex items-center gap-4">
                            {/* Logout button */}
                            <button
                                onClick={onLogout}
                                className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r  rounded-lg hover:from-gray-300 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                    <polyline points="16 17 21 12 16 7"></polyline>
                                    <line x1="21" y1="12" x2="9" y2="12"></line>
                                </svg>
                                <span className="hidden sm:block text-sm">退出</span>
                            </button>

                            {/* Mobile menu button */}
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                            >
                                {isMenuOpen ? (
                                    <XMarkIcon className="w-6 h-6 text-gray-600" />
                                ) : (
                                    <Bars3Icon className="w-6 h-6 text-gray-600" />
                                )}
                            </button>
                        </div>
                    </div>


                </div>
            </div>
        </header>
    );
};

export default Header; 