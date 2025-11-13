

import React, { useState, useMemo } from 'react';
import type { Meeting, Policy, User } from '../types';
import { MeetingDetailsModal } from './MeetingDetailsModal';
import { DailyMeetingsSidebar } from './DailyMeetingsSidebar';

interface PolicyCalendarProps {
    meetings: Meeting[];
    policies: Policy[];
    users: User[];
    currentUser: User;
    onOpenCreateMeeting: (date?: string) => void;
    onCancelMeeting: (meeting: Meeting) => void;
    onEditMeeting: (meeting: Meeting) => void;
}

const CalendarHeader: React.FC<{
    currentDate: Date;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onOpenCreateMeeting: () => void;
}> = ({ currentDate, onPrevMonth, onNextMonth, onOpenCreateMeeting }) => (
    <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
            <button onClick={onPrevMonth} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h2 className="text-xl font-bold w-48 text-center">
                {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </h2>
            <button onClick={onNextMonth} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
        </div>
        <button
            onClick={() => onOpenCreateMeeting()}
            className="bg-secondary hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center text-sm"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
            Agendar Reunião
        </button>
    </div>
);

const CalendarGrid: React.FC<{
    days: (Date | null)[];
    meetingsByDate: Map<string, Meeting[]>;
    selectedDate: Date | null;
    hoveredDay: Date | null;
    onDayClick: (day: Date | null) => void;
    onDayDoubleClick: (day: Date | null) => void;
    onEventClick: (meeting: Meeting) => void;
    onDayHover: (day: Date | null) => void;
}> = ({ days, meetingsByDate, selectedDate, hoveredDay, onDayClick, onDayDoubleClick, onEventClick, onDayHover }) => {
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
        <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            {weekdays.map(day => (
                <div key={day} className="text-center font-semibold text-sm py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">{day}</div>
            ))}
            {days.map((day, index) => {
                const dayKey = day ? day.toISOString().split('T')[0] : `empty-${index}`;
                const meetingsForDay = day ? meetingsByDate.get(dayKey) || [] : [];
                const isToday = day && day.getTime() === today.getTime();
                const isSelected = day && selectedDate && day.getTime() === selectedDate.getTime();
                const isHovered = day && hoveredDay && day.getTime() === hoveredDay.getTime();

                return (
                    <div 
                        key={index}
                        onDoubleClick={() => onDayDoubleClick(day)}
                        onMouseEnter={() => onDayHover(day)}
                        onMouseLeave={() => onDayHover(null)}
                        className={`bg-surface dark:bg-dark-surface p-2 min-h-[120px] overflow-hidden transition-colors duration-200 relative ${day ? 'cursor-pointer' : 'cursor-default'} ${isSelected ? 'border-2 border-primary' : ''}`}
                    >
                        {day && (
                            <div className={`text-sm font-semibold flex items-center justify-center ${isToday ? 'bg-primary text-white rounded-full w-6 h-6' : 'w-6 h-6'}`}>
                                {day.getDate()}
                            </div>
                        )}
                        <div className="mt-1 space-y-1">
                            {meetingsForDay.slice(0, 2).map(meeting => (
                                <button key={meeting.id} onClick={(e) => { e.stopPropagation(); onEventClick(meeting); }} className="w-full text-left text-xs bg-emerald-100 dark:bg-emerald-900/50 p-1.5 rounded-md hover:bg-emerald-200 dark:hover:bg-emerald-800/50 transition-colors">
                                    <p className="font-bold truncate text-emerald-800 dark:text-emerald-200">{meeting.title}</p>
                                    <p className="text-emerald-700 dark:text-emerald-300">{meeting.startTime}</p>
                                </button>
                            ))}
                            {meetingsForDay.length > 2 && (
                                <div className="text-xs text-center text-gray-500 dark:text-gray-400 mt-1">
                                    + {meetingsForDay.length - 2} mais
                                </div>
                            )}
                        </div>
                         {isHovered && meetingsForDay.length > 0 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDayClick(day);
                                }}
                                className="absolute bottom-1 right-1 p-1.5 rounded-full bg-gray-200 text-gray-600 hover:bg-primary hover:text-white dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-dark-primary transition-colors z-10"
                                title="Ver reuniões do dia"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
};


export const PolicyCalendar: React.FC<PolicyCalendarProps> = ({ meetings, policies, users, currentUser, onOpenCreateMeeting, onCancelMeeting, onEditMeeting }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [hoveredDay, setHoveredDay] = useState<Date | null>(null);

    const meetingsByDate = useMemo(() => {
        const map = new Map<string, Meeting[]>();
        meetings.forEach(meeting => {
            const dateKey = meeting.date;
            if (!map.has(dateKey)) {
                map.set(dateKey, []);
            }
            map.get(dateKey)?.push(meeting);
        });
        // Sort meetings by start time for each day
        for (const [key, value] of map.entries()) {
            value.sort((a, b) => a.startTime.localeCompare(b.startTime));
        }
        return map;
    }, [meetings]);

    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        
        const daysInMonth = lastDayOfMonth.getDate();
        const startDayOfWeek = firstDayOfMonth.getDay();

        const days: (Date | null)[] = [];
        
        for (let i = 0; i < startDayOfWeek; i++) {
            days.push(null);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }

        while (days.length % 7 !== 0) {
            days.push(null);
        }

        return days;
    }, [currentDate]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleDayClick = (day: Date | null) => {
        if (!day) return;
        if (selectedDate && day.getTime() === selectedDate.getTime()) {
            setIsSidebarOpen(!isSidebarOpen);
        } else {
            setSelectedDate(day);
            setIsSidebarOpen(true);
        }
    };
    
    const handleDayDoubleClick = (day: Date | null) => {
        if (!day) return;
        const dateString = day.toISOString().split('T')[0];
        onOpenCreateMeeting(dateString);
    };

    const meetingsForSelectedDay = useMemo(() => {
        if (!selectedDate) return [];
        const dateKey = selectedDate.toISOString().split('T')[0];
        return meetingsByDate.get(dateKey) || [];
    }, [selectedDate, meetingsByDate]);

    return (
        <div className="flex gap-6">
            <div className={`flex-grow transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-full lg:w-2/3' : 'w-full'}`}>
                <CalendarHeader 
                    currentDate={currentDate}
                    onPrevMonth={handlePrevMonth}
                    onNextMonth={handleNextMonth}
                    onOpenCreateMeeting={onOpenCreateMeeting}
                />
                <CalendarGrid 
                    days={calendarDays}
                    meetingsByDate={meetingsByDate}
                    selectedDate={selectedDate}
                    hoveredDay={hoveredDay}
                    onDayClick={handleDayClick}
                    onDayDoubleClick={handleDayDoubleClick}
                    onEventClick={(meeting) => setSelectedMeeting(meeting)}
                    onDayHover={setHoveredDay}
                />
            </div>
            {isSidebarOpen && selectedDate && (
                 <div className="w-full mt-6 lg:mt-0 lg:w-1/3 transition-opacity duration-300 ease-in-out">
                    <DailyMeetingsSidebar
                        selectedDate={selectedDate}
                        meetings={meetingsForSelectedDay}
                        users={users}
                        onClose={() => setIsSidebarOpen(false)}
                        onMeetingClick={(meeting) => setSelectedMeeting(meeting)}
                    />
                </div>
            )}
            {selectedMeeting && (
                <MeetingDetailsModal
                    isOpen={!!selectedMeeting}
                    onClose={() => setSelectedMeeting(null)}
                    meeting={selectedMeeting}
                    policy={policies.find(p => p.id === selectedMeeting.policyId)}
                    attendees={users.filter(u => selectedMeeting.attendeeIds.includes(u.id))}
                    currentUser={currentUser}
                    onCancelMeeting={onCancelMeeting}
                    onEditMeeting={(meeting) => {
                        onEditMeeting(meeting);
                        setSelectedMeeting(null);
                    }}
                />
            )}
        </div>
    );
};