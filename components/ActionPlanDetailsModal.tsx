import React, { useState } from 'react';
import type { ActionPlan, User, Finding, PerformanceIndicator, Attachment } from '../types';
import { TaskStatus } from '../types';
import { UserAvatar } from './UserAvatar';
import { ActionPlanEvidenceModal } from './ActionPlanEvidenceModal';

interface ActionPlanDetailsModalProps {
    plan: ActionPlan;
    user?: User;
    finding?: Finding;
    performanceIndicator?: PerformanceIndicator;
    users: User[];
    onClose: () => void;
    onEdit: (plan: ActionPlan) => void;
    onAddFollowUp: (planId: string, content: string) => void;
    onUpdateStatus: (planId: string, newStatus: TaskStatus, evidence?: string, evidenceAttachments?: Attachment[]) => void;
    isReadOnly: boolean;
    currentUser: User;
}

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

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
    const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);

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
                                        onChange={(e) => {
                                            const nextStatus = e.target.value as TaskStatus;
                                            if (nextStatus === TaskStatus.Done) {
                                                if (plan.evidence && plan.evidenceAttachments && plan.evidenceAttachments.length > 0) {
                                                    onUpdateStatus(plan.id, nextStatus);
                                                } else {
                                                    setIsEvidenceModalOpen(true);
                                                }
                                            } else {
                                                onUpdateStatus(plan.id, nextStatus);
                                            }
                                        }}
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
                      {/* Evidence Section */}
                      {(plan.evidence || (plan.evidenceAttachments && plan.evidenceAttachments.length > 0)) && (
                         <div className="border-t dark:border-gray-700 pt-4 mb-4">
                             <h3 className="text-lg font-semibold text-on-surface dark:text-dark-on-surface mb-3 flex items-center text-green-600 dark:text-green-400">
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                 </svg>
                                 Evidência de Conclusão
                             </h3>
                             <div className="bg-green-50 dark:bg-green-950/10 p-4 rounded-lg border border-green-200 dark:border-green-900/50">
                                 {plan.evidence && (
                                     <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap mb-3">{plan.evidence}</p>
                                 )}
                                 {plan.evidenceAttachments && plan.evidenceAttachments.length > 0 && (
                                     <div>
                                         <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Anexos de Evidência</h4>
                                         <div className="flex flex-wrap">
                                             {plan.evidenceAttachments.map(att => (
                                                 <div key={att.id} className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-medium mr-2 mb-2 px-2.5 py-1.5 rounded-full flex items-center border border-gray-200 dark:border-gray-700 shadow-sm">
                                                     <a href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center hover:underline">
                                                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                                             <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a3 3 0 006 0V7a1 1 0 112 0v4a5 5 0 01-10 0V7a5 5 0 0110 0v4a1 1 0 11-2 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                                                         </svg>
                                                         {att.name} ({formatBytes(att.size)})
                                                     </a>
                                                 </div>
                                             ))}
                                         </div>
                                     </div>
                                 )}
                             </div>
                         </div>
                      )}

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

            {isEvidenceModalOpen && (
                <ActionPlanEvidenceModal
                    isOpen={isEvidenceModalOpen}
                    onClose={() => setIsEvidenceModalOpen(false)}
                    plan={plan}
                    onConfirm={(evidenceText, attachments) => {
                        onUpdateStatus(plan.id, TaskStatus.Done, evidenceText, attachments);
                        setIsEvidenceModalOpen(false);
                    }}
                />
            )}
        </div>
    );
};