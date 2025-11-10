import React, { useState } from 'react';
import type { AuditGrid, User } from '../types';
import { GridDetailsModal } from './GridDetailsModal';

interface GridManagementProps {
    grids: AuditGrid[];
    onCreateGrid: () => void;
    onEditGrid: (gridId: string) => void;
    onDeleteGrid: (gridId: string) => void;
    currentUser: User;
}

export const GridManagement: React.FC<GridManagementProps> = ({ grids, onCreateGrid, onEditGrid, onDeleteGrid, currentUser }) => {
    const [gridToView, setGridToView] = useState<AuditGrid | null>(null);

    return (
        <div className="bg-surface dark:bg-dark-surface rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-on-surface dark:text-dark-on-surface">Grades de Auditoria</h1>
                {currentUser.role === 'Administrator' && (
                    <button
                        onClick={onCreateGrid}
                        className="bg-primary hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Nova Grade
                    </button>
                )}
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Título</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Escopo</th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nº de Requisitos</th>
                            {currentUser.role === 'Administrator' && (
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ações</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-700">
                        {grids.map(grid => (
                            <tr
                                key={grid.id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                                onClick={() => setGridToView(grid)}
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{grid.title}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{grid.description}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{grid.scope}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">{grid.requirements.length}</td>
                                {currentUser.role === 'Administrator' && (
                                    <td
                                        className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right space-x-4"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button onClick={() => onEditGrid(grid.id)} className="text-primary hover:text-blue-700 dark:text-dark-primary dark:hover:text-blue-400 font-medium">Editar</button>
                                        <button
                                            onClick={() => {
                                                if (window.confirm(`Tem certeza que deseja excluir a grade "${grid.title}"? Esta ação não pode ser desfeita.`)) {
                                                    onDeleteGrid(grid.id);
                                                }
                                            }}
                                            className="text-danger hover:text-red-700 font-medium"
                                        >
                                            Excluir
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                         {grids.length === 0 && (
                            <tr>
                                <td colSpan={currentUser.role === 'Administrator' ? 4 : 3} className="text-center py-10 text-gray-500 dark:text-gray-400">Nenhuma grade de auditoria encontrada.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <GridDetailsModal
                isOpen={!!gridToView}
                onClose={() => setGridToView(null)}
                grid={gridToView}
            />
        </div>
    );
};