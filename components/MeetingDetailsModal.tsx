

import React from 'react';
import type { Meeting, Policy, User } from '../types';
import { UserAvatar } from './UserAvatar';

interface MeetingDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    meeting: Meeting | null;
    policy: Policy | undefined;
    attendees: User[];
    currentUser: User;
    onCancelMeeting: (meeting: Meeting) => void;
    onEditMeeting: (meeting: Meeting) => void;
}

const DetailItem: React.FC<{ label: string; value: string | number | undefined }> = ({ label, value }) => (
    <div>
        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{value || 'Não informado'}</dd>
    </div>
);

export const MeetingDetailsModal: React.FC<MeetingDetailsModalProps> = ({ isOpen, onClose, meeting, policy, attendees, currentUser, onCancelMeeting, onEditMeeting }) => {
    if (!isOpen || !meeting) return null;

    const canModify = currentUser.id === meeting.organizerId || currentUser.role === 'Administrator';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-surface dark:bg-dark-surface rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold text-on-surface dark:text-dark-on-surface">{meeting.title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto space-y-6">
                    <dl className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-6">
                        <DetailItem label="Data" value={new Date(meeting.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} />
                        <DetailItem label="Início" value={meeting.startTime} />
                        <DetailItem label="Fim" value={meeting.endTime} />
                    </dl>

                    {policy && (
                        <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Política Relacionada</dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 font-semibold">{policy.title}</dd>
                        </div>
                    )}

                    <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Pauta</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{meeting.description || 'Nenhuma pauta definida.'}</dd>
                    </div>

                    <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Participantes ({attendees.length})</dt>
                        <dd className="mt-2 space-y-2">
                            {attendees.map(user => (
                                <div key={user.id} className="flex items-center gap-3">
                                    <UserAvatar user={user} size="sm" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                                    </div>
                                </div>
                            ))}
                        </dd>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700 flex justify-end space-x-3">
                     {canModify && (
                         <button
                            onClick={() => {
                                onCancelMeeting(meeting);
                                onClose();
                            }}
                            className="bg-red-100 text-danger font-bold py-2 px-4 rounded-lg hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900 transition-colors"
                        >
                            Cancelar Reunião
                        </button>
                     )}
                     {canModify && (
                        <button
                            onClick={() => onEditMeeting(meeting)}
                            className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors"
                        >
                            Editar
                        </button>
                     )}
                    <button onClick={onClose} className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};