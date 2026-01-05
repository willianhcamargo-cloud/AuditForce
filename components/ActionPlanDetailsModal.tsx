import React, { useState } from 'react';
import type { ActionPlan, User, Finding, PerformanceIndicator } from '../types';
import { TaskStatus } from '../types';
import { UserAvatar } from './UserAvatar';

interface ActionPlanDetailsModalProps {
    plan: ActionPlan;
    user?: User;
    finding?: Finding;
    performanceIndicator?: PerformanceIndicator;
    users: User[];
    onClose: () => void;
    onEdit: (plan: ActionPlan) => void;
    onAddFollowUp: (planId: string, content: string) => void;
    onUpdateStatus: (planId: string, newStatus: TaskStatus) => void;
    isReadOnly: boolean;
    currentUser: User;
}

const DetailItem: React.FC<{ label: string; value?: string | number | React.ReactNode; isBlock?: boolean }> = ({ label, value, isBlock = false }) => (
    <div className={isBlock ? "sm:col-span-2" : ""}>
        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{value || 'Não informado'}</dd>
    </div>
);

const formatTimeAgo = (isoDate: string) => {
    const date = new Date(isoDate);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return `há ${Math.floor(interval)} anos`;
    interval = seconds / 2592000;
    if (interval > 1) return `há ${Math.floor(interval)} meses`;
    interval = seconds / 86400;
    if (interval > 1) return `há ${Math.floor(interval)} dias`;
    interval = seconds / 3600;
    if (interval > 1) return `há ${Math.floor(interval)} horas`;
    interval = seconds / 60;
    if (interval > 1) return `há ${Math.floor(interval)} minutos`;
    return `há segundos`;
}

const TASK_STATUS_CLASSES: Record<TaskStatus, string> = {
    [TaskStatus.Pending]: 'bg-yellow-100 text-yellow-800 border-yellow-300 focus:ring-yellow-500 dark:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-700',
    [TaskStatus.InProgress]: 'bg-blue-100 text-blue-800 border-blue-300 focus:ring-blue-500 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700',
    [TaskStatus.Standby]: 'bg-gray-100 text-gray-800 border-gray-300 focus:ring-gray-500 dark:bg-gray-700/50 dark:text-gray-300 dark:border-gray-600',
    [TaskStatus.Done]: 'bg-green-100 text-green-800 border-green-300 focus:ring-green-500 dark:bg-green-900/50 dark:text-green-200 dark:border-green-700',
};


export const ActionPlanDetailsModal: React.FC<ActionPlanDetailsModalProps> = ({ plan, user, finding, performanceIndicator, users, onClose, onEdit, onAddFollowUp, onUpdateStatus, isReadOnly, currentUser }) => {
    const [followUpContent, setFollowUpContent] = useState('');

    const handleAddFollowUp = () => {
        if (followUpContent.trim()) {
            onAddFollowUp(plan.id, followUpContent);
            setFollowUpContent('');
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-surface dark:bg-dark-surface rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-on-surface dark:text-dark-on-surface">Detalhes do Plano de Ação - 5W2H</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto space-y-6">
                     {finding && (
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border dark:border-gray-700">
                            <p className="text-sm text-gray-800 dark:text-gray-200"><span className="font-semibold text-gray-600 dark:text-gray-300">Vinculado ao Achado:</span> {finding.title}</p>
                        </div>
                     )}
                     {performanceIndicator && (
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border dark:border-gray-700">
                            <p className="text-sm text-gray-800 dark:text-gray-200"><span className="font-semibold text-gray-600 dark:text-gray-300">Vinculado ao Indicador:</span> {performanceIndicator.objective}</p>
                        </div>
                     )}
                     <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                        <DetailItem label="O Quê? (What)" value={plan.what} isBlock />
                        <DetailItem label="Por Quê? (Why)" value={plan.why} isBlock />
                        <DetailItem label="Como? (How)" value={plan.how} isBlock />
                        <DetailItem label="Onde? (Where)" value={plan.where} />
                        <DetailItem label="Quando? (When)" value={new Date(plan.when).toLocaleDateString('pt-BR')} />
                        <DetailItem label="Quem? (Who)" value={user?.name} />
                        <DetailItem label="Quanto Custa? (How Much)" value={plan.howMuch ? `R$ ${plan.howMuch.toFixed(2)}` : 'Custo não definido'} />
                        <div className="sm:col-span-2">
                           <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                           <dd className="mt-1">
                                {!isReadOnly ? (
                                    <select
                                        value={plan.status}
                                        onChange={(e) => onUpdateStatus(plan.id, e.target.value as TaskStatus)}
                                        className={`w-full md:w-auto px-3 py-1.5 text-sm leading-5 font-semibold rounded-md transition-colors appearance-none border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:ring-offset-gray-800 ${TASK_STATUS_CLASSES[plan.status]}`}
                                    >
                                        <option value={TaskStatus.Pending}>Pendente</option>
                                        <option value={TaskStatus.InProgress}>Em Execução</option>
                                        <option value={TaskStatus.Standby}>Standby</option>
                                        <option value={TaskStatus.Done}>Concluído</option>
                                    </select>
                                ) : (
                                    <span className={`px-3 py-1.5 inline-flex text-sm leading-5 font-semibold rounded-md ${TASK_STATUS_CLASSES[plan.status]}`}>
                                        {plan.status}
                                    </span>
                                )}
                           </dd>
                        </div>
                     </dl>

                     {/* Follow-up Section */}
                    <div className="border-t dark:border-gray-700 pt-4">
                        <h3 className="text-lg font-semibold text-on-surface dark:text-dark-on-surface mb-3">Follow-up</h3>
                        
                        {/* Add Follow-up Form */}
                        {!isReadOnly && (
                            <div className="flex items-start gap-3 mb-4">
                                <UserAvatar user={currentUser} size="md" />
                                <div className="flex-grow">
                                    <textarea
                                        value={followUpContent}
                                        onChange={(e) => setFollowUpContent(e.target.value)}
                                        rows={3}
                                        placeholder="Adicione uma atualização sobre o progresso..."
                                        className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                    />
                                    <button onClick={handleAddFollowUp} className="mt-2 bg-secondary text-white font-bold py-1 px-3 rounded-lg hover:bg-emerald-600 text-sm">
                                        Adicionar Follow-up
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Follow-up History */}
                        <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                            {plan.followUps && plan.followUps.length > 0 ? (
                                plan.followUps.map(followUp => {
                                    const author = users.find(u => u.id === followUp.authorId);
                                    return (
                                        <div key={followUp.id} className="flex items-start gap-3">
                                            {author && <UserAvatar user={author} size="md" />}
                                            <div className="flex-grow bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                                                <div className="flex justify-between items-center">
                                                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">{author?.name || 'Desconhecido'}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatTimeAgo(followUp.timestamp)}</p>
                                                </div>
                                                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{followUp.content}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400 italic">Nenhum follow-up adicionado ainda.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700 flex justify-end space-x-3 flex-shrink-0">
                    <button onClick={onClose} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors">
                        Fechar
                    </button>
                    {!isReadOnly && (
                        <button onClick={() => onEdit(plan)} className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                            Editar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};