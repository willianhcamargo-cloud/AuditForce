
import React, { useState } from 'react';
import type { Audit, AuditGrid, User, ActionPlan } from '../types';
import { FindingStatus, TaskStatus } from '../types';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { UserAvatar } from './UserAvatar';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: {
        audit: Audit;
        grid: AuditGrid;
        auditor?: User;
        actionPlans: ActionPlan[];
        users: User[];
    } | null;
}

const FINDING_COLORS = {
    [FindingStatus.Compliant]: '#10B981',
    [FindingStatus.NonCompliant]: '#EF4444',
    [FindingStatus.NotApplicable]: '#9CA3AF',
};
const TASK_STATUS_CLASSES: Record<TaskStatus, string> = {
    [TaskStatus.Pending]: 'bg-yellow-100 text-yellow-800',
    [TaskStatus.InProgress]: 'bg-blue-100 text-blue-800',
    [TaskStatus.Standby]: 'bg-gray-100 text-gray-800',
    [TaskStatus.Done]: 'bg-green-100 text-green-800',
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-6 page-break">
        <h2 className="text-xl font-bold border-b-2 border-primary pb-1 mb-3">{title}</h2>
        {children}
    </div>
);

const DetailItem: React.FC<{ label: string; value: string | React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-sm font-semibold text-gray-600">{label}</p>
        <div className="text-base text-gray-800 flex items-center gap-2 mt-1">{value}</div>
    </div>
);

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, data }) => {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownloadPdf = async () => {
        const reportContentElement = document.getElementById('report-content');
        if (!reportContentElement || !data) return;
    
        setIsDownloading(true);
    
        // Get the original width to maintain the layout in the clone.
        const originalWidth = reportContentElement.offsetWidth;
        
        // Create a container for a clone of the report content.
        // This container will be positioned off-screen.
        const printContainer = document.createElement('div');
        printContainer.style.position = 'absolute';
        printContainer.style.left = '-9999px';
        printContainer.style.top = '0px';
        printContainer.style.width = `${originalWidth}px`;
        
        // Clone the report content.
        const clone = reportContentElement.cloneNode(true) as HTMLElement;
    
        // Append the clone to the container, and the container to the body.
        printContainer.appendChild(clone);
        document.body.appendChild(printContainer);
    
        try {
            // Run html2canvas on the off-screen, fully rendered clone.
            const canvas = await html2canvas(clone, {
                scale: 2, // Use a higher scale for better resolution.
                useCORS: true,
                logging: false,
            });
    
            // The rest of the PDF generation logic remains largely the same.
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
    
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
    
            const imgProps = pdf.getImageProperties(imgData);
            const imgWidth = imgProps.width;
            const imgHeight = imgProps.height;
            
            // Calculate the height of the image in the PDF, maintaining aspect ratio.
            const ratio = imgWidth / pdfWidth;
            const pdfImageHeight = imgHeight / ratio;
    
            let heightLeft = pdfImageHeight;
            let position = 0;
    
            // Add the first page.
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfImageHeight);
            heightLeft -= pdfHeight;
    
            // Loop to add new pages if the content is taller than one page.
            while (heightLeft > 0) {
                position -= pdfHeight; // Move the image "up" to show the next part.
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfImageHeight);
                heightLeft -= pdfHeight;
            }
    
            // Open the generated PDF in a new browser tab.
            const pdfBlob = pdf.output('blob');
            const pdfUrl = URL.createObjectURL(pdfBlob);
            window.open(pdfUrl, '_blank');
    
        } catch (error) {
            console.error("Erro ao gerar o PDF:", error);
            alert("Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.");
        } finally {
            setIsDownloading(false);
            // Important: Clean up the DOM by removing the temporary container.
            document.body.removeChild(printContainer);
        }
    };
    
    if (!isOpen || !data) return null;

    const { audit, grid, auditor, actionPlans, users } = data;

    const findingsByStatus = {
        [FindingStatus.Compliant]: audit.findings.filter(f => f.status === FindingStatus.Compliant).length,
        [FindingStatus.NonCompliant]: audit.findings.filter(f => f.status === FindingStatus.NonCompliant).length,
        [FindingStatus.NotApplicable]: audit.findings.filter(f => f.status === FindingStatus.NotApplicable).length,
    };

    const pieData = Object.entries(findingsByStatus)
        .map(([name, value]) => ({ name, value }))
        .filter(item => item.value > 0);
    
    const findUser = (id: string) => users.find(u => u.id === id);

    const totalFindings = audit.findings.length;
    const nonCompliantFindings = findingsByStatus[FindingStatus.NonCompliant];
    const compliantOrNaFindings = totalFindings - nonCompliantFindings;
    const compliancePercentage = totalFindings > 0 ? (compliantOrNaFindings / totalFindings) * 100 : 100;

    const getComplianceColor = (percentage: number) => {
        if (percentage >= 90) return 'text-green-600';
        if (percentage >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 print:hidden">
            <div className="bg-surface text-on-surface rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold">Relatório de Auditoria: {audit.code}</h2>
                    <div className="space-x-2">
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto bg-white" id="report-content">
                    {/* Header */}
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">{audit.title}</h1>
                        <p className="text-lg text-gray-500">{audit.code}</p>
                        <p className="text-sm text-gray-500">AuditForce - Relatório de Auditoria Interna</p>
                    </header>

                    {/* Summary Section */}
                    <Section title="Resumo da Auditoria">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <DetailItem label="Escopo" value={audit.scope} />
                            <DetailItem label="Auditor" value={<>{auditor && <UserAvatar user={auditor} size="sm" />} <span>{auditor?.name || 'N/A'}</span></>} />
                            <DetailItem label="Período" value={`${new Date(audit.startDate).toLocaleDateString('pt-BR')} - ${new Date(audit.endDate).toLocaleDateString('pt-BR')}`} />
                            <DetailItem label="Status Final" value={<span className="font-bold">{audit.status}</span>} />
                            <DetailItem 
                                label="Percentual de Conformidade" 
                                value={
                                    <span className={`font-bold text-lg ${getComplianceColor(compliancePercentage)}`}>
                                        {compliancePercentage.toFixed(1)}%
                                    </span>
                                } 
                            />
                        </div>
                    </Section>

                    {/* Statistics and Chart */}
                    <Section title="Estatísticas dos Achados">
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="w-full md:w-1/2">
                                <h3 className="font-semibold mb-2">Resumo dos Achados</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    <li><span className="font-semibold">Total de Requisitos Verificados:</span> {audit.findings.length}</li>
                                    <li><span className="font-semibold text-green-600">Conforme:</span> {findingsByStatus[FindingStatus.Compliant]}</li>
                                    <li><span className="font-semibold text-red-600">Não Conforme:</span> {findingsByStatus[FindingStatus.NonCompliant]}</li>
                                    <li><span className="font-semibold text-gray-600">Não Aplicável:</span> {findingsByStatus[FindingStatus.NotApplicable]}</li>
                                </ul>
                            </div>
                            <div className="w-full md:w-1/2 h-56">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                            {pieData.map(entry => <Cell key={`cell-${entry.name}`} fill={FINDING_COLORS[entry.name as FindingStatus]} />)}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </Section>

                    {/* Findings Details */}
                    <Section title="Detalhes dos Achados">
                        <div className="space-y-4">
                            {audit.findings.map(finding => (
                                <div key={finding.id} className="border p-3 rounded-md page-break">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-semibold">{grid.requirements.find(r => r.id === finding.requirementId)?.title}</h4>
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${finding.status === FindingStatus.Compliant ? 'bg-green-100 text-green-800' : finding.status === FindingStatus.NonCompliant ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>{finding.status}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2">{finding.description || 'Nenhuma consideração registrada.'}</p>
                                </div>
                            ))}
                        </div>
                    </Section>

                    {/* Action Plans */}
                    {actionPlans.length > 0 && (
                        <Section title="Planos de Ação">
                            <div className="space-y-4">
                                {actionPlans.map(plan => {
                                    const responsibleUser = findUser(plan.who);
                                    return (
                                        <div key={plan.id} className="border p-4 rounded-md page-break">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-semibold">{plan.what}</h4>
                                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${TASK_STATUS_CLASSES[plan.status]}`}>{plan.status}</span>
                                            </div>
                                            <p className="text-sm text-gray-500 mb-2">Referente ao achado: {audit.findings.find(f => f.id === plan.findingId)?.title}</p>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                                <DetailItem label="Responsável" value={<>{responsibleUser && <UserAvatar user={responsibleUser} size="xs" />} <span>{responsibleUser?.name || 'N/A'}</span></>} />
                                                <DetailItem label="Prazo" value={new Date(plan.when).toLocaleDateString('pt-BR')} />
                                                <DetailItem label="Onde" value={plan.where} />
                                                <DetailItem label="Custo" value={plan.howMuch ? `R$${plan.howMuch.toFixed(2)}` : 'N/A'} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Section>
                    )}
                </div>
                 <div className="p-4 bg-gray-50 border-t flex justify-end">
                    <button 
                        onClick={handleDownloadPdf} 
                        disabled={isDownloading}
                        className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 flex items-center"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        {isDownloading ? 'Gerando...' : 'Visualizar PDF'}
                    </button>
                </div>
            </div>
        </div>
    );
};
