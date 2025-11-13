


import React, { useState } from 'react';
import type { Policy, User, PolicyStatus, PerformanceIndicator, Meeting, ActionPlan } from '../types';
import { UserAvatar } from './UserAvatar';
import { PolicyCalendar } from './PolicyCalendar';

interface PolicyManagementProps {
    policies: Policy[];
    currentUser: User;
    onCreatePolicy: () => void;
    onEditPolicy: (policy: Policy) => void;
    onDeletePolicy: (policy: Policy) => void;
    onOpenViewPolicy: (policy: Policy) => void;
    users: User[];
    meetings: Meeting[];
    onOpenCreateMeeting: (date?: string) => void;
    onCancelMeeting: (meeting: Meeting) => void;
    onEditMeeting: (meeting: Meeting) => void;
    onAddFollowUp: (planId: string, content: string) => void;
}

type ViewMode = 'list' | 'calendar';

const statusClasses: Record<PolicyStatus, string> = {
    'Rascunho': 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    'Publicado': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Arquivado': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const getComplianceColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
};

const calculateAverageCompliance = (indicators: PerformanceIndicator[]): number => {
    if (!indicators || indicators.length === 0) return 0;

    const validIndicators = indicators.filter(i => i.goal > 0);
    if (validIndicators.length === 0) return 0;

    const totalCompliance = validIndicators.reduce((acc, i) => {
        const compliance = (i.actualValue / i.goal) * 100;
        return acc + compliance;
    }, 0);

    return totalCompliance / validIndicators.length;
};


export const PolicyManagement: React.FC<PolicyManagementProps> = ({ policies, currentUser, onCreatePolicy, onEditPolicy, onDeletePolicy, onOpenViewPolicy, users, meetings, onOpenCreateMeeting, onCancelMeeting, onEditMeeting, onAddFollowUp }) => {
    const [viewMode, setViewMode] = useState<ViewMode>('list');

    const canEditPolicy = (policy: Policy) => {
        if (currentUser.role === 'Administrator') return true;
        const userIsResponsible = policy.performanceIndicators.some(
            pi => pi.responsibleId === currentUser.id
        );
        return userIsResponsible;
    }
    
    return (
        <div className="bg-surface dark:bg-dark-surface rounded-lg shadow-md p-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-on-surface dark:text-dark-on-surface">Políticas e Reuniões</h1>
                
                <div className="flex items-center gap-2">
                     <div className="bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
                        <button onClick={() => setViewMode('list')} className={`px-3 py-1 text-sm font-semibold rounded-md ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow' : 'text-gray-600 dark:text-gray-300'}`}>Lista</button>
                        <button onClick={() => setViewMode('calendar')} className={`px-3 py-1 text-sm font-semibold rounded-md ${viewMode === 'calendar' ? 'bg-white dark:bg-gray-600 shadow' : 'text-gray-600 dark:text-gray-300'}`}>Calendário</button>
                    </div>
                    {currentUser.role === 'Administrator' && (
                        <button
                            onClick={onCreatePolicy}
                            className="bg-primary hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Nova Política
                        </button>
                    )}
                </div>
            </div>

            {viewMode === 'list' ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Título</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Responsável</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Conformidade Média (%)</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Última Atualização</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-700">
                            {policies.map(policy => {
                                const firstResponsibleId = policy.performanceIndicators[0]?.responsibleId;
                                const responsibleUser = users.find(u => u.id === firstResponsibleId);
                                const avgCompliance = calculateAverageCompliance(policy.performanceIndicators);
                                
                                return (
                                    <tr key={policy.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{policy.title}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{policy.category}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center gap-2">
                                                {responsibleUser && <UserAvatar user={responsibleUser} size="sm" />}
                                                <span>{responsibleUser?.name || 'Não definido'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mr-2">
                                                    <div 
                                                        className={`h-2.5 rounded-full ${getComplianceColor(avgCompliance)}`}
                                                        style={{ width: `${Math.min(avgCompliance, 100)}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{avgCompliance.toFixed(0)}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[policy.status]}`}>
                                                {policy.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(policy.updatedAt).toLocaleDateString('pt-BR')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-4">
                                                <button onClick={() => onOpenViewPolicy(policy)} className="text-secondary hover:text-emerald-700 font-medium">Visualizar</button>
                                                {canEditPolicy(policy) && (
                                                    <button onClick={() => onEditPolicy(policy)} className="text-primary hover:text-blue-700 dark:text-dark-primary dark:hover:text-blue-400 font-medium">Editar</button>
                                                )}
                                                {currentUser.role === 'Administrator' && (
                                                    <button
                                                        onClick={() => onDeletePolicy(policy)}
                                                        className="text-danger hover:text-red-700 font-medium"
                                                    >
                                                        Excluir
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {policies.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-10 text-gray-500 dark:text-gray-400">Nenhuma política encontrada.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <PolicyCalendar 
                    meetings={meetings}
                    policies={policies}
                    users={users}
                    currentUser={currentUser}
                    onOpenCreateMeeting={onOpenCreateMeeting}
                    onCancelMeeting={onCancelMeeting}
                    onEditMeeting={onEditMeeting}
                />
            )}
        </div>
    );
};