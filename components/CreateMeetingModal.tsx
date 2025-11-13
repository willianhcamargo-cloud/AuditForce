

import React, { useState, useMemo, useEffect } from 'react';
import type { Meeting, Policy, User } from '../types';
import { UserAvatar } from './UserAvatar';

interface CreateMeetingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (meetingData: Omit<Meeting, 'id' | 'organizerId'> | Meeting) => void;
    policies: Policy[];
    users: User[];
    defaultDate?: string | null;
    meetingToEdit?: Meeting | null;
}

export const CreateMeetingModal: React.FC<CreateMeetingModalProps> = ({ isOpen, onClose, onSave, policies, users, defaultDate, meetingToEdit }) => {
    const [title, setTitle] = useState('');
    const [policyId, setPolicyId] = useState('');
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [attendeeIds, setAttendeeIds] = useState<string[]>([]);
    const [description, setDescription] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const isEditing = !!meetingToEdit;

    useEffect(() => {
        if (isOpen) {
            if (isEditing && meetingToEdit) {
                setTitle(meetingToEdit.title);
                setPolicyId(meetingToEdit.policyId);
                setDate(meetingToEdit.date);
                setStartTime(meetingToEdit.startTime);
                setEndTime(meetingToEdit.endTime);
                setAttendeeIds(meetingToEdit.attendeeIds);
                setDescription(meetingToEdit.description);
            } else {
                setTitle('');
                setPolicyId('');
                setDate(defaultDate || '');
                setStartTime('');
                setEndTime('');
                setAttendeeIds([]);
                setDescription('');
            }
             setSearchQuery('');
        }
    }, [isOpen, defaultDate, meetingToEdit, isEditing]);

    const handleAddAttendee = (userId: string) => {
        if (!attendeeIds.includes(userId)) {
            setAttendeeIds(prev => [...prev, userId]);
        }
        setSearchQuery('');
    };

    const handleRemoveAttendee = (userId: string) => {
        setAttendeeIds(prev => prev.filter(id => id !== userId));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !policyId || !date || !startTime || !endTime || attendeeIds.length === 0) {
            alert("Por favor, preencha todos os campos obrigatórios e adicione ao menos um participante.");
            return;
        }

        const meetingData = {
            title,
            policyId,
            date,
            startTime,
            endTime,
            attendeeIds,
            description,
        };
        
        if (isEditing && meetingToEdit) {
            onSave({ ...meetingToEdit, ...meetingData });
        } else {
            onSave(meetingData);
        }
    };

    const filteredUsers = useMemo(() => {
        if (!searchQuery) return [];
        return users.filter(user =>
            !attendeeIds.includes(user.id) &&
            user.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, users, attendeeIds]);

    const selectedUsers = useMemo(() => {
        return users.filter(user => attendeeIds.includes(user.id));
    }, [attendeeIds, users]);


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-surface dark:bg-dark-surface rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
                <h2 className="text-2xl font-bold mb-4 dark:text-white flex-shrink-0">{isEditing ? 'Editar Reunião' : 'Agendar Reunião de Alinhamento'}</h2>
                <form onSubmit={handleSubmit} className="flex-grow flex flex-col overflow-hidden">
                    <div className="space-y-4 overflow-y-auto pr-2 flex-grow">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Título da Reunião</label>
                                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Política Relacionada</label>
                                <select value={policyId} onChange={e => setPolicyId(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
                                    <option value="">Selecione uma política</option>
                                    {policies.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data</label>
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Início</label>
                                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fim</label>
                                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Participantes</label>
                            <div className="mt-2 p-2 border border-gray-300 dark:border-gray-600 rounded-md min-h-[40px]">
                                <div className="flex flex-wrap gap-2">
                                    {selectedUsers.map(user => (
                                        <div key={user.id} className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full flex items-center px-2 py-1 text-sm">
                                            <UserAvatar user={user} size="xs" />
                                            <span className="ml-2 font-medium">{user.name}</span>
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveAttendee(user.id)} 
                                                className="ml-2 -mr-1 p-0.5 rounded-full text-blue-600 hover:bg-blue-200 dark:text-blue-300 dark:hover:bg-blue-700"
                                                aria-label={`Remover ${user.name}`}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="relative mt-2">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Digite para buscar um participante..."
                                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                                {filteredUsers.length > 0 && (
                                    <ul className="absolute z-10 w-full bg-surface dark:bg-dark-surface border border-gray-300 dark:border-gray-600 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
                                        {filteredUsers.map(user => (
                                            <li
                                                key={user.id}
                                                onClick={() => handleAddAttendee(user.id)}
                                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-3"
                                            >
                                                <UserAvatar user={user} size="sm" />
                                                <span className="text-sm dark:text-gray-200">{user.name}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pauta / Descrição</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Descreva os tópicos a serem discutidos..."></textarea>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3 flex-shrink-0 pt-4 border-t dark:border-gray-700">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors">Cancelar</button>
                        <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                            {isEditing ? 'Salvar Alterações' : 'Agendar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};