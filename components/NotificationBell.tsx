
import React, { useState, useEffect, useRef } from 'react';
import type { Notification } from '../types';

interface NotificationBellProps {
    notifications: Notification[];
    onMarkAsRead: (id: string) => void;
    onMarkAllAsRead: () => void;
}

const formatTimeAgo = (isoDate: string) => {
    const date = new Date(isoDate);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return `${Math.floor(interval)}a atrás`;
    interval = seconds / 2592000;
    if (interval > 1) return `${Math.floor(interval)}m atrás`;
    interval = seconds / 86400;
    if (interval > 1) return `${Math.floor(interval)}d atrás`;
    interval = seconds / 3600;
    if (interval > 1) return `${Math.floor(interval)}h atrás`;
    interval = seconds / 60;
    if (interval > 1) return `${Math.floor(interval)}min atrás`;
    return `${Math.floor(seconds)}s atrás`;
}


export const NotificationBell: React.FC<NotificationBellProps> = ({ notifications, onMarkAsRead, onMarkAllAsRead }) => {
    const [isOpen, setIsOpen] = useState(false);
    const unreadCount = notifications.filter(n => !n.read).length;
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);


    const sortedNotifications = [...notifications].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                aria-label="Toggle notifications"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-danger text-white text-xs items-center justify-center">{unreadCount}</span>
                    </span>
                )}
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-dark-surface rounded-md shadow-lg z-50 ring-1 ring-black ring-opacity-5">
                    <div className="flex justify-between items-center p-3 border-b dark:border-gray-700">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-100">Notificações</h3>
                        {unreadCount > 0 && (
                            <button onClick={onMarkAllAsRead} className="text-xs text-primary dark:text-dark-primary hover:underline">Marcar todas como lidas</button>
                        )}
                    </div>
                    <ul className="max-h-80 overflow-y-auto">
                        {sortedNotifications.length > 0 ? sortedNotifications.map(notification => (
                            <li
                                key={notification.id}
                                className={`border-b dark:border-gray-700 last:border-b-0 ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                            >
                                <button onClick={() => onMarkAsRead(notification.id)} className="w-full text-left p-3">
                                    <div className="flex items-start">
                                        {!notification.read && <span className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-1.5 mr-3"></span>}
                                        <div className={`flex-grow ${notification.read ? 'pl-5' : ''}`}>
                                            <p className="text-sm text-gray-700 dark:text-gray-200">{notification.message}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatTimeAgo(notification.timestamp)}</p>
                                        </div>
                                    </div>
                                </button>
                            </li>
                        )) : (
                             <li className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                Nenhuma notificação.
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
