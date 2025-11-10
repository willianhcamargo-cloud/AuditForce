import React, { useState, useEffect } from 'react';
import type { User } from '../types';

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (userData: User | Omit<User, 'id' | 'avatarUrl'>) => void;
    userToEdit?: User | null;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onSubmit, userToEdit }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'Auditor' | 'Manager' | 'Employee' | 'Administrator'>('Employee');

    const isEditing = !!userToEdit;

    useEffect(() => {
        if (isOpen) {
            if (isEditing) {
                setName(userToEdit.name);
                setEmail(userToEdit.email);
                setRole(userToEdit.role);
                setPassword(''); // Clear password for security
            } else {
                // Reset for creation
                setName('');
                setEmail('');
                setPassword('');
                setRole('Employee');
            }
        }
    }, [userToEdit, isOpen, isEditing]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || (!password && !isEditing)) return;
        
        if (isEditing) {
            const updatedData: User = { 
                ...userToEdit, 
                name, 
                email, 
                role,
            };
            if (password) {
                updatedData.password = password;
            }
            onSubmit(updatedData);
        } else {
            onSubmit({ name, email, role, password });
        }
        
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-surface dark:bg-dark-surface rounded-lg shadow-xl p-6 w-full max-w-md m-4">
                <h2 className="text-2xl font-bold mb-4 dark:text-white">{isEditing ? 'Editar Usuário' : 'Novo Usuário'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome Completo</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={isEditing ? 'Deixe em branco para não alterar' : ''} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required={!isEditing} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Função</label>
                            <select value={role} onChange={e => setRole(e.target.value as User['role'])} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
                                <option value="Employee">Funcionário</option>
                                <option value="Manager">Gerente</option>
                                <option value="Auditor">Auditor</option>
                                <option value="Administrator">Administrador</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors">Cancelar</button>
                        <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                            {isEditing ? 'Salvar Alterações' : 'Criar Usuário'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};