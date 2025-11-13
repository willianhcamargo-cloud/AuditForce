
import React from 'react';
import type { Meeting, User } from '../types';
import { UserAvatar } from './UserAvatar';

interface DailyMeetingsSidebarProps {
    selectedDate: Date;
    meetings: Meeting[];
    users: User[];
    onClose: () => void;
    onMeetingClick: (meeting: Meeting) => void;
}

export const DailyMeetingsSidebar: React.FC<DailyMeetingsSidebarProps> = ({ selectedDate, meetings, users, onClose, onMeetingClick }) => {
    
    return (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg shadow-inner h-full flex flex-col p-4 border dark:border-gray-700">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h3 className="text-lg font-bold text-on-surface dark:text-dark-on-surface">
                    Reuniões do Dia
                    <span className="block text-sm font-normal text-gray-500 dark:text-gray-400">
                        {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                    </span>
                </h3>
                 <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            <div className="overflow-y-auto flex-grow">
                {meetings.length > 0 ? (
                    <ul className="space-y-3">
                        {meetings.map(meeting => (
                            <li key={meeting.id}>
                                <button
                                    onClick={() => onMeetingClick(meeting)}
                                    className="w-full text-left p-3 bg-surface dark:bg-dark-surface rounded-lg shadow-sm hover:shadow-md hover:border-primary border border-transparent transition-all"
                                >
                                    <p className="font-semibold text-primary dark:text-dark-primary">{meeting.title}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 my-1">{meeting.startTime} - {meeting.endTime}</p>
                                    <div className="flex items-center space-x-1 mt-2">
                                        <div className="flex -space-x-2 overflow-hidden">
                                            {users.filter(u => meeting.attendeeIds.includes(u.id)).slice(0, 5).map(user => (
                                                <UserAvatar key={user.id} user={user} size="xs" />
                                            ))}
                                        </div>
                                         {meeting.attendeeIds.length > 5 && (
                                            <span className="text-xs text-gray-500 dark:text-gray-400 pl-2">+{meeting.attendeeIds.length - 5}</span>
                                        )}
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Nenhuma reunião agendada para este dia.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
