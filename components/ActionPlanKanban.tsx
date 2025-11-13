
import React, { useState, useMemo, useEffect } from 'react';
import type { ActionPlan, User, Finding } from '../types';
import { TaskStatus } from '../types';
import { ActionPlanDetailsModal } from './ActionPlanDetailsModal';
import { UserAvatar } from './UserAvatar';

interface ActionPlanKanbanProps {
    actionPlans: ActionPlan[];
    users: User[];
    findings: Finding[];
    onUpdateActionPlanStatus: (planId: string, newStatus: TaskStatus) => void;
    onAddFollowUp: (planId: string, content: string) => void;
    onEditActionPlan: (plan: ActionPlan) => void;
    isReadOnly: boolean;
    currentUser: User;
}

const ActionPlanCard: React.FC<{ plan: ActionPlan; user?: User; finding?: Finding; onDetailsClick: () => void; isReadOnly: boolean; }> = ({ plan, user, finding, onDetailsClick, isReadOnly }) => (
    <div 
        draggable={!isReadOnly}
        onDragStart={(e) => !isReadOnly && e.dataTransfer.setData('planId', plan.id)}
        onClick={onDetailsClick}
        className={`bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm border border-gray-200 dark:border-gray-600 mb-3 transition-all ${!isReadOnly ? 'cursor-grab active:cursor-grabbing hover:shadow-lg hover:border-primary' : 'cursor-default opacity-80'}`}
    >
        <p className="font-semibold text-sm mb-2 line-clamp-3 text-gray-800 dark:text-gray-100">{plan.what}</p>
        {finding && (
             <p className="text-xs text-gray-500 dark:text-gray-300 mb-2 bg-gray-100 dark:bg-gray-800 p-1 rounded truncate">
                <span className="font-semibold">Achado:</span> {finding.title}
             </p>
        )}
        <div className="flex justify-between items-center text-xs mt-3">
            {user && (
                <div className="flex items-center">
                    <UserAvatar user={user} size="xs" />
                    <span className="text-gray-600 dark:text-gray-300 ml-2">{user.name}</span>
                </div>
            )}
            <span className="text-gray-500 dark:text-gray-400">{new Date(plan.when).toLocaleDateString('pt-BR')}</span>
        </div>
    </div>
);

const KanbanColumn: React.FC<{ 
    title: TaskStatus; 
    plans: ActionPlan[]; 
    users: User[]; 
    findings: Finding[];
    onDrop: (planId: string, newStatus: TaskStatus) => void;
    onCardClick: (plan: ActionPlan) => void;
    isReadOnly: boolean;
}> = ({ title, plans, users, findings, onDrop, onCardClick, isReadOnly }) => {
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        if (!isReadOnly) {
            e.preventDefault(); 
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        if (isReadOnly) return;
        e.preventDefault();
        const planId = e.dataTransfer.getData('planId');
        if (planId) {
            onDrop(planId, title);
        }
    };

    const columnColors: Record<TaskStatus, string> = {
        [TaskStatus.Pending]: 'border-t-yellow-400',
        [TaskStatus.InProgress]: 'border-t-blue-400',
        [TaskStatus.Standby]: 'border-t-gray-400',
        [TaskStatus.Done]: 'border-t-green-400',
    };

    return (
        <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`bg-gray-100 dark:bg-gray-800 rounded-lg p-3 flex-1 border-t-4 ${columnColors[title]}`}
        >
            <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-4 px-1">{title} ({plans.length})</h3>
            <div className="min-h-[200px]">
                {plans.map(plan => (
                    <ActionPlanCard 
                        key={plan.id} 
                        plan={plan} 
                        user={users.find(u => u.id === plan.who)}
                        finding={findings.find(f => f.id === plan.findingId)}
                        onDetailsClick={() => onCardClick(plan)}
                        isReadOnly={isReadOnly}
                    />
                ))}
            </div>
        </div>
    );
};

export const ActionPlanKanban: React.FC<ActionPlanKanbanProps> = ({ actionPlans, users, findings, onUpdateActionPlanStatus, onAddFollowUp, onEditActionPlan, isReadOnly, currentUser }) => {
    const [selectedPlanDetails, setSelectedPlanDetails] = useState<ActionPlan | null>(null);

    // FIX: Add useEffect to listen for changes in actionPlans prop.
    // This ensures that when a status is updated or a follow-up is added,
    // the currently viewed plan details are refreshed in real-time.
    useEffect(() => {
        if (selectedPlanDetails) {
            const updatedPlan = actionPlans.find(p => p.id === selectedPlanDetails.id);
            if (updatedPlan && (
                updatedPlan.status !== selectedPlanDetails.status ||
                updatedPlan.followUps.length !== selectedPlanDetails.followUps.length
            )) {
                setSelectedPlanDetails(updatedPlan);
            }
        }
    }, [actionPlans, selectedPlanDetails]);

    const columnOrder: TaskStatus[] = [TaskStatus.Pending, TaskStatus.InProgress, TaskStatus.Standby, TaskStatus.Done];

    const columns = useMemo(() => {
        const grouped = actionPlans.reduce((acc, plan) => {
            (acc[plan.status] = acc[plan.status] || []).push(plan);
            return acc;
        }, {} as Record<TaskStatus, ActionPlan[]>);

        columnOrder.forEach(status => {
            if (!grouped[status]) {
                grouped[status] = [];
            }
        });
        return grouped;
    }, [actionPlans]);

    return (
        <div>
            <div className="flex flex-col md:flex-row gap-4">
                {columnOrder.map(status => (
                    <KanbanColumn 
                        key={status} 
                        title={status} 
                        plans={columns[status]} 
                        users={users}
                        findings={findings}
                        onDrop={onUpdateActionPlanStatus}
                        onCardClick={(plan) => setSelectedPlanDetails(plan)}
                        isReadOnly={isReadOnly}
                    />
                ))}
            </div>
             {actionPlans.length === 0 && (
                <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">Nenhum plano de ação foi criado para os achados desta auditoria.</p>
                </div>
            )}
            {isReadOnly && (
                 <div className="mt-4 p-4 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-md text-center dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700">
                    <p className="font-semibold">Os planos de ação estão em modo de apenas leitura.</p>
                </div>
            )}

            {selectedPlanDetails && (
                <ActionPlanDetailsModal 
                    plan={selectedPlanDetails}
                    user={users.find(u => u.id === selectedPlanDetails.who)}
                    finding={findings.find(f => f.id === selectedPlanDetails.findingId)}
                    users={users}
                    onClose={() => setSelectedPlanDetails(null)}
                    onEdit={(plan) => {
                        onEditActionPlan(plan);
                        setSelectedPlanDetails(null);
                    }}
                    onAddFollowUp={onAddFollowUp}
                    onUpdateStatus={onUpdateActionPlanStatus}
                    isReadOnly={isReadOnly}
                    currentUser={currentUser}
                />
            )}
        </div>
    );
};
