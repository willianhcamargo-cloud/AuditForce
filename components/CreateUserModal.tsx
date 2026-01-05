
import React, { useState, useEffect, useRef } from 'react';
import type { User, UserSubmitData } from '../types';

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (userData: UserSubmitData) => void;
    userToEdit?: User | null;
    allUsers: User[];
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onSubmit, userToEdit, allUsers }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'Auditor' | 'Manager' | 'Employee' | 'Administrator'>('Employee');
    const [emailError, setEmailError] = useState('');
    
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isEditing = !!userToEdit;

    useEffect(() => {
        if (isOpen) {
            setEmailError('');
            setAvatarFile(null);
            if (isEditing) {
                setName(userToEdit.name);
                setEmail(userToEdit.email);
                setRole(userToEdit.role);
                setPassword(''); // Clear password for security
                setAvatarPreview(userToEdit.avatarUrl);
            } else {
                // Reset for creation
                setName('');
                setEmail('');
                setPassword('');
                setRole('Employee');
                setAvatarPreview(null);
            }
        }
    }, [userToEdit, isOpen, isEditing]);


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailError('Por favor, insira um endereço de e-mail válido.');
            return;
        }

        // Email duplication validation
        const lowerCaseEmail = email.toLowerCase();
        const isEmailTaken = allUsers.some(user => {
            if (isEditing && user.id === userToEdit.id) {
                return false; // Don't compare the user to themselves
            }
            return user.email.toLowerCase() === lowerCaseEmail;
        });

        if (isEmailTaken) {
            setEmailError('Este endereço de e-mail já está em uso.');
            return;
        }
        
        setEmailError('');

        if (!name || !email || (!password && !isEditing)) return;
        
        if (isEditing) {
            const updatedData: UserSubmitData = { 
                id: userToEdit.id,
                name, 
                email, 
                role,
                avatarFile,
            };
            if (password) {
                updatedData.password = password;
            }
            onSubmit(updatedData);
        } else {
            onSubmit({ name, email, role, password, avatarFile });
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

                        <div className="flex flex-col items-center space-y-2">
                           <img
                                src={avatarPreview || `https://i.pravatar.cc/150?u=${email || 'newUser'}`}
                                alt="Avatar"
                                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600"
                            />
                             <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="text-sm font-medium text-primary hover:text-blue-700 dark:text-dark-primary dark:hover:text-blue-400"
                            >
                                Alterar Foto
                            </button>
                             <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*"
                            />
                        </div>


                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome Completo</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required />
                            {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
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
