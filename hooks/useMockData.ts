// FIX: Replaced placeholder content with a full implementation of the useMockData hook.
import { useState, useCallback } from 'react';
import { FindingStatus, TaskStatus } from '../types';
import type { User, Audit, AuditGrid, ActionPlan, Finding, AuditStatus, Attachment, Policy, PolicyStatus, PerformanceIndicator, Meeting, Notification, FollowUp } from '../types';

// Simple ID generator
const generateId = () => Math.random().toString(36).substring(2, 11);

// Initial Mock Data
const initialUsers: User[] = [
    { id: 'user-1', name: 'Willian Huller', email: 'willianhcamargo@gmail.com', role: 'Administrator', avatarUrl: `https://i.pravatar.cc/150?u=user-1`, status: 'Offline' },
    { id: 'user-2', name: 'Bob Auditor', email: 'auditor@example.com', role: 'Auditor', avatarUrl: `https://i.pravatar.cc/150?u=user-2`, password: 'password', status: 'Offline' },
    { id: 'user-3', name: 'Charlie Manager', email: 'manager@outlook.com', role: 'Manager', avatarUrl: `https://i.pravatar.cc/150?u=user-3`, password: 'password', status: 'Offline' },
    { id: 'user-4', name: 'Diana Employee', email: 'employee@example.com', role: 'Employee', avatarUrl: `https://i.pravatar.cc/150?u=user-4`, password: 'password', status: 'Offline' },
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
        followUps: [],
    }
];

const initialPolicies: Policy[] = [
    {
        id: 'pol-1',
        title: 'Política de Segurança da Informação',
        category: 'Segurança da Informação',
        version: '2.1',
        content: `### 1. Objetivo\nEsta política estabelece as diretrizes para a proteção dos ativos de informação da empresa.\n\n### 2. Escopo\nAplica-se a todos os colaboradores, prestadores de serviço e parceiros.\n\n### 3. Diretrizes\n* **Classificação da Informação:** Toda informação deve ser classificada quanto ao seu nível de confidencialidade.\n* **Controle de Acesso:** O acesso aos sistemas deve ser baseado no princípio do menor privilégio.`,
        status: 'Publicado',
        createdAt: '2022-01-15T09:00:00Z',
        updatedAt: '2023-08-20T14:30:00Z',
        performanceIndicators: [
            {
                id: 'pi-1',
                objective: 'Garantir a confidencialidade, integridade e disponibilidade das informações da empresa.',
                department: 'TI',
                responsibleId: 'user-3',
                goal: 95,
                actualValue: 98,
            },
            {
                id: 'pi-2',
                objective: 'Reduzir incidentes de segurança em 15% até o final do ano.',
                department: 'TI',
                responsibleId: 'user-2',
                goal: 15,
                actualValue: 10,
            }
        ]
    },
    {
        id: 'pol-2',
        title: 'Política de Home Office',
        category: 'Recursos Humanos',
        version: '1.0',
        content: `### 1. Elegibilidade\nColaboradores em regime de trabalho remoto devem seguir as diretrizes de segurança e produtividade estabelecidas.\n\n### 2. Ferramentas\nA empresa fornecerá os equipamentos necessários para a realização do trabalho remoto.`,
        status: 'Publicado',
        createdAt: '2023-03-10T11:00:00Z',
        updatedAt: '2023-03-10T11:00:00Z',
        performanceIndicators: [
            {
                id: 'pi-3',
                objective: 'Definir as regras e responsabilidades para o trabalho remoto, assegurando a produtividade e o bem-estar dos colaboradores.',
                department: 'RH',
                responsibleId: 'user-3',
                goal: 100,
                actualValue: 95,
            }
        ]
    },
     {
        id: 'pol-3',
        title: 'Código de Conduta e Ética',
        category: 'Compliance',
        version: '0.9',
        content: `### Em revisão\nO código de conduta está atualmente em processo de revisão pelo comitê de ética.`,
        status: 'Rascunho',
        createdAt: '2024-01-05T10:00:00Z',
        updatedAt: '2024-02-10T16:00:00Z',
        performanceIndicators: [
             {
                id: 'pi-4',
                objective: 'Estabelecer os princípios éticos e de conduta esperados de todos os colaboradores.',
                department: 'Compliance',
                responsibleId: 'user-1',
                goal: 100,
                actualValue: 0,
            }
        ]
    },
];

const initialMeetings: Meeting[] = [
    {
        id: 'meet-1',
        policyId: 'pol-1',
        title: 'Revisão Trimestral PSI',
        description: 'Alinhamento sobre os indicadores da Política de Segurança da Informação e próximos passos.',
        date: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split('T')[0], // 5 days from now
        startTime: '14:00',
        endTime: '15:30',
        attendeeIds: ['user-1', 'user-2', 'user-3'],
        organizerId: 'user-1',
    },
];

const initialNotifications: Notification[] = [];


export const useMockData = () => {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [grids, setGrids] = useState<AuditGrid[]>(initialGrids);
    const [audits, setAudits] = useState<Audit[]>(initialAudits);
    const [actionPlans, setActionPlans] = useState<ActionPlan[]>(initialActionPlans);
    const [policies, setPolicies] = useState<Policy[]>(initialPolicies);
    const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

    const addUser = useCallback((userData: Omit<User, 'id' | 'avatarUrl' | 'status'> & { avatarUrl?: string }) => {
        const newUser: User = {
            id: generateId(),
            avatarUrl: userData.avatarUrl || `https://i.pravatar.cc/150?u=${generateId()}`,
            status: 'Offline',
            ...userData,
        };
        setUsers(current => [...current, newUser]);
    }, []);
    
    const updateUser = useCallback((userData: User) => {
        setUsers(current => current.map(u => u.id === userData.id ? { ...u, ...userData } : u));
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

    const saveActionPlan = useCallback((planData: Omit<ActionPlan, 'id' | 'followUps'> | ActionPlan) => {
        let responsibleId: string;
        let isNew = false;
        let oldResponsibleId: string | undefined = undefined;
        let message = '';

        if ('id' in planData) {
            // Editing
            const existingPlan = actionPlans.find(p => p.id === planData.id);
            oldResponsibleId = existingPlan?.who;
            setActionPlans(current => current.map(p => p.id === planData.id ? { ...p, ...planData } : p));
            responsibleId = planData.who;
        } else {
            // Creating
            isNew = true;
            const newPlan: ActionPlan = {
                id: generateId(),
                followUps: [],
                ...(planData as Omit<ActionPlan, 'id' | 'followUps'>)
            };
            setActionPlans(current => [...current, newPlan]);
            responsibleId = newPlan.who;
        }
        
        // Generate notification message based on context
        if (planData.findingId) {
            const audit = audits.find(a => a.findings.some(f => f.id === planData.findingId));
            const finding = audit?.findings.find(f => f.id === planData.findingId);
            message = `Você foi designado como responsável pelo plano de ação "${planData.what}" no achado "${finding?.title || 'N/A'}".`;
        } else if (planData.performanceIndicatorId) {
            const policy = policies.find(p => p.performanceIndicators.some(i => i.id === planData.performanceIndicatorId));
            const indicator = policy?.performanceIndicators.find(i => i.id === planData.performanceIndicatorId);
            message = `Você foi designado como responsável pelo plano de ação para o indicador "${indicator?.objective || 'N/A'}" na política "${policy?.title || 'N/A'}".`;
        }


        // Generate notification if the responsible person is new or changed
        if ((isNew || (oldResponsibleId && oldResponsibleId !== responsibleId)) && responsibleId && message) {
            const newNotification: Notification = {
                id: generateId(),
                userId: responsibleId,
                message: message,
                timestamp: new Date().toISOString(),
                read: false,
            };
            setNotifications(current => [...current, newNotification]);
        }
    }, [actionPlans, audits, policies]);

    const updateActionPlanStatus = useCallback((planId: string, newStatus: TaskStatus) => {
        setActionPlans(currentPlans => 
            currentPlans.map(p => (p.id === planId ? { ...p, status: newStatus } : p))
        );
    }, []);
    
    const addFollowUpToActionPlan = useCallback((planId: string, content: string, authorId: string) => {
        const newFollowUp: FollowUp = {
            id: generateId(),
            authorId,
            content,
            timestamp: new Date().toISOString(),
        };

        let planToUpdate: ActionPlan | undefined;

        setActionPlans(current =>
            current.map(plan => {
                if (plan.id === planId) {
                    planToUpdate = {
                        ...plan,
                        followUps: [newFollowUp, ...plan.followUps],
                    };
                    return planToUpdate;
                }
                return plan;
            })
        );
        
        // Notify the responsible person (if it's not the same person who added the follow-up)
        if (planToUpdate && planToUpdate.who !== authorId) {
             const author = users.find(u => u.id === authorId);
             const message = `${author?.name || 'Alguém'} adicionou um novo follow-up no plano de ação "${planToUpdate.what}".`;
             const newNotification: Notification = {
                id: generateId(),
                userId: planToUpdate.who,
                message: message,
                timestamp: new Date().toISOString(),
                read: false,
            };
            setNotifications(current => [...current, newNotification]);
        }

    }, [users]);
    
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
        const auditToUpdate = audits.find(a => a.id === auditId);
        if (!auditToUpdate) return;
    
        const isAlreadyCompleted = auditToUpdate.status === 'Concluído';
    
        setAudits(current => current.map(a => (a.id === auditId ? { ...a, status } : a)));
    
        if (status === 'Concluído' && !isAlreadyCompleted) {
            const admins = users.filter(u => u.role === 'Administrator');
            const message = `A auditoria "${auditToUpdate.code} - ${auditToUpdate.title}" foi concluída.`;
            const now = new Date().toISOString();
    
            const newNotifications: Notification[] = admins.map(admin => ({
                id: generateId(),
                userId: admin.id,
                message: message,
                timestamp: now,
                read: false,
            }));
    
            setNotifications(current => [...current, ...newNotifications]);
        }
    }, [audits, users]);
    
    const savePolicy = useCallback((policyData: Omit<Policy, 'id' | 'version' | 'createdAt' | 'updatedAt'> | Policy) => {
        const now = new Date().toISOString();
        if ('id' in policyData) {
            // Editing existing policy
            const existingPolicy = policies.find(p => p.id === policyData.id);
            if (!existingPolicy) return;
            
            let shouldBumpVersion = false;

            // 1. Check for changes in main fields
            if (
                policyData.title !== existingPolicy.title ||
                policyData.category !== existingPolicy.category ||
                policyData.content !== existingPolicy.content
            ) {
                shouldBumpVersion = true;
            }

            // 2. Check for changes in performance indicators (anything except actualValue)
            if (!shouldBumpVersion) {
                const newIndicators = policyData.performanceIndicators;
                const oldIndicators = existingPolicy.performanceIndicators;

                if (newIndicators.length !== oldIndicators.length) {
                    shouldBumpVersion = true;
                } else {
                    const oldIndicatorsMap = new Map<string, PerformanceIndicator>(oldIndicators.map(i => [i.id, i]));
                    for (const newIndicator of newIndicators) {
                        const oldIndicator = oldIndicatorsMap.get(newIndicator.id);
                        if (!oldIndicator || // A new indicator was added, and an old one was removed
                            newIndicator.objective !== oldIndicator.objective ||
                            newIndicator.department !== oldIndicator.department ||
                            newIndicator.responsibleId !== oldIndicator.responsibleId ||
                            newIndicator.goal !== oldIndicator.goal
                        ) {
                            shouldBumpVersion = true;
                            break;
                        }
                    }
                }
            }

            let newVersion = existingPolicy.version;
            if (shouldBumpVersion) {
                const versionParts = existingPolicy.version.split('.').map(Number);
                versionParts[1] = (versionParts[1] || 0) + 1;
                newVersion = versionParts.join('.');
            }
            
            const updatedPolicy: Policy = {
                ...existingPolicy,
                ...policyData,
                version: newVersion,
                updatedAt: now,
            };
            setPolicies(current => current.map(p => (p.id === updatedPolicy.id ? updatedPolicy : p)));

        } else {
            // Creating new policy
            const newPolicy: Policy = {
                id: generateId(),
                version: '1.0',
                createdAt: now,
                updatedAt: now,
                ...policyData,
            };
            setPolicies(current => [...current, newPolicy]);
        }
    }, [policies]);

    const deletePolicy = useCallback((policyId: string) => {
        setPolicies(current => current.filter(p => p.id !== policyId));
    }, []);

    const saveMeeting = useCallback((meetingData: Omit<Meeting, 'id'> | Meeting): Meeting => {
        let savedMeeting: Meeting;
        const isEditing = 'id' in meetingData;

        if (isEditing) {
            setMeetings(current => current.map(m => m.id === meetingData.id ? { ...m, ...meetingData } : m));
            savedMeeting = meetingData as Meeting;
        } else {
            const newMeeting: Meeting = {
                id: generateId(),
                ...(meetingData as Omit<Meeting, 'id'>),
            };
            setMeetings(current => [...current, newMeeting]);
            savedMeeting = newMeeting;
        }

        const policy = policies.find(p => p.id === savedMeeting.policyId);
        
        const notificationMessage = isEditing
            ? `A reunião "${savedMeeting.title}" sobre a política "${policy?.title || 'N/A'}" foi atualizada.`
            : `Você foi convidado para a reunião "${savedMeeting.title}" sobre a política "${policy?.title || 'N/A'}" em ${new Date(savedMeeting.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}.`;

        const now = new Date().toISOString();

        const newNotifications: Notification[] = savedMeeting.attendeeIds.map(userId => ({
            id: generateId(),
            userId: userId,
            message: notificationMessage,
            timestamp: now,
            read: false,
        }));

        setNotifications(current => [...current, ...newNotifications]);

        return savedMeeting;
    }, [meetings, policies]);

    const deleteMeeting = useCallback((meetingId: string) => {
        const meetingToDelete = meetings.find(m => m.id === meetingId);
        if (!meetingToDelete) return;

        const notificationMessage = `A reunião "${meetingToDelete.title}" agendada para ${new Date(meetingToDelete.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} foi cancelada.`;
        const now = new Date().toISOString();

        const newNotifications: Notification[] = meetingToDelete.attendeeIds.map(userId => ({
            id: generateId(),
            userId: userId,
            message: notificationMessage,
            timestamp: now,
            read: false,
        }));

        setNotifications(current => [...current, ...newNotifications]);
        setMeetings(current => current.filter(m => m.id !== meetingId));
    }, [meetings]);

    const markNotificationRead = useCallback((notificationId: string) => {
        setNotifications(current =>
            current.map(n => (n.id === notificationId ? { ...n, read: true } : n))
        );
    }, []);

    const markAllNotificationsRead = useCallback((userId: string) => {
        setNotifications(current =>
            current.map(n => (n.userId === userId && !n.read ? { ...n, read: true } : n))
        );
    }, []);


    return {
        users,
        grids,
        audits,
        actionPlans,
        policies,
        meetings,
        notifications,
        addUser,
        updateUser,
        addAudit,
        saveGrid,
        deleteGrid,
        saveActionPlan,
        updateActionPlanStatus,
        addFollowUpToActionPlan,
        updateFindingStatus,
        updateFindingDescription,
        addAttachment,
        deleteAttachment,
        updateAuditStatus,
        savePolicy,
        deletePolicy,
        saveMeeting,
        deleteMeeting,
        markNotificationRead,
        markAllNotificationsRead,
    };
};