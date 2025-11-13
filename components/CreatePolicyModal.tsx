import React, { useState, useEffect } from 'react';
import type { Policy, PolicyStatus, User, PerformanceIndicator } from '../types';

// Simple ID generator for new rows
const generateLocalId = () => `temp-${Math.random().toString(36).substring(2, 9)}`;

interface CreatePolicyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (policyData: Omit<Policy, 'id' | 'version' | 'createdAt' | 'updatedAt' | 'changeHistory'> | Policy) => void;
    policyToEdit?: Policy | null;
    users: User[];
}

export const CreatePolicyModal: React.FC<CreatePolicyModalProps> = ({ isOpen, onClose, onSave, policyToEdit, users }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState<PolicyStatus>('Rascunho');
    const [indicators, setIndicators] = useState<PerformanceIndicator[]>([]);
    
    const isEditing = !!policyToEdit;

    useEffect(() => {
        if (isOpen) {
            if (isEditing && policyToEdit) {
                setTitle(policyToEdit.title);
                setCategory(policyToEdit.category);
                setContent(policyToEdit.content);
                setStatus(policyToEdit.status);
                // FIX: Deep copy indicators to prevent mutating the original state.
                // This ensures the change detection logic in the parent component works correctly.
                setIndicators(policyToEdit.performanceIndicators.map(ind => ({ ...ind })));
            } else {
                setTitle('');
                setCategory('');
                setContent('');
                setStatus('Rascunho');
                setIndicators([{ id: generateLocalId(), objective: '', department: '', responsibleId: '', goal: 0, actualValue: 0 }]);
            }
        }
    }, [isOpen, policyToEdit, isEditing]);

    const handleIndicatorChange = (index: number, field: keyof Omit<PerformanceIndicator, 'id'>, value: string | number) => {
        // FIX: Ensure state updates are immutable to prevent side effects.
        setIndicators(currentIndicators =>
            currentIndicators.map((indicator, i) =>
                i === index ? { ...indicator, [field]: value } : indicator
            )
        );
    };

    const handleAddIndicator = () => {
        setIndicators([...indicators, { id: generateLocalId(), objective: '', department: '', responsibleId: '', goal: 0, actualValue: 0 }]);
    };

    const handleRemoveIndicator = (index: number) => {
        if (indicators.length > 1) {
            const newIndicators = indicators.filter((_, i) => i !== index);
            setIndicators(newIndicators);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !category) return;
        
        const policyData = {
            title,
            category,
            content,
            status,
            performanceIndicators: indicators,
        };

        if (isEditing && policyToEdit) {
            onSave({ ...policyToEdit, ...policyData });
        } else {
            onSave(policyData);
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-surface dark:bg-dark-surface rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
                <h2 className="text-2xl font-bold mb-4 dark:text-white flex-shrink-0">{isEditing ? 'Editar Política' : 'Nova Política'}</h2>
                <form onSubmit={handleSubmit} className="flex-grow flex flex-col overflow-hidden">
                    <div className="space-y-4 overflow-y-auto pr-2 flex-grow">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Título da Política</label>
                                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                            </div>
                             <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
                                <input type="text" value={category} onChange={e => setCategory(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Ex: RH, TI, Compliance" required />
                            </div>
                             <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                                <select value={status} onChange={e => setStatus(e.target.value as PolicyStatus)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
                                    <option value="Rascunho">Rascunho</option>
                                    <option value="Publicado">Publicado</option>
                                    <option value="Arquivado">Arquivado</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Conteúdo (Markdown)</label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Use `### Título` para títulos e `* Item` para listas.</p>
                            <textarea 
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                rows={8}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 font-mono text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                placeholder="### 1. Objetivo&#10;* Descrever o objetivo da política."
                            ></textarea>
                        </div>
                        
                        <div className="border-t dark:border-gray-700 pt-4">
                            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">Objetivos e Metas (Indicadores de Performance)</h3>
                            <div className="space-y-3 mt-2">
                                {indicators.map((indicator, index) => (
                                    <div key={indicator.id} className="grid grid-cols-12 gap-3 p-3 border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                                        <div className="col-span-12">
                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Objetivo</label>
                                            <textarea value={indicator.objective} onChange={e => handleIndicatorChange(index, 'objective', e.target.value)} rows={2} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                                        </div>
                                        <div className="col-span-12 md:col-span-3">
                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Setor</label>
                                            <input type="text" value={indicator.department} onChange={e => handleIndicatorChange(index, 'department', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                        </div>
                                        <div className="col-span-12 md:col-span-4">
                                             <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Responsável</label>
                                             <select value={indicator.responsibleId} onChange={e => handleIndicatorChange(index, 'responsibleId', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                                <option value="">Selecione</option>
                                                {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-span-6 md:col-span-2">
                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Meta</label>
                                            <input type="number" value={indicator.goal} onChange={e => handleIndicatorChange(index, 'goal', Number(e.target.value))} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                        </div>
                                        <div className="col-span-6 md:col-span-2">
                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Valor Real</label>
                                            <input type="number" value={indicator.actualValue} onChange={e => handleIndicatorChange(index, 'actualValue', Number(e.target.value))} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                        </div>
                                        <div className="col-span-12 md:col-span-1 flex items-end justify-end">
                                             <button type="button" onClick={() => handleRemoveIndicator(index)} disabled={indicators.length <= 1} className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={handleAddIndicator} className="mt-3 text-sm text-primary dark:text-dark-primary font-semibold hover:underline">
                                + Adicionar Objetivo
                            </button>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3 flex-shrink-0 pt-4 border-t dark:border-gray-700">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors">Cancelar</button>
                        <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                            {isEditing ? 'Salvar Alterações' : 'Salvar Política'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};