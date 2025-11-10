import React from 'react';
import type { ActionPlan, User, Finding } from '../types';

interface ActionPlanDetailsModalProps {
    plan: ActionPlan;
    user?: User;
    finding?: Finding;
    onClose: () => void;
    onEdit: (plan: ActionPlan) => void;
    isReadOnly: boolean;
}

const DetailItem: React.FC<{ label: string; value: string | number | undefined; isBlock?: boolean }> = ({ label, value, isBlock = false }) => (
    <div className={isBlock ? "sm:col-span-2" : ""}>
        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{value || 'Não informado'}</dd>
    </div>
);

export const ActionPlanDetailsModal: React.FC<ActionPlanDetailsModalProps> = ({ plan, user, finding, onClose, onEdit, isReadOnly }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-surface dark:bg-dark-surface rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
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
                     <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                        <DetailItem label="O Quê? (What)" value={plan.what} isBlock />
                        <DetailItem label="Por Quê? (Why)" value={plan.why} isBlock />
                        <DetailItem label="Como? (How)" value={plan.how} isBlock />
                        <DetailItem label="Onde? (Where)" value={plan.where} />
                        <DetailItem label="Quando? (When)" value={new Date(plan.when).toLocaleDateString('pt-BR')} />
                        <DetailItem label="Quem? (Who)" value={user?.name} />
                        <DetailItem label="Quanto Custa? (How Much)" value={plan.howMuch ? `R$ ${plan.howMuch.toFixed(2)}` : 'Custo não definido'} />
                     </dl>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700 flex justify-end space-x-3">
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