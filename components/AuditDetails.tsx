

import React, { useState } from 'react';
import type { Audit, AuditGrid, User, Finding, ActionPlan, AuditStatus, Attachment } from '../types';
import { FindingStatus, TaskStatus } from '../types';
import { FindingDetailsModal } from './FindingDetailsModal';
import { ActionPlanKanban } from './ActionPlanKanban';
import { ConfirmationModal } from './ConfirmationModal';
import { UserAvatar } from './UserAvatar';

interface AuditDetailsProps {
    audit: Audit;
    grid: AuditGrid;
    auditor?: User;
    users: User[];
    actionPlans: ActionPlan[];
    onUpdateFindingStatus: (findingId: string, status: FindingStatus) => void;
    onUpdateFindingDescription: (findingId: string, description: string) => void;
    onAttachFile: (findingId: string, file: File) => void;
    onDeleteAttachment: (findingId: string, attachmentId: string) => void;
    onUpdateActionPlanStatus: (planId: string, newStatus: TaskStatus) => void;
    onAddFollowUp: (planId: string, content: string) => void;
    onGetAIAssistance: (findingDescription: string) => void;
    aiRecommendation: string;
    isGeneratingAIRecommendation: boolean;
    onCreateActionPlan: (findingId: string) => void;
    onEditActionPlan: (plan: ActionPlan) => void;
    onUpdateAuditStatus: (auditId: string, status: AuditStatus) => void;
    currentUser: User;
}

const findingStatusClasses = {
    [FindingStatus.Compliant]: 'border-l-green-500',
    [FindingStatus.NonCompliant]: 'border-l-red-500',
    [FindingStatus.NotApplicable]: 'border-l-gray-400 dark:border-l-gray-600',
};

const statusClasses: Record<AuditStatus, string> = {
    'Planejando': 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
    'Em Execução': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'Plano de Ação': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'Concluído': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

export const AuditDetails: React.FC<AuditDetailsProps> = (props) => {
    const { audit, grid, auditor, users, actionPlans, onUpdateFindingStatus, onUpdateFindingDescription, onAttachFile, onDeleteAttachment, onGetAIAssistance, aiRecommendation, isGeneratingAIRecommendation, onCreateActionPlan, onEditActionPlan, onUpdateActionPlanStatus, onAddFollowUp, onUpdateAuditStatus, currentUser } = props;
    
    const [activeTab, setActiveTab] = useState<'findings' | 'plans'>('findings');
    const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
    const [isConfirmCompleteModalOpen, setConfirmCompleteModalOpen] = useState(false);

    const isAuditCompleted = audit.status === 'Concluído';
    const isReadOnly = isAuditCompleted || currentUser.id !== audit.auditorId;

    const handleOpenFindingDetails = (finding: Finding) => {
        setSelectedFindingId(finding.id);
    };
    
    const selectedFinding = selectedFindingId ? audit.findings.find(f => f.id === selectedFindingId) : null;
    const requirementForModal = selectedFinding ? grid.requirements.find(r => r.id === selectedFinding.requirementId) : null;


    return (
        <div className="space-y-6">
            <div className="bg-surface dark:bg-dark-surface p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-on-surface dark:text-dark-on-surface">{audit.title}</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">{audit.scope}</p>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                        {!isReadOnly && (
                            <button
                                onClick={() => setConfirmCompleteModalOpen(true)}
                                className="bg-secondary hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center"
                                aria-label="Concluir auditoria"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Concluir Auditoria
                            </button>
                        )}
                    </div>
                </div>
                <div className="mt-4 border-t dark:border-gray-700 pt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm items-center">
                    <div className="text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">Auditor:</span> 
                            {auditor && <UserAvatar user={auditor} size="sm" />}
                            <span>{auditor?.name || 'N/A'}</span>
                        </div>
                    </div>
                    <div className="text-gray-700 dark:text-gray-300"><span className="font-semibold">Início:</span> {new Date(audit.startDate).toLocaleDateString('pt-BR')}</div>
                    <div className="text-gray-700 dark:text-gray-300"><span className="font-semibold">Fim:</span> {new Date(audit.endDate).toLocaleDateString('pt-BR')}</div>
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                        <span className="font-semibold mr-2">Status:</span> 
                        <select
                            value={audit.status}
                            onChange={(e) => onUpdateAuditStatus(audit.id, e.target.value as AuditStatus)}
                            className={`px-3 py-1 text-sm leading-5 font-semibold rounded-full border-2 border-transparent appearance-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${statusClasses[audit.status]} ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}
                            disabled={isReadOnly}
                            aria-label={`Status da auditoria, atualmente ${audit.status}. Mude para alterar.`}
                        >
                            <option value="Planejando">Planejando</option>
                            <option value="Em Execução">Em Execução</option>
                            <option value="Plano de Ação">Plano de Ação</option>
                            <option value="Concluído" disabled>Concluído</option>
                        </select>
                    </div>
                </div>
                 {isAuditCompleted && (
                    <div className="mt-4 p-4 bg-green-50 text-green-700 border border-green-200 rounded-md text-center dark:bg-green-900/20 dark:text-green-300 dark:border-green-700">
                        <p className="font-semibold">Esta auditoria foi concluída e está em modo de apenas leitura.</p>
                    </div>
                )}
                {isReadOnly && !isAuditCompleted && (
                    <div className="mt-4 p-4 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-md text-center dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700">
                        <p className="font-semibold">Você está em modo de apenas leitura, pois não é o auditor designado para esta auditoria.</p>
                    </div>
                )}
            </div>

            <div className="bg-surface dark:bg-dark-surface rounded-lg shadow-md">
                <div className="border-b dark:border-gray-700">
                    <nav className="flex space-x-4 p-4">
                        <button onClick={() => setActiveTab('findings')} className={`px-3 py-2 font-medium text-sm rounded-md ${activeTab === 'findings' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white'}`}>
                            Achados ({audit.findings.length})
                        </button>
                        <button onClick={() => setActiveTab('plans')} className={`px-3 py-2 font-medium text-sm rounded-md ${activeTab === 'plans' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white'}`}>
                            Planos de Ação ({actionPlans.length})
                        </button>
                    </nav>
                </div>
                <div className="p-6">
                    {activeTab === 'findings' && (
                         <div className="space-y-3">
                            {audit.findings.map(finding => {
                                const requirement = grid.requirements.find(r => r.id === finding.requirementId);
                                const statusInfo = {
                                    [FindingStatus.Compliant]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                                    [FindingStatus.NonCompliant]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                                    [FindingStatus.NotApplicable]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
                                };
                                return (
                                    <div key={finding.id} onClick={() => handleOpenFindingDetails(finding)} className={`p-4 border-l-4 rounded-r-md cursor-pointer transition-all bg-gray-50 hover:bg-gray-100 hover:shadow-sm dark:bg-gray-800/50 dark:hover:bg-gray-700/50 ${findingStatusClasses[finding.status]}`}>
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-semibold text-gray-800 dark:text-gray-100">{requirement?.title}</h3>
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo[finding.status]}`}>
                                                {finding.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{finding.description || 'Nenhuma consideração adicionada.'}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {activeTab === 'plans' && <ActionPlanKanban actionPlans={actionPlans} users={users} findings={audit.findings} onUpdateActionPlanStatus={onUpdateActionPlanStatus} onAddFollowUp={onAddFollowUp} onEditActionPlan={onEditActionPlan} isReadOnly={isReadOnly} currentUser={currentUser} />}
                </div>
            </div>

            {selectedFinding && requirementForModal && (
                <FindingDetailsModal
                    isOpen={!!selectedFinding}
                    onClose={() => setSelectedFindingId(null)}
                    finding={selectedFinding}
                    requirement={requirementForModal}
                    onUpdateFindingStatus={onUpdateFindingStatus}
                    onUpdateFindingDescription={onUpdateFindingDescription}
                    onAttachFile={onAttachFile}
                    onDeleteAttachment={onDeleteAttachment}
                    onCreateActionPlan={onCreateActionPlan}
                    onGetAIAssistance={onGetAIAssistance}
                    aiRecommendation={aiRecommendation}
                    isGeneratingAIRecommendation={isGeneratingAIRecommendation}
                    isReadOnly={isReadOnly}
                />
            )}
             <ConfirmationModal
                isOpen={isConfirmCompleteModalOpen}
                onClose={() => setConfirmCompleteModalOpen(false)}
                onConfirm={() => {
                    onUpdateAuditStatus(audit.id, 'Concluído');
                    setConfirmCompleteModalOpen(false);
                }}
                title="Concluir Auditoria"
                message={`Tem certeza de que deseja marcar a auditoria "${audit.code}" como concluída? Esta ação não poderá ser desfeita e a auditoria entrará em modo de apenas leitura.`}
            />
        </div>
    );
};