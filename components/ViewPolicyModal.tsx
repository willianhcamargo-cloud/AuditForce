
import React, { useState, useEffect, useMemo } from 'react';
import type { Policy, PolicyStatus, User, ActionPlan, TaskStatus } from '../types';
import { MarkdownViewer } from './MarkdownViewer';
import { UserAvatar } from './UserAvatar';
import { ActionPlanDetailsModal } from './ActionPlanDetailsModal';


interface ViewPolicyModalProps {
    isOpen: boolean;
    onClose: () => void;
    policy: Policy | null;
    policyHistory: Policy[];
    users: User[];
    actionPlans: ActionPlan[];
    onCreateActionPlan: (indicatorId: string) => void;
    onEditActionPlan: (plan: ActionPlan) => void;
    onAddFollowUp: (planId: string, content: string) => void;
    onUpdateActionPlanStatus: (planId: string, newStatus: TaskStatus) => void;
    currentUser: User;
}

const statusClasses: Record<PolicyStatus, string> = {
    'Rascunho': 'bg-gray-200 text-gray-800',
    'Publicado': 'bg-green-100 text-green-800',
    'Arquivado': 'bg-red-100 text-red-800',
};

const getComplianceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
};


export const ViewPolicyModal: React.FC<ViewPolicyModalProps> = ({ isOpen, onClose, policy, policyHistory, users, actionPlans, onCreateActionPlan, onEditActionPlan, onAddFollowUp, onUpdateActionPlanStatus, currentUser }) => {
    const [planToView, setPlanToView] = useState<ActionPlan | null>(null);
    const [viewedPolicy, setViewedPolicy] = useState<Policy | null>(policy);

    useEffect(() => {
        if (isOpen) {
            setViewedPolicy(policy);
        }
    }, [policy, isOpen]);

    useEffect(() => {
        if (planToView) {
            const updatedPlan = actionPlans.find(p => p.id === planToView.id);
            if (updatedPlan && (
                updatedPlan.status !== planToView.status || 
                updatedPlan.followUps.length !== planToView.followUps.length
            )) {
                setPlanToView(updatedPlan);
            }
        }
    }, [actionPlans, planToView]);
    
    const historicalVersions = useMemo(() => {
        if (!policy) return [];
        return policyHistory
            .filter(p => p.id === policy.id)
            .sort((a, b) => parseFloat(b.version) - parseFloat(a.version));
    }, [policyHistory, policy]);

    if (!isOpen || !policy || !viewedPolicy) return null;

    const isViewingHistory = viewedPolicy.version !== policy.version;
    const allVersions = [policy, ...historicalVersions];
    
    const handleVersionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedVersion = e.target.value;
        const policyToView = allVersions.find(p => p.version === selectedVersion);
        if (policyToView) {
            setViewedPolicy(policyToView);
        }
    };

    const isPlanReadOnly = (plan: ActionPlan) => {
       if (!currentUser) return true;
       return currentUser.role !== 'Administrator' && plan.who !== currentUser.id;
    }

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                <div className="bg-white text-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                    <header className="flex justify-between items-center p-4 border-b">
                        <div>
                            <h2 className="text-xl font-bold">{viewedPolicy.title}</h2>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                <span>{viewedPolicy.category}</span>
                                <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">v{viewedPolicy.version}</span>
                                 <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusClasses[viewedPolicy.status]}`}>{viewedPolicy.status}</span>
                            </div>
                        </div>
                         <button onClick={onClose} aria-label="Close modal" className="text-gray-500 hover:text-gray-800">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </header>
                    
                    <div className="p-6 overflow-y-auto" id="policy-content-area">
                         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                            <div className="flex items-center gap-2">
                                <label htmlFor="version-selector" className="text-sm font-medium text-gray-700">Versão:</label>
                                <select 
                                    id="version-selector"
                                    value={viewedPolicy.version}
                                    onChange={handleVersionChange}
                                    className="block w-full sm:w-auto pl-3 pr-10 py-1 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                                >
                                    {allVersions.map(p => (
                                        <option key={p.version} value={p.version}>
                                            v{p.version} ({new Date(p.updatedAt).toLocaleDateString('pt-BR')}) {p.version === policy.version ? ' - Atual' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {isViewingHistory && (
                                <div className="p-2 bg-yellow-100 text-yellow-800 rounded-md text-xs text-center border border-yellow-200">
                                    <p>Você está visualizando uma versão anterior. Apenas para consulta.</p>
                                </div>
                            )}
                        </div>

                        <div id="policy-print-content">
                            <h3 className="text-lg font-bold my-4 pt-4 border-t text-gray-800">Conteúdo da Política</h3>
                            <MarkdownViewer content={viewedPolicy.content} />

                            <h3 className="text-lg font-bold my-4 pt-4 border-t text-gray-800">Objetivos e Metas</h3>
                            {viewedPolicy.performanceIndicators.length > 0 ? (
                                 <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Objetivo</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsável</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meta</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Real</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conformidade</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {viewedPolicy.performanceIndicators.map(indicator => {
                                                const responsibleUser = users.find(u => u.id === indicator.responsibleId);
                                                const compliance = indicator.goal > 0 ? (indicator.actualValue / indicator.goal) * 100 : 0;
                                                const isGoalMet = indicator.actualValue >= indicator.goal;
                                                const existingPlan = actionPlans.find(p => p.performanceIndicatorId === indicator.id);

                                                return (
                                                    <tr key={indicator.id}>
                                                        <td className="px-4 py-3 text-sm text-gray-800 max-w-xs">{indicator.objective}</td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <div className="flex items-center gap-2">
                                                                {responsibleUser && <UserAvatar user={responsibleUser} size="xs" />}
                                                                <span>{responsibleUser?.name || 'N/A'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-500">{indicator.goal}</td>
                                                        <td className="px-4 py-3 text-sm font-semibold text-gray-800">{indicator.actualValue}</td>
                                                        <td className={`px-4 py-3 text-sm font-bold ${getComplianceColor(compliance)}`}>{compliance.toFixed(1)}%</td>
                                                        <td className="px-4 py-3 text-sm">
                                                            {isGoalMet ? (
                                                                <div className="flex items-center text-green-600">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                    </svg>
                                                                    <span className="text-xs font-semibold">Meta Atingida</span>
                                                                </div>
                                                            ) : existingPlan ? (
                                                                <button
                                                                    onClick={() => setPlanToView(existingPlan)}
                                                                    className="text-yellow-600 hover:text-yellow-800 font-semibold text-xs"
                                                                >
                                                                    Ver Detalhes
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => onCreateActionPlan(indicator.id)}
                                                                    className="text-blue-600 hover:text-blue-800 font-semibold text-xs disabled:text-gray-400 disabled:cursor-not-allowed disabled:no-underline"
                                                                    disabled={isViewingHistory}
                                                                >
                                                                    Criar Plano de Ação
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-md border">Nenhum indicador de performance definido para esta política.</p>
                            )}

                             <h3 className="text-lg font-bold my-4 pt-4 border-t text-gray-800">Histórico de Alterações</h3>
                            {viewedPolicy.changeHistory && viewedPolicy.changeHistory.length > 0 ? (
                                <div className="space-y-4">
                                    {viewedPolicy.changeHistory.map(entry => {
                                        const author = users.find(u => u.id === entry.authorId);
                                        return (
                                            <div key={entry.version} className="flex items-start gap-4 p-3 bg-gray-50 rounded-md border">
                                                <div className="flex-shrink-0 text-center">
                                                    <span className="font-mono bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded">v{entry.version}</span>
                                                </div>
                                                <div className="flex-grow">
                                                    <p className="text-sm text-gray-800">{entry.description}</p>
                                                    <div className="flex items-center text-xs text-gray-500 mt-1">
                                                        {author && <UserAvatar user={author} size="xs" />}
                                                        <span className="ml-2">{author?.name || 'Sistema'} em {new Date(entry.updatedAt).toLocaleString('pt-BR')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-md border">Nenhum histórico de alterações disponível para esta versão.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {planToView && (
                <ActionPlanDetailsModal 
                    plan={planToView}
                    user={users.find(u => u.id === planToView.who)}
                    performanceIndicator={viewedPolicy.performanceIndicators.find(i => i.id === planToView.performanceIndicatorId)}
                    users={users}
                    onClose={() => setPlanToView(null)}
                    onEdit={(plan) => {
                        onEditActionPlan(plan);
                        setPlanToView(null);
                    }}
                    onAddFollowUp={onAddFollowUp}
                    onUpdateStatus={onUpdateActionPlanStatus}
                    isReadOnly={isPlanReadOnly(planToView)}
                    currentUser={currentUser}
                />
            )}
        </>
    );
};