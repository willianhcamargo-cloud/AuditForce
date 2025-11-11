import React, { useMemo, useState, useCallback } from 'react';
import type { Audit, User, AuditStatus } from '../types';
import { FindingStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertIcon } from './AlertIcon';
import { UserAvatar } from './UserAvatar';

interface AuditListProps {
    audits: Audit[];
    users: User[];
    onSelectAudit: (auditId: string) => void;
    onCreateAudit: () => void;
    onUpdateAuditStatus: (auditId: string, status: AuditStatus) => void;
    currentUser: User;
    onOpenReport: (auditId: string) => void;
}

const statusClasses: Record<AuditStatus, string> = {
    'Planejando': 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
    'Em Execução': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'Plano de Ação': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'Concluído': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

const GANTT_STATUS_COLORS: Record<AuditStatus, string> = {
    'Planejando': '#0EA5E9',
    'Em Execução': '#3B82F6',
    'Plano de Ação': '#F59E0B',
    'Concluído': '#10B981',
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-surface dark:bg-dark-surface p-3 rounded shadow-lg border dark:border-gray-600">
                <p className="font-bold text-on-surface dark:text-dark-on-surface">{`${data.name}: ${data.title}`}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Auditor: {data.auditorName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Período: {data.startDate} - {data.endDate}</p>
            </div>
        );
    }
    return null;
};

export const AuditList: React.FC<AuditListProps> = ({ audits, users, onSelectAudit, onCreateAudit, onUpdateAuditStatus, currentUser, onOpenReport }) => {
    const [isGanttVisible, setIsGanttVisible] = useState(false);

    const findUser = useCallback((id: string) => users.find(u => u.id === id), [users]);

    const visibleAudits = useMemo(() => {
        if (currentUser.role === 'Administrator') {
            return audits;
        }
        return audits.filter(audit => audit.auditorId === currentUser.id);
    }, [audits, currentUser]);

    const ganttData = useMemo(() => {
        const validAudits = visibleAudits.filter(a => a.startDate && a.endDate);
        if (!validAudits.length) return { data: [], domain: [0, 30] };

        const auditsWithDates = validAudits.map(a => ({
            ...a,
            startDateObj: new Date(a.startDate),
            endDateObj: new Date(a.endDate)
        }));

        const minDate = new Date(Math.min(...auditsWithDates.map(a => a.startDateObj.getTime())));
        minDate.setDate(minDate.getDate() - 5); // Add padding

        const dayInMillis = 1000 * 60 * 60 * 24;

        const data = auditsWithDates.map(audit => {
            const startOffset = Math.max(0, Math.floor((audit.startDateObj.getTime() - minDate.getTime()) / dayInMillis));
            const duration = Math.max(1, Math.ceil((audit.endDateObj.getTime() - audit.startDateObj.getTime()) / dayInMillis));

            return {
                name: audit.code,
                title: audit.title,
                auditorName: findUser(audit.auditorId)?.name || 'Desconhecido',
                startOffset,
                duration,
                status: audit.status,
                startDate: audit.startDateObj.toLocaleDateString('pt-BR'),
                endDate: audit.endDateObj.toLocaleDateString('pt-BR'),
            };
        }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        
        const maxEndOffset = Math.max(...data.map(d => d.startOffset + d.duration));

        return { data, domain: [0, maxEndOffset + 5] }; // Add padding to domain
    }, [visibleAudits, findUser]);
    
    return (
        <div className="bg-surface dark:bg-dark-surface rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-on-surface dark:text-dark-on-surface">Auditorias</h1>
                {currentUser.role === 'Administrator' && (
                    <button
                        onClick={onCreateAudit}
                        className="bg-primary hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Nova Auditoria
                    </button>
                )}
            </div>

            <div className="mb-6">
                <details onToggle={(e) => setIsGanttVisible((e.target as HTMLDetailsElement).open)}>
                    <summary className="cursor-pointer text-lg font-semibold text-primary dark:text-dark-primary select-none">
                        Visualização do Cronograma (Gantt)
                    </summary>
                    {isGanttVisible && (
                        ganttData.data.length > 0 ? (
                            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg" style={{ height: `${Math.max(200, ganttData.data.length * 50)}px` }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        layout="vertical"
                                        data={ganttData.data}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" domain={ganttData.domain} tickFormatter={(tick) => `Dia ${tick}`} stroke="currentColor" />
                                        <YAxis type="category" dataKey="name" width={120} stroke="currentColor" />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(156, 163, 175, 0.2)' }} />
                                        <Bar dataKey="startOffset" stackId="a" fill="transparent" />
                                        <Bar dataKey="duration" stackId="a">
                                            {ganttData.data.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={GANTT_STATUS_COLORS[entry.status]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="mt-4 p-4 text-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                Não há auditorias com datas definidas para exibir no cronograma.
                            </div>
                        )
                    )}
                </details>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Código</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Título da Auditoria</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Auditor</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Período</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Resultado</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-700">
                        {visibleAudits.map(audit => {
                            const totalFindings = audit.findings.length;
                            const nonCompliantFindings = audit.findings.filter(f => f.status === FindingStatus.NonCompliant).length;
                            const compliantOrNaFindings = totalFindings - nonCompliantFindings;
                            const compliancePercentage = totalFindings > 0 ? (compliantOrNaFindings / totalFindings) * 100 : 100;
                            const auditor = findUser(audit.auditorId);

                            const today = new Date();
                            today.setHours(0, 0, 0, 0); // Set to start of today for comparison
                            const endDate = new Date(audit.endDate);
                            const isOverdue = endDate < today && audit.status !== 'Concluído';
                            
                            return (
                                <tr key={audit.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-gray-400">{audit.code}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{audit.title}</div>
                                            {isOverdue && <AlertIcon />}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{audit.scope}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center gap-2">
                                            {auditor && <UserAvatar user={auditor} size="sm" />}
                                            <span>{auditor?.name || 'Desconhecido'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(audit.startDate).toLocaleDateString('pt-BR')} - {new Date(audit.endDate).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select
                                            value={audit.status}
                                            onChange={(e) => onUpdateAuditStatus(audit.id, e.target.value as AuditStatus)}
                                            onClick={(e) => e.stopPropagation()} // Prevent row click from triggering when changing status
                                            className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full border-2 border-transparent appearance-none text-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${statusClasses[audit.status]} ${audit.status === 'Concluído' ? 'cursor-default' : 'cursor-pointer'}`}
                                            disabled={audit.status === 'Concluído'}
                                            aria-label={`Status da auditoria ${audit.code}, atualmente ${audit.status}. Mude para alterar.`}
                                        >
                                            <option value="Planejando">Planejando</option>
                                            <option value="Em Execução">Em Execução</option>
                                            <option value="Plano de Ação">Plano de Ação</option>
                                            <option value="Concluído" disabled>Concluído</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-200">
                                        {compliancePercentage.toFixed(1)}%
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => onOpenReport(audit.id)}
                                                className="text-secondary hover:text-emerald-700 dark:text-secondary dark:hover:text-emerald-400 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                title="Relatório"
                                                aria-label={`Gerar relatório para auditoria ${audit.code}`}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                  <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 10v-4h12v4H4zm2-7a1 1 0 011-1h2a1 1 0 110 2H7a1 1 0 01-1-1zm4 0a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => onSelectAudit(audit.id)}
                                                className="text-primary hover:text-blue-700 dark:text-dark-primary dark:hover:text-blue-400 font-medium"
                                            >
                                                Ver Detalhes
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};