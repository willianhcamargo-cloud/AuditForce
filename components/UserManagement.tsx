import React, { useEffect, useState } from 'react';
import type { User } from '../types';
import { UserAvatar } from './UserAvatar';

interface UserManagementProps {
    users: User[];
    onCreateUser: () => void;
    onEditUser: (userId: string) => void;
    currentUser: User;
}

interface MailStatus {
    configured: boolean;
    provider: string;
    sender: string;
}

export const UserManagement: React.FC<UserManagementProps> = ({ 
    users, 
    onCreateUser, 
    onEditUser, 
    currentUser
}) => {
    const [mailStatus, setMailStatus] = useState<MailStatus | null>(null);

    useEffect(() => {
        fetch('/api/mail-status')
            .then(res => res.json())
            .then(data => setMailStatus(data))
            .catch(err => console.error('Erro ao buscar status de e-mail:', err));
    }, []);

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

            {currentUser.role === 'Administrator' && (
                <div className="mb-6 p-5 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-200/60 dark:border-blue-900/40 rounded-2xl">
                    <div className="flex items-start space-x-3">
                        <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 rounded-xl text-blue-600 dark:text-blue-400 shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 flex-wrap">
                                Envio Automático de Convites e Notificações (100% Real)
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                                    Disparo Direto pelo Servidor
                                </span>
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                                O AuditForce envia automaticamente e-mails reais de convite para os novos membros cadastrados e notifica os administradores quando o registro é finalizado, sem necessidade de ações adicionais por parte dos usuários.
                            </p>
                            
                            {mailStatus && (
                                <div className="mt-3.5 pt-3.5 border-t border-blue-200/40 dark:border-blue-900/30 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-xs">
                                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                                        <span className="font-semibold mr-1.5 text-gray-500 dark:text-gray-400">Canal de Entrega:</span>
                                        {mailStatus.configured ? (
                                            <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-bold">
                                                <span className="h-2 w-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                                                Ativo ({mailStatus.provider})
                                            </span>
                                        ) : (
                                            <span className="flex items-center text-amber-600 dark:text-amber-400 font-medium">
                                                <span className="h-2 w-2 rounded-full bg-amber-500 mr-1.5 animate-pulse"></span>
                                                Sandbox de Testes Ativo (Ethereal Fallback)
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                                        <span className="font-semibold mr-1.5 text-gray-500 dark:text-gray-400">Remetente:</span>
                                        <code className="bg-white/80 dark:bg-gray-800/60 px-2 py-0.5 rounded border border-gray-200/40 dark:border-gray-700/40 font-mono text-[11px]">
                                            {mailStatus.sender}
                                        </code>
                                    </div>
                                </div>
                            )}

                            {!mailStatus?.configured && (
                                <div className="mt-3 p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl text-[11px] text-amber-700 dark:text-amber-300 font-medium leading-relaxed">
                                    💡 <strong>Dica de Produção:</strong> Para usar seu próprio domínio ou uma conta dedicada de envio (como Resend ou SMTP corporativo), basta configurar as variáveis no menu de Configurações do seu workspace. Os e-mails serão processados instantaneamente pelo servidor.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nome</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Função</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cadastro</th>
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
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {user.isPendingInvite ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                                            Convite Pendente
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300">
                                            Ativo
                                        </span>
                                    )}
                                </td>
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