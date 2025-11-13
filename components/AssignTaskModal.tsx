import React, { useState } from 'react';
import type { Task, User } from '../types';
import { TaskStatus } from '../types';

interface AssignTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (taskData: Omit<Task, 'id'>) => void;
    users: User[];
}

export const AssignTaskModal: React.FC<AssignTaskModalProps> = ({ isOpen, onClose, onSubmit, users }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [dueDate, setDueDate] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !assignedTo || !dueDate) return;
        onSubmit({
            title,
            description,
            assignedTo,
            dueDate,
            // FIX: Replaced TaskStatus.ToDo with TaskStatus.Pending as 'ToDo' does not exist in the enum.
            status: TaskStatus.Pending,
        });
        onClose();
        // Reset form
        setTitle('');
        setDescription('');
        setAssignedTo('');
        setDueDate('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-surface dark:bg-dark-surface rounded-lg shadow-xl p-6 w-full max-w-md m-4">
                <h2 className="text-2xl font-bold mb-4 dark:text-white">Atribuir Nova Tarefa</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Título da Tarefa</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descrição (Opcional)</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Atribuir a</label>
                            <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
                                <option value="">Selecione um usuário</option>
                                {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data de Vencimento</label>
                            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors">Cancelar</button>
                        <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">Atribuir Tarefa</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
