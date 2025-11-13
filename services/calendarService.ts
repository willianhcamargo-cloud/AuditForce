
import type { Meeting, Policy, User } from '../types';

// Helper to format date/time for iCalendar UTC format (YYYYMMDDTHHMMSSZ)
const formatICSDate = (date: string, time: string): string => {
    // Assumes date is 'YYYY-MM-DD' and time is 'HH:MM'
    const d = new Date(`${date}T${time}:00`);
    // Check for invalid date
    if (isNaN(d.getTime())) {
        return new Date().toISOString().replace(/[-:]|\.\d{3}/g, '');
    }
    return d.toISOString().replace(/[-:]|\.\d{3}/g, '');
};


export const generateICSFile = (meeting: Meeting, policy: Policy | undefined, attendees: User[], organizer: User): { content: string, filename: string } => {
    const now = new Date().toISOString().replace(/[-:]|\.\d{3}/g, '');
    const summary = meeting.title;
    const description = `Política Relacionada: ${policy?.title || 'N/A'}\\n\\nPauta da Reunião:\\n${meeting.description.replace(/\n/g, '\\n')}`;

    const attendeesICS = attendees.map(user => 
        `ATTENDEE;CN="${user.name}";ROLE=REQ-PARTICIPANT:mailto:${user.email}`
    ).join('\r\n');

    const content = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//AuditForce//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:REQUEST',
        'BEGIN:VEVENT',
        `UID:${meeting.id}@auditforce.com`,
        `DTSTAMP:${now}`,
        `DTSTART:${formatICSDate(meeting.date, meeting.startTime)}`,
        `DTEND:${formatICSDate(meeting.date, meeting.endTime)}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description}`,
        `ORGANIZER;CN="${organizer.name}":mailto:${organizer.email}`,
        attendeesICS,
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n'); // Use CRLF line endings for iCalendar spec

    // Create a filename from the meeting title, sanitizing it
    const filename = `${summary.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;

    return { content, filename };
};
