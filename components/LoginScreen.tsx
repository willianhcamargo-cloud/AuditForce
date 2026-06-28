
import React, { useState, useEffect } from 'react';
import type { User } from '../types';

interface LoginScreenProps {
    users: User[];
    onLogin: (email: string, password?: string) => boolean;
    onSetAdminPassword: (email: string, password: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLogin, onSetAdminPassword }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isFirstTimeAdmin, setIsFirstTimeAdmin] = useState(false);

    useEffect(() => {
        const lowerEmail = email.toLowerCase();
        const adminUser = users.find(u => u.email.toLowerCase() === lowerEmail && u.role === 'Administrator');
        setIsFirstTimeAdmin(!!(adminUser && !adminUser.password));
    }, [email, users]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (isFirstTimeAdmin) {
            if (!password) {
                setError('A senha é obrigatória.');
                return;
            }
            if (password.length < 4) {
                setError('A senha deve ter pelo menos 4 caracteres.');
                return;
            }
            if (password !== confirmPassword) {
                setError('As senhas não coincidem.');
                return;
            }
            onSetAdminPassword(email, password);
        } else {
            const success = onLogin(email, password);
            if (!success) {
                setError('Email ou senha inválidos.');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                 <h1 className="text-center text-4xl font-extrabold text-primary dark:text-dark-primary">
                    AuditForce
                 </h1>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                    {isFirstTimeAdmin ? 'Defina sua senha de Administrador' : 'Acesse sua conta'}
                </h2>
                {isFirstTimeAdmin && (
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        Este é o seu primeiro acesso como administrador. Por questões de segurança, defina uma senha.
                    </p>
                )}
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm" role="alert">{error}</div>}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Endereço de email
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password"
                                   className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {isFirstTimeAdmin ? 'Defina a Senha' : 'Senha'}
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                />
                            </div>
                        </div>

                        {isFirstTimeAdmin && (
                            <div>
                                <label htmlFor="confirmPassword"
                                       className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Confirmar Senha
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            >
                                {isFirstTimeAdmin ? 'Definir Senha e Entrar' : 'Entrar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};