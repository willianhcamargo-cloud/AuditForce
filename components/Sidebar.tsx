import React, { useState, useEffect } from 'react';

type Page = 'dashboard' | 'audits' | 'grids' | 'users' | 'chatbot' | 'policies';

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, onClick, isActive }) => {
    return (
        <div className="relative group flex justify-center">
            <button
                onClick={onClick}
                className={`flex items-center justify-center w-12 h-12 rounded-lg transition-colors duration-200 ease-in-out ${
                    isActive
                        ? 'bg-primary text-on-primary'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-primary dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-dark-primary'
                }`}
                aria-label={label}
            >
                {icon}
            </button>
            <div
                className="absolute left-full ml-3 px-2 py-1 bg-gray-800 text-white text-xs font-semibold rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20"
                role="tooltip"
            >
                {label}
            </div>
        </div>
    );
};

interface SidebarProps {
    onNavigate: (page: Page) => void;
    currentPage: Page;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate, currentPage }) => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Keep settings open if the user is on the users page
    useEffect(() => {
        if (currentPage === 'users') {
            setIsSettingsOpen(true);
        }
    }, [currentPage]);

    const navItems: { label: string; page: Page; icon: React.ReactNode }[] = [
        {
            label: 'Dashboard',
            page: 'dashboard',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
        },
        {
            label: 'Auditorias',
            page: 'audits',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
            ),
        },
        {
            label: 'Grades',
            page: 'grids',
            icon: (
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            ),
        },
         {
            label: 'Políticas',
            page: 'policies',
            icon: (
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
        },
        {
            label: 'Chatbot',
            page: 'chatbot',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            )
        }
    ];

    const settingsIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );

    const usersIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    );

    return (
        <aside className="w-20 bg-surface dark:bg-dark-surface p-2 flex flex-col items-center shadow-lg z-30 flex-shrink-0">
            <div className="w-12 h-12 flex items-center justify-center mb-4 mt-2">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">
                    AF
                </div>
            </div>
            <nav className="flex flex-col items-center space-y-4 flex-grow">
                {navItems.map(item => (
                    <NavItem
                        key={item.page}
                        icon={item.icon}
                        label={item.label}
                        onClick={() => onNavigate(item.page)}
                        isActive={currentPage === item.page}
                    />
                ))}
            </nav>
            <div className="w-full">
                <NavItem
                    icon={settingsIcon}
                    label="Configurações"
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    isActive={currentPage === 'users'}
                />
                {isSettingsOpen && (
                    <div className="mt-2 flex flex-col items-center space-y-2">
                        <NavItem
                            icon={usersIcon}
                            label="Usuários"
                            onClick={() => onNavigate('users')}
                            isActive={currentPage === 'users'}
                        />
                    </div>
                )}
            </div>
        </aside>
    );
};