import React from 'react';
import type { AuditGrid } from '../types';

interface GridDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    grid: AuditGrid | null;
}

export const GridDetailsModal: React.FC<GridDetailsModalProps> = ({ isOpen, onClose, grid }) => {
    if (!isOpen || !grid) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-surface dark:bg-dark-surface rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <div>
                        <h2 className="text-xl font-bold text-on-surface dark:text-dark-on-surface">{grid.title}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{grid.scope}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">Descrição</h3>
                        <p className="mt-1 text-gray-700 dark:text-gray-300">{grid.description || 'Nenhuma descrição fornecida.'}</p>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-on-surface dark:text-dark-on-surface mb-4">Requisitos</h3>
                        <div className="space-y-4">
                            {grid.requirements.map((req, index) => (
                                <div key={req.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
                                    <h4 className="font-bold text-gray-800 dark:text-gray-100">{index + 1}. {req.title}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{req.description}</p>
                                    <div className="mt-3 border-t dark:border-gray-600 pt-3">
                                        <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Orientação para Auditoria</h5>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 italic">{req.guidance}</p>
                                    </div>
                                </div>
                            ))}
                             {grid.requirements.length === 0 && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 italic">Esta grade não possui requisitos cadastrados.</p>
                             )}
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700 flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};