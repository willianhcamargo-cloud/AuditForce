// FIX: Replaced placeholder content with a full implementation of the useMockData hook.
import { useState, useCallback } from 'react';
import { FindingStatus, TaskStatus } from '../types';
import type { User, Audit, AuditGrid, ActionPlan, Finding, AuditStatus, Attachment } from '../types';

// Simple ID generator
const generateId = () => Math.random().toString(36).substring(2, 11);

// Initial Mock Data
const initialUsers: User[] = [
    { id: 'user-1', name: 'Alice Admin', email: 'admin@example.com', role: 'Administrator', avatarUrl: `https://i.pravatar.cc/150?u=user-1`, password: 'password' },
    { id: 'user-2', name: 'Bob Auditor', email: 'auditor@example.com', role: 'Auditor', avatarUrl: `https://i.pravatar.cc/150?u=user-2`, password: 'password' },
    { id: 'user-3', name: 'Charlie Manager', email: 'manager@example.com', role: 'Manager', avatarUrl: `https://i.pravatar.cc/150?u=user-3`, password: 'password' },
    { id: 'user-4', name: 'Diana Employee', email: 'employee@example.com', role: 'Employee', avatarUrl: `https://i.pravatar.cc/150?u=user-4`, password: 'password' },
];

const initialGrids: AuditGrid[] = [
    {
        id: 'grid-1',
        title: 'Segurança da Informação ISO 27001',
        description: 'Verificação dos controles de segurança da informação.',
        scope: 'TI',
        requirements: [
            { id: 'req-1-1', title: 'A.5.1 - Políticas para segurança da informação', description: 'Garantir que as políticas de SI estão definidas, aprovadas e publicadas.', guidance: 'Verificar a existência e a data da última revisão do documento de política de segurança.' },
            { id: 'req-1-2', title: 'A.6.1 - Organização da segurança da informação', description: 'Estabelecer um framework de gerenciamento para iniciar e controlar a implementação da SI.', guidance: 'Entrevistar o CISO e verificar a estrutura organizacional.' },
            { id: 'req-1-3', title: 'A.8.1 - Classificação da informação', description: 'Assegurar que a informação receba um nível de proteção apropriado.', guidance: 'Verificar exemplos de documentos classificados como Confidencial, Interno, etc.' },
        ]
    },
    {
        id: 'grid-2',
        title: 'Qualidade ISO 9001',
        description: 'Verificação dos processos de gestão da qualidade.',
        scope: 'Operações',
        requirements: [
            { id: 'req-2-1', title: '4.1 - Contexto da Organização', description: 'Entender a organização e seu contexto.', guidance: 'Analisar o planejamento estratégico e a análise SWOT.' },
            { id: 'req-2-2', title: '5.2 - Política da Qualidade', description: 'Estabelecer, implementar e manter uma política da qualidade.', guidance: 'Verificar se a política está comunicada e entendida na organização.' },
        ]
    }
];

const initialAudits: Audit[] = [
    {
        id: 'audit-1',
        code: 'AUD-TI-2023-001',
        title: 'Auditoria Interna de Segurança da Informação',
        scope: 'Infraestrutura de TI e Desenvolvimento',
        auditorId: 'user-2',
        startDate: '2023-10-01',
        endDate: '2023-10-15',
        status: 'Concluído',
        gridId: 'grid-1',
        findings: [
            { id: 'find-1-1', requirementId: 'req-1-1', title: 'A.5.1 - Políticas para segurança da informação', description: 'Política de segurança da informação desatualizada. Última revisão em 2020.', status: FindingStatus.NonCompliant, attachments: [] },
            { id: 'find-1-2', requirementId: 'req-1-2', title: 'A.6.1 - Organização da segurança da informação', description: 'Estrutura organizacional bem definida e comunicada.', status: FindingStatus.Compliant, attachments: [] },
            { id: 'find-1-3', requirementId: 'req-1-3', title: 'A.8.1 - Classificação da informação', description: 'Procedimento de classificação de informação implementado e seguido.', status: FindingStatus.Compliant, attachments: [] },
        ]
    },
    {
        id: 'audit-2',
        code: 'AUD-OP-2024-001',
        title: 'Auditoria de Processos de Qualidade',
        scope: 'Linha de Produção A',
        auditorId: 'user-2',
        startDate: '2024-03-01',
        endDate: '2024-03-10',
        status: 'Em Execução',
        gridId: 'grid-2',
        findings: [
            { id: 'find-2-1', requirementId: 'req-2-1', title: '4.1 - Contexto da Organização', description: 'Análise de contexto realizada e documentada.', status: FindingStatus.Compliant, attachments: [] },
            { id: 'find-2-2', requirementId: 'req-2-2', title: '5.2 - Política da Qualidade', description: '', status: FindingStatus.NotApplicable, attachments: [] },
        ]
    },
];

const initialActionPlans: ActionPlan[] = [
    {
        id: 'plan-1',
        findingId: 'find-1-1',
        what: 'Revisar e atualizar a Política de Segurança da Informação.',
        why: 'Para alinhar com as novas regulamentações e melhores práticas do mercado.',
        where: 'Departamento de TI e Compliance.',
        when: '2023-11-30',
        who: 'user-3',
        how: '1. Formar grupo de trabalho. 2. Realizar benchmark. 3. Redigir nova versão. 4. Obter aprovação do comitê. 5. Publicar e comunicar.',
        howMuch: 1500,
        status: TaskStatus.Done,
    }
];


export const useMockData = () => {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [grids, setGrids] = useState<AuditGrid[]>(initialGrids);
    const [audits, setAudits] = useState<Audit[]>(initialAudits);
    const [actionPlans, setActionPlans] = useState<ActionPlan[]>(initialActionPlans);

    const addUser = useCallback((userData: Omit<User, 'id' | 'avatarUrl'>) => {
        const newUser: User = {
            id: generateId(),
            avatarUrl: `https://i.pravatar.cc/150?u=${generateId()}`,
            ...userData,
        };
        setUsers(current => [...current, newUser]);
    }, []);

    const addAudit = useCallback((auditData: Omit<Audit, 'id' | 'findings' | 'status' | 'code'>) => {
        const grid = grids.find(g => g.id === auditData.gridId);
        if (!grid) return;

        const newAudit: Audit = {
            id: generateId(),
            code: `AUD-NEW-${Math.floor(Math.random() * 1000)}`,
            status: 'Planejando',
            findings: grid.requirements.map(req => ({
                id: generateId(),
                requirementId: req.id,
                title: req.title,
                description: '',
                status: FindingStatus.NotApplicable,
                attachments: [],
            })),
            ...auditData,
        };
        setAudits(current => [...current, newAudit]);
    }, [grids]);
    
    const saveGrid = useCallback((gridData: AuditGrid | Omit<AuditGrid, 'id'>) => {
        if ('id' in gridData) {
            setGrids(current => current.map(g => g.id === gridData.id ? { ...g, ...gridData } : g));
        } else {
            const newGrid: AuditGrid = {
                id: generateId(),
                ...gridData,
                requirements: gridData.requirements.map(r => ({ ...r, id: generateId() }))
            };
            setGrids(current => [...current, newGrid]);
        }
    }, []);

    const deleteGrid = useCallback((gridId: string) => {
        const isUsed = audits.some(a => a.gridId === gridId);
        if (isUsed) {
            alert("Não é possível excluir esta grade, pois ela está sendo utilizada em uma ou mais auditorias.");
            return;
        }
        setGrids(current => current.filter(g => g.id !== gridId));
    }, [audits]);

    const saveActionPlan = useCallback((planData: Omit<ActionPlan, 'id'> | ActionPlan) => {
        if ('id' in planData) {
            setActionPlans(current => current.map(p => p.id === planData.id ? { ...p, ...planData } : p));
        } else {
            const newPlan: ActionPlan = {
                id: generateId(),
                ...(planData as Omit<ActionPlan, 'id'>)
            };
            setActionPlans(current => [...current, newPlan]);
        }
    }, []);

    const updateActionPlanStatus = useCallback((planId: string, newStatus: TaskStatus) => {
        setActionPlans(currentPlans => 
            currentPlans.map(p => (p.id === planId ? { ...p, status: newStatus } : p))
        );
    }, []);
    
    const updateFindingStatus = useCallback((findingId: string, status: FindingStatus) => {
        setAudits(currentAudits =>
            currentAudits.map(audit => {
                const isTargetAudit = audit.findings.some(f => f.id === findingId);
                if (!isTargetAudit) {
                    return audit;
                }

                const updatedFindings = audit.findings.map(finding =>
                    finding.id === findingId ? { ...finding, status } : finding
                );
                
                // Manual completion: Only update findings, not the audit status automatically.
                return {
                    ...audit,
                    findings: updatedFindings,
                };
            })
        );
    }, []);

    const updateFindingDescription = useCallback((findingId: string, description: string) => {
         setAudits(currentAudits => currentAudits.map(audit => ({
            ...audit,
            findings: audit.findings.map(finding => 
                finding.id === findingId ? { ...finding, description } : finding
            )
        })));
    }, []);

    const addAttachment = useCallback((findingId: string, file: File) => {
        const newAttachment: Attachment = {
            id: generateId(),
            name: file.name,
            url: URL.createObjectURL(file),
            size: file.size,
        };

        setAudits(currentAudits => currentAudits.map(audit => ({
            ...audit,
            findings: audit.findings.map(finding =>
                finding.id === findingId
                    ? { ...finding, attachments: [...finding.attachments, newAttachment] }
                    : finding
            )
        })));
    }, []);

    const deleteAttachment = useCallback((findingId: string, attachmentId: string) => {
        setAudits(currentAudits => currentAudits.map(audit => ({
            ...audit,
            findings: audit.findings.map(finding =>
                finding.id === findingId
                    ? { ...finding, attachments: finding.attachments.filter(att => att.id !== attachmentId) }
                    : finding
            )
        })));
    }, []);

    const updateAuditStatus = useCallback((auditId: string, status: AuditStatus) => {
        setAudits(current => current.map(a => a.id === auditId ? { ...a, status } : a));
    }, []);

    return {
        users,
        grids,
        audits,
        actionPlans,
        addUser,
        addAudit,
        saveGrid,
        deleteGrid,
        saveActionPlan,
        updateActionPlanStatus,
        updateFindingStatus,
        updateFindingDescription,
        addAttachment,
        deleteAttachment,
        updateAuditStatus
    };
};