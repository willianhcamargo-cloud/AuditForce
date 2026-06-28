import React, { useState, useRef } from 'react';
import type { ActionPlan, Attachment } from '../types';

interface ActionPlanEvidenceModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan: ActionPlan;
    onConfirm: (evidenceText: string, attachments: Attachment[]) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const ActionPlanEvidenceModal: React.FC<ActionPlanEvidenceModalProps> = ({ isOpen, onClose, plan, onConfirm }) => {
    const [evidenceText, setEvidenceText] = useState('');
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        setIsUploading(true);
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
            setAttachments(prev => [...prev, ...newAttachments]);
        } catch (err) {
            console.error("Error converting file:", err);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemoveAttachment = (id: string) => {
        setAttachments(prev => prev.filter(att => att.id !== id));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!evidenceText.trim()) return;
        onConfirm(evidenceText, attachments);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-center items-center p-4">
            <div className="bg-surface dark:bg-dark-surface rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4 pb-2 border-b dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Adicionar Evidência de Conclusão</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-md text-sm">
                    <p className="font-semibold mb-1">Ação a ser concluída:</p>
                    <p className="italic">"{plan.what}"</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Descrição da Evidência <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={evidenceText}
                            onChange={e => setEvidenceText(e.target.value)}
                            rows={4}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                            placeholder="Descreva detalhadamente o que foi feito para concluir esta ação (ex: quais correções foram aplicadas, resultados obtidos, etc.)..."
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Anexos de Evidência <span className="text-red-500">*</span>
                        </label>
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
                            className="mt-1 flex items-center justify-center px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary dark:hover:border-dark-primary dark:hover:text-dark-primary w-full transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Anexar Arquivos/Imagens (Mínimo 1)
                        </button>
                    </div>

                    {attachments.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Arquivos Anexados</h4>
                            <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
                                {attachments.map(att => (
                                    <div key={att.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-2 rounded border dark:border-gray-700 text-xs text-gray-700 dark:text-gray-300">
                                        <div className="flex items-center space-x-1.5 truncate">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <span className="truncate font-medium">{att.name}</span>
                                            <span className="text-gray-400">({formatBytes(att.size)})</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveAttachment(att.id)}
                                            className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="pt-4 border-t dark:border-gray-700 flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={!evidenceText.trim() || attachments.length === 0 || isUploading}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 transition-colors"
                        >
                            {isUploading ? 'Processando...' : 'Confirmar e Concluir'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
