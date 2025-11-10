
import React, { useState, useEffect } from 'react';
import type { AuditGrid, AuditRequirement } from '../types';

interface CreateGridModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (gridData: AuditGrid | Omit<AuditGrid, 'id'>) => void;
    gridToEdit?: AuditGrid | null;
}

type Req = Omit<AuditRequirement, 'id'> | AuditRequirement;

export const CreateGridModal: React.FC<CreateGridModalProps> = ({ isOpen, onClose, onSave, gridToEdit }) => {
    const [title, setTitle] = useState('');
    const [scope, setScope] = useState('');
    const [description, setDescription] = useState('');
    const [requirements, setRequirements] = useState<Req[]>([{ title: '', description: '', guidance: '' }]);

    const isEditing = !!gridToEdit;

    useEffect(() => {
        if (isOpen && gridToEdit) {
            setTitle(gridToEdit.title);
            setScope(gridToEdit.scope);
            setDescription(gridToEdit.description);
            setRequirements(gridToEdit.requirements);
        } else {
            // Reset form for creation or when modal closes
            setTitle('');
            setScope('');
            setDescription('');
            setRequirements([{ title: '', description: '', guidance: '' }]);
        }
    }, [isOpen, gridToEdit]);


    const handleRequirementChange = (index: number, field: keyof Req, value: string) => {
        const newRequirements = [...requirements];
        (newRequirements[index] as any)[field] = value;
        setRequirements(newRequirements);
    };

    const addRequirement = () => {
        setRequirements([...requirements, { title: '', description: '', guidance: '' }]);
    };

    const removeRequirement = (index: number) => {
        const newRequirements = requirements.filter((_, i) => i !== index);
        setRequirements(newRequirements);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalRequirements = requirements.filter(r => r.title.trim() !== '');
        if (!title || !scope || finalRequirements.length === 0) return;
        
        // FIX: The type `Req[]` for `finalRequirements` is not assignable to `AuditRequirement[]` as expected by the `onSave` prop.
        // Casting to `AuditRequirement[]` aligns with the prop's type. The receiving function `handleSaveGrid` is designed to handle this.
        const gridData = {
            title,
            scope,
            description,
            requirements: finalRequirements as AuditRequirement[],
        };
        
        if(isEditing && gridToEdit) {
            onSave({ ...gridData, id: gridToEdit.id });
        } else {
            onSave(gridData);
        }
        
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-surface dark:bg-dark-surface rounded-lg shadow-xl p-6 w-full max-w-3xl m-4 max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4 dark:text-white">{isEditing ? 'Editar Grade de Auditoria' : 'Nova Grade de Auditoria'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Título da Grade</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Escopo</label>
                            <input type="text" value={scope} onChange={e => setScope(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
                        </div>
                        
                        <div className="border-t dark:border-gray-700 pt-4">
                            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">Requisitos</h3>
                             {requirements.map((req, index) => (
                                <div key={index} className="space-y-3 mt-3 p-3 border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-grow">
                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Título do Requisito</label>
                                            <input type="text" placeholder={`Requisito #${index + 1}`} value={req.title} onChange={e => handleRequirementChange(index, 'title', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                                        </div>
                                         <button type="button" onClick={() => removeRequirement(index)} disabled={requirements.length <= 1 && !isEditing} className="ml-2 mt-6 text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                                        </button>
                                    </div>
                                    <div>
                                         <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Descrição do Requisito</label>
                                         <textarea value={req.description} onChange={e => handleRequirementChange(index, 'description', e.target.value)} rows={2} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
                                    </div>
                                    <div>
                                         <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Orientação para o Auditor</label>
                                         <textarea value={req.guidance} onChange={e => handleRequirementChange(index, 'guidance', e.target.value)} rows={2} placeholder="Ex: Verificar os últimos 3 meses de logs..." className="mt-1 block w-full border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={addRequirement} className="mt-3 text-sm text-primary dark:text-dark-primary font-semibold hover:underline">
                                + Adicionar outro requisito
                            </button>
                        </div>

                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors">Cancelar</button>
                        <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">{isEditing ? 'Salvar Alterações' : 'Salvar Grade'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
