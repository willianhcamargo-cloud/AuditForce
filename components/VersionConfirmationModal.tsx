import React, { useState } from 'react';

interface VersionConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (decision: 'new' | 'update', changeDescription?: string) => void;
}

export const VersionConfirmationModal: React.FC<VersionConfirmationModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const [decision, setDecision] = useState<'new' | 'update'>('update');
    const [changeDescription, setChangeDescription] = useState('');

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (decision === 'new' && !changeDescription.trim()) {
            alert('Por favor, descreva as principais mudanças para criar uma nova versão.');
            return;
        }
        onConfirm(decision, changeDescription);
        // Reset state for next time
        setDecision('update');
        setChangeDescription('');
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-surface dark:bg-dark-surface rounded-lg shadow-xl p-6 w-full max-w-lg m-4">
                <h2 className="text-xl font-bold mb-4 dark:text-white">Controle de Versão</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Detectamos alterações na política. Como você deseja proceder?</p>
                
                <div className="space-y-4">
                    <div 
                        onClick={() => setDecision('update')}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${decision === 'update' ? 'bg-blue-50 border-primary ring-2 ring-primary dark:bg-blue-900/20' : 'bg-gray-50 border-gray-300 hover:border-gray-400 dark:bg-gray-800 dark:border-gray-600'}`}
                    >
                        <label className="flex items-center">
                            <input type="radio" name="version-decision" value="update" checked={decision === 'update'} onChange={() => setDecision('update')} className="h-4 w-4 text-primary focus:ring-primary border-gray-300" />
                            <div className="ml-3">
                                <span className="block text-sm font-bold text-gray-900 dark:text-gray-100">Atualizar Versão Atual</span>
                                <span className="block text-xs text-gray-500 dark:text-gray-400">Salva as alterações na versão existente (v{`X.X`}). Nenhuma nova versão será criada.</span>
                            </div>
                        </label>
                    </div>

                    <div 
                        onClick={() => setDecision('new')}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${decision === 'new' ? 'bg-blue-50 border-primary ring-2 ring-primary dark:bg-blue-900/20' : 'bg-gray-50 border-gray-300 hover:border-gray-400 dark:bg-gray-800 dark:border-gray-600'}`}
                    >
                        <label className="flex items-center">
                            <input type="radio" name="version-decision" value="new" checked={decision === 'new'} onChange={() => setDecision('new')} className="h-4 w-4 text-primary focus:ring-primary border-gray-300" />
                            <div className="ml-3">
                                <span className="block text-sm font-bold text-gray-900 dark:text-gray-100">Criar Nova Versão</span>
                                <span className="block text-xs text-gray-500 dark:text-gray-400">Arquiva a versão atual e cria uma nova (v{`X.Y`}). Ideal para alterações significativas.</span>
                            </div>
                        </label>
                         {decision === 'new' && (
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descreva as principais mudanças (Obrigatório)</label>
                                <textarea
                                    value={changeDescription}
                                    onChange={(e) => setChangeDescription(e.target.value)}
                                    rows={3}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                    placeholder="Ex: Adicionada cláusula sobre uso de IA generativa."
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <button 
                        onClick={onClose} 
                        className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleConfirm}
                        disabled={decision === 'new' && !changeDescription.trim()}
                        className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};
