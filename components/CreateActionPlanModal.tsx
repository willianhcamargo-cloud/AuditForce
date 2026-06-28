
import React, { useState, useEffect, useRef } from 'react';
import type { ActionPlan, User, Attachment } from '../types';
import { TaskStatus } from '../types';

interface CreateActionPlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (planData: Omit<ActionPlan, 'id' | 'followUps'> | ActionPlan) => void;
    users: User[];
    findingId: string | null;
    performanceIndicatorId?: string | null;
    planToEdit?: ActionPlan | null;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export const CreateActionPlanModal: React.FC<CreateActionPlanModalProps> = ({ isOpen, onClose, onSave, users, findingId, performanceIndicatorId, planToEdit }) => {
    const [what, setWhat] = useState('');
    const [why, setWhy] = useState('');
    const [where, setWhere] = useState('');
    const [when, setWhen] = useState('');
    const [who, setWho] = useState('');
    const [how, setHow] = useState('');
    // FIX: Change state type to string to correctly handle input value.
    const [howMuch, setHowMuch] = useState<string>('');
    const [status, setStatus] = useState<TaskStatus>(TaskStatus.Pending);
    const [evidenceText, setEvidenceText] = useState('');
    const [evidenceAttachments, setEvidenceAttachments] = useState<Attachment[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const isEditing = !!planToEdit;

    useEffect(() => {
        if (isOpen) {
            if (planToEdit) {
                setWhat(planToEdit.what);
                setWhy(planToEdit.why);
                setWhere(planToEdit.where);
                setWhen(planToEdit.when.split('T')[0]); // Format for date input
                setWho(planToEdit.who);
                setHow(planToEdit.how);
                // FIX: Convert number to string to match the updated state type.
                setHowMuch(planToEdit.howMuch?.toString() ?? '');
                setStatus(planToEdit.status);
                setEvidenceText(planToEdit.evidence || '');
                setEvidenceAttachments(planToEdit.evidenceAttachments || []);
            } else {
                // Reset form for creation
                setWhat('');
                setWhy('');
                setWhere('');
                setWhen('');
                setWho('');
                setHow('');
                setHowMuch('');
                setStatus(TaskStatus.Pending);
                setEvidenceText('');
                setEvidenceAttachments([]);
            }
        }
    }, [isOpen, planToEdit]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const files = Array.from(e.target.files) as File[];
        try {
            const newAttachments: Attachment[] = [];
            for (const file of files) {
                const base64Url = await fileToBase64(file);
                newAttachments.push({
                    id: Math.random().toString(36).substring(2, 11),
                    name: file.name,
                    url: base64Url,
                    size: file.size
                });
            }
            setEvidenceAttachments(prev => [...prev, ...newAttachments]);
        } catch (err) {
            console.error("Error converting file:", err);
        }
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!what || !why || !where || !when || !who || !how) return;

        const commonData = {
            what,
            why,
            where,
            when,
            who,
            how,
            howMuch: howMuch === '' ? undefined : Number(howMuch),
        };

        if (isEditing && planToEdit) {
            if (status === TaskStatus.Done && (!evidenceText.trim() || evidenceAttachments.length === 0)) {
                alert('É obrigatório adicionar uma descrição de evidência e pelo menos um anexo de evidência para concluir a ação.');
                return;
            }
            onSave({
                ...planToEdit,
                ...commonData,
                status,
                evidence: status === TaskStatus.Done ? evidenceText : undefined,
                evidenceAttachments: status === TaskStatus.Done ? evidenceAttachments : undefined,
            });
        } else {
             onSave({
                ...commonData,
                findingId: findingId ?? undefined,
                performanceIndicatorId: performanceIndicatorId ?? undefined,
                status: TaskStatus.Pending,
            });
        }
        
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-surface dark:bg-dark-surface rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6 dark:text-white">{isEditing ? 'Editar Plano de Ação (5W2H)' : 'Criar Plano de Ação (5W2H)'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        
                        {/* What & Why */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">O Quê? (What)</label>
                                <textarea value={what} onChange={e => setWhat(e.target.value)} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="O que será feito?" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Por Quê? (Why)</label>
                                <textarea value={why} onChange={e => setWhy(e.target.value)} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Por que deve ser feito?" required />
                            </div>
                        </div>

                        {/* Where, When, Who */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Onde? (Where)</label>
                                <input type="text" value={where} onChange={e => setWhere(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Onde será feito?" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quando? (When)</label>
                                <input type="date" value={when} onChange={e => setWhen(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quem? (Who)</label>
                                <select value={who} onChange={e => setWho(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
                                    <option value="">Selecione um responsável</option>
                                    {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* How & How Much */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Como? (How)</label>
                            <textarea value={how} onChange={e => setHow(e.target.value)} rows={4} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Como será implementado? (passo a passo)" required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quanto Custa? (How Much)</label>
                                <input type="number" value={howMuch} onChange={e => setHowMuch(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Custo estimado (opcional)" />
                            </div>
                            {isEditing && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                                    <select value={status} onChange={e => setStatus(e.target.value as TaskStatus)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
                                        <option value={TaskStatus.Pending}>Pendente</option>
                                        <option value={TaskStatus.InProgress}>Em Execução</option>
                                        <option value={TaskStatus.Standby}>Standby</option>
                                        <option value={TaskStatus.Done}>Concluído</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        {status === TaskStatus.Done && (
                            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-md border border-green-200 dark:border-green-900/50 space-y-4">
                                <h4 className="font-semibold text-green-800 dark:text-green-300 text-sm">Evidência de Conclusão (Obrigatório)</h4>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição da Evidência *</label>
                                    <textarea
                                        value={evidenceText}
                                        onChange={e => setEvidenceText(e.target.value)}
                                        rows={3}
                                        className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                        placeholder="O que foi feito para concluir esta ação?"
                                        required={status === TaskStatus.Done}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Anexos de Evidência <span className="text-red-500">*</span></label>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        multiple
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center justify-center px-3 py-1.5 border border-dashed border-gray-300 dark:border-gray-600 rounded text-xs font-medium text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary transition-colors bg-white dark:bg-gray-800"
                                    >
                                        Anexar Arquivos (Mínimo 1)
                                    </button>
                                </div>
                                {evidenceAttachments.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {evidenceAttachments.map(att => (
                                            <div key={att.id} className="bg-white dark:bg-gray-850 text-gray-700 dark:text-gray-300 text-[10px] font-medium pl-2 pr-1 py-1 rounded-full flex items-center border dark:border-gray-700 shadow-sm">
                                                <span className="truncate max-w-[120px]">{att.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setEvidenceAttachments(prev => prev.filter(a => a.id !== att.id))}
                                                    className="ml-1 text-red-500 hover:text-red-700 p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors">Cancelar</button>
                        <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                            {isEditing ? 'Salvar Alterações' : 'Criar Plano'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
