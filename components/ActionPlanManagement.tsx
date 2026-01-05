import React from 'react';
import type { ActionPlan, User, Finding } from '../types';

interface ActionPlanManagementProps {
    actionPlans: ActionPlan[];
    users: User[];
    findings: Finding[];
}

export const ActionPlanManagement: React.FC<ActionPlanManagementProps> = ({ actionPlans, users, findings }) => {
    
    const findUserName = (id: string) => users.find(u => u.id === id)?.name || 'N/A';
    const findFindingTitle = (id: string | undefined) => {
        if (!id) return 'N/A';
        return findings.find(f => f.id === id)?.title || 'N/A';
    };

    return (
        <div className="bg-surface rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-on-surface mb-6">Gerenciamento de Planos de Ação</h1>
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ação (O Quê)</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsável</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prazo</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Achado Vinculado</th>
                        </tr>
                    </thead>
                     <tbody className="bg-white divide-y divide-gray-200">
                        {actionPlans.map(plan => (
                            <tr key={plan.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{plan.what}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{findUserName(plan.who)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(plan.when).toLocaleDateString('pt-BR')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plan.status}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{findFindingTitle(plan.findingId)}</td>
                            </tr>
                        ))}
                         {actionPlans.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-10 text-gray-500">Nenhum plano de ação encontrado.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};