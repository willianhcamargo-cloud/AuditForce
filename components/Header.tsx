
import React, { useState, useRef } from 'react';
import type { User, Notification } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { UserAvatar } from './UserAvatar';
import { NotificationBell } from './NotificationBell';

interface HeaderProps {
    currentUser: User;
    onLogout: () => void;
    onBack?: () => void;
    onUpdateAvatar: (file: File) => void;
    notifications: Notification[];
    onMarkNotificationRead: (notificationId: string) => void;
    onMarkAllNotificationsRead: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onLogout, onBack, onUpdateAvatar, notifications, onMarkNotificationRead, onMarkAllNotificationsRead }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onUpdateAvatar(e.target.files[0]);
            setIsMenuOpen(false);
        }
    };

    return (
        <header className="bg-surface dark:bg-dark-surface shadow-md flex-shrink-0 z-20">
            <div className="px-4 md:px-6">
                <div className="flex justify-between items-center py-4">
                    <div className="flex items-center space-x-4">
                        {onBack && (
                            <button onClick={onBack} className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-dark-primary">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </button>
                        )}
                        <h1 className="text-2xl font-bold text-primary dark:text-dark-primary">AuditForce</h1>
                    </div>

                    <div className="flex items-center space-x-4">
                        <NotificationBell
                            notifications={notifications}
                            onMarkAsRead={onMarkNotificationRead}
                            onMarkAllAsRead={onMarkAllNotificationsRead}
                        />
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                            aria-label="Toggle theme"
                        >
                            {theme === 'light' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            )}
                        </button>
                        <div className="relative">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center space-x-2">
                                <UserAvatar user={currentUser} size="md" />
                                <span className="hidden sm:inline font-medium text-gray-700 dark:text-gray-200">{currentUser.name}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                            {isMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-surface rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                                        <p className="font-semibold">{currentUser.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser.role}</p>
                                    </div>
                                    <div className="border-t border-gray-100 dark:border-gray-700"></div>
                                    <button onClick={() => fileInputRef.current?.click()} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">
                                        Alterar Foto
                                    </button>
                                    <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                                    <div className="border-t border-gray-100 dark:border-gray-700"></div>
                                    <button onClick={onLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">
                                        Sair
                                    </button>
                                </div>
                            )}
                        </div>
                         <div className="md:hidden">
                           {/* Mobile menu button can be added here if needed */}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
