

import React, { useState, useMemo } from 'react';
import type { Audit, ActionPlan, User, AuditStatus } from '../types';
import { TaskStatus, FindingStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Legend as RechartsLegend } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';


interface DashboardProps {
    audits: Audit[];
    actionPlans: ActionPlan[];
    currentUser: User;
    onNavigate: (page: 'audits') => void;
}

const StatCard: React.FC<{ title: string; value: string | number; description: string }> = ({ title, value, description }) => (
    <div className="bg-surface dark:bg-dark-surface rounded-lg shadow-md p-6">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        <p className="mt-2 text-3xl font-bold text-on-surface dark:text-dark-on-surface">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
    </div>
);

const FINDING_COLORS = {
    [FindingStatus.Compliant]: '#10B981', // green-500
    [FindingStatus.NonCompliant]: '#EF4444', // red-500
};

const ACTION_PLAN_COLORS: Record<TaskStatus, string> = {
    [TaskStatus.Pending]: '#F59E0B',   // amber-500
    [TaskStatus.InProgress]: '#3B82F6', // blue-500
    [TaskStatus.Standby]: '#6B7280',    // gray-500
    [TaskStatus.Done]: '#10B981',       // green-500
};

const AUDIT_STATUS_COLORS: Record<AuditStatus, string> = {
    'Planejando': '#0EA5E9', // info
    'Em Execução': '#3B82F6', // primary
    'Plano de Ação': '#F59E0B', // warning
    'Concluído': '#10B981', // secondary
};


export const Dashboard: React.FC<DashboardProps> = ({ audits, actionPlans, currentUser, onNavigate }) => {
    const [selectedAuditId, setSelectedAuditId] = useState<string>('all');
    const { theme } = useTheme();

    const tickColor = theme === 'dark' ? '#9CA3AF' : '#6B7280';
    const gridColor = theme === 'dark' ? '#374151' : '#E5E7EB';
    const tooltipBg = theme === 'dark' ? '#1F2937' : '#FFFFFF';
    const tooltipColor = theme === 'dark' ? '#F9FAFB' : '#1F2937';

    const handleChartClick = () => {
        onNavigate('audits');
    };

    const visibleData = useMemo(() => {
        const visibleAudits = currentUser.role === 'Administrator'
            ? audits
            : audits.filter(audit => audit.auditorId === currentUser.id);

        const visibleFindingIds = new Set(
            visibleAudits.flatMap(audit => audit.findings.map(finding => finding.id))
        );
        
        // FIX: Added a check for 'plan.findingId' to prevent calling '.has()' with undefined,
        // which could cause a runtime error and prevent the dashboard from loading.
        const visibleActionPlans = actionPlans.filter(plan => plan.findingId && visibleFindingIds.has(plan.findingId));

        return { visibleAudits, visibleActionPlans };
    }, [audits, actionPlans, currentUser]);
    
    const { visibleAudits, visibleActionPlans } = visibleData;

    const filteredData = useMemo(() => {
        if (selectedAuditId === 'all') {
            return {
                audits: visibleAudits,
                actionPlans: visibleActionPlans,
            };
        }
        const selectedAudit = visibleAudits.find(a => a.id === selectedAuditId);
        if (!selectedAudit) return { audits: [], actionPlans: [] };

        const relevantActionPlans = visibleActionPlans.filter(p => selectedAudit.findings.some(f => f.id === p.findingId));
        return {
            audits: [selectedAudit],
            actionPlans: relevantActionPlans
        };
    }, [selectedAuditId, visibleAudits, visibleActionPlans]);

    const { audits: filteredAudits, actionPlans: filteredActionPlans } = filteredData;
    
    const auditsInProgress = filteredAudits.filter(a => ['Planejando', 'Em Execução', 'Plano de Ação'].includes(a.status)).length;
    const completedAudits = filteredAudits.filter(a => a.status === 'Concluído').length;
    const openActionPlans = filteredActionPlans.filter(p => p.status !== TaskStatus.Done).length;
    const totalNonCompliant = filteredAudits.reduce((acc, audit) => acc + audit.findings.filter(f => f.status === FindingStatus.NonCompliant).length, 0);

    const auditStatusData = useMemo(() => {
        const statusCounts = filteredAudits.reduce((acc, audit) => {
            acc[audit.status] = (acc[audit.status] || 0) + 1;
            return acc;
        }, {} as Record<AuditStatus, number>);

        return (['Planejando', 'Em Execução', 'Plano de Ação', 'Concluído'] as AuditStatus[])
            .map(status => ({
                name: status,
                value: statusCounts[status] || 0,
            }))
            .filter(item => item.value > 0);
    }, [filteredAudits]);

    const findingsStatusData = useMemo(() => {
        const compliant = filteredAudits.reduce((sum, audit) => sum + audit.findings.filter(f => f.status === FindingStatus.Compliant).length, 0);
        const nonCompliant = filteredAudits.reduce((sum, audit) => sum + audit.findings.filter(f => f.status === FindingStatus.NonCompliant).length, 0);
        return [
            { name: 'Conforme', value: compliant },
            { name: 'Não Conforme', value: nonCompliant },
        ];
    }, [filteredAudits]);

    const actionPlansStatusData = useMemo(() => {
        const statusCounts = filteredActionPlans.reduce((acc, plan) => {
            acc[plan.status] = (acc[plan.status] || 0) + 1;
            return acc;
        }, {} as Record<TaskStatus, number>);

        return ([TaskStatus.Pending, TaskStatus.InProgress, TaskStatus.Standby, TaskStatus.Done] as TaskStatus[])
            .map(status => ({
                name: status,
                value: statusCounts[status] || 0,
            }));
    }, [filteredActionPlans]);


    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h1 className="text-3xl font-bold text-on-surface dark:text-dark-on-surface">Dashboard</h1>
                 <div>
                    <label htmlFor="audit-filter" className="sr-only">Filtrar por Auditoria</label>
                    <select
                        id="audit-filter"
                        value={selectedAuditId}
                        onChange={(e) => setSelectedAuditId(e.target.value)}
                        className="bg-surface border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full md:w-auto p-2.5 dark:bg-dark-surface dark:border-gray-600 dark:text-dark-on-surface"
                    >
                        <option value="all">Todas as Auditorias</option>
                        {visibleAudits.map(audit => (
                            <option key={audit.id} value={audit.id}>
                                {audit.code} - {audit.title}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Auditorias em Andamento" value={auditsInProgress} description="Total de auditorias ativas" />
                <StatCard title="Auditorias Concluídas" value={completedAudits} description="Histórico de auditorias finalizadas" />
                <StatCard title="Planos de Ação Abertos" value={openActionPlans} description="Planos de ação pendentes" />
                <StatCard title="Achados Não Conformes" value={totalNonCompliant} description="Achados que requerem ação" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-surface dark:bg-dark-surface rounded-lg shadow-md p-6">
                     <h2 className="text-lg font-semibold text-on-surface dark:text-dark-on-surface mb-4">Auditorias por Status</h2>
                     <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={auditStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={{ fill: tickColor }} onClick={handleChartClick}>
                               {auditStatusData.map((entry) => (
                                    <Cell key={`cell-${entry.name}`} fill={AUDIT_STATUS_COLORS[entry.name as AuditStatus]} cursor="pointer" />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: tooltipBg, color: tooltipColor, border: `1px solid ${gridColor}` }} />
                            <RechartsLegend formatter={(value) => <span style={{ color: tickColor }}>{value}</span>} />
                        </PieChart>
                     </ResponsiveContainer>
                </div>
                <div className="bg-surface dark:bg-dark-surface rounded-lg shadow-md p-6">
                     <h2 className="text-lg font-semibold text-on-surface dark:text-dark-on-surface mb-4">Achados por Status</h2>
                     <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={findingsStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={{ fill: tickColor }} onClick={handleChartClick}>
                               <Cell key={`cell-0`} fill={FINDING_COLORS[FindingStatus.Compliant]} cursor="pointer" />
                               <Cell key={`cell-1`} fill={FINDING_COLORS[FindingStatus.NonCompliant]} cursor="pointer" />
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: tooltipBg, color: tooltipColor, border: `1px solid ${gridColor}` }} />
                            <RechartsLegend formatter={(value) => <span style={{ color: tickColor }}>{value}</span>} />
                        </PieChart>
                     </ResponsiveContainer>
                </div>
                 <div className="bg-surface dark:bg-dark-surface rounded-lg shadow-md p-6">
                     <h2 className="text-lg font-semibold text-on-surface dark:text-dark-on-surface mb-4">Planos de Ação por Status</h2>
                     <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={actionPlansStatusData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                            <XAxis dataKey="name" stroke={tickColor} />
                            <YAxis allowDecimals={false} stroke={tickColor} />
                            <Tooltip contentStyle={{ backgroundColor: tooltipBg, color: tooltipColor, border: `1px solid ${gridColor}` }} />
                            <Bar dataKey="value" name="Planos" onClick={handleChartClick} cursor="pointer">
                                {actionPlansStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={ACTION_PLAN_COLORS[entry.name as TaskStatus]} />
                                ))}
                            </Bar>
                        </BarChart>
                     </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};