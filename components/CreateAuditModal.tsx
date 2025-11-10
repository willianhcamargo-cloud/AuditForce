
import React, { useState } from 'react';
import type { User, AuditGrid, Audit } from '../types';

interface CreateAuditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (auditData: Omit<Audit, 'id' | 'findings' | 'status' | 'code'>) => void;
    users: User[];
    grids: AuditGrid[];
}

export const CreateAuditModal: React.FC<CreateAuditModalProps> = ({ isOpen, onClose, onSave, users, grids }) => {
    const [title, setTitle] = useState('');
    const [scope, setScope] = useState('');
    const [auditorId, setAuditorId] = useState('');
    const [gridId, setGridId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !auditorId || !gridId || !startDate || !endDate) return;
        onSave({ title, scope, auditorId, gridId, startDate, endDate });
        onClose();
        // Reset form
        setTitle('');
        setScope('');
        setAuditorId('');
        setGridId('');
        setStartDate('');
        setEndDate('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-surface dark:bg-dark-surface rounded-lg shadow-xl p-6 w-full max-w-lg m-4">
                <h2 className="text-2xl font-bold mb-4 dark:text-white">Agendar Nova Auditoria</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Título da Auditoria</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Escopo</label>
                            <input type="text" value={scope} onChange={e => setScope(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Auditor Responsável</label>
                                <select value={auditorId} onChange={e => setAuditorId(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
                                    <option value="">Selecione um auditor</option>
                                    {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Grade de Auditoria</label>
                                <select value={gridId} onChange={e => setGridId(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
                                    <option value="">Selecione uma grade</option>
                                    {grids.map(grid => <option key={grid.id} value={grid.id}>{grid.title}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data de Início</label>
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data de Término</label>
                                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancelar</button>
                        <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600">Agendar Auditoria</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
