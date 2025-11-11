import React from 'react';
import type { User } from '../types';
import { UserAvatar } from './UserAvatar';

interface UserManagementProps {
    users: User[];
    onCreateUser: () => void;
    onEditUser: (userId: string) => void;
    currentUser: User;
}

export const UserManagement: React.FC<UserManagementProps> = ({ users, onCreateUser, onEditUser, currentUser }) => {
    return (
        <div className="bg-surface dark:bg-dark-surface rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-on-surface dark:text-dark-on-surface">Gerenciamento de Usuários</h1>
                {currentUser.role === 'Administrator' && (
                    <button
                        onClick={onCreateUser}
                        className="bg-primary hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Novo Usuário
                    </button>
                )}
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nome</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Função</th>
                            {currentUser.role === 'Administrator' && (
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-700">
                        {users.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <UserAvatar user={user} size="md" />
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.role}</td>
                                {currentUser.role === 'Administrator' && (
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => onEditUser(user.id)} className="text-primary hover:text-blue-700 dark:text-dark-primary dark:hover:text-blue-400">
                                            Editar
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};