
import { useState, useCallback, useEffect } from 'react';
import { FindingStatus, TaskStatus } from '../types';
import type { User, Audit, AuditGrid, ActionPlan, Finding, AuditStatus, Attachment, Policy, PolicyStatus, PerformanceIndicator, Meeting, Notification, FollowUp, ChangeHistoryEntry } from '../types';

// Storage Keys
const STORAGE_KEYS = {
    USERS: 'auditforce_users',
    GRIDS: 'auditforce_grids',
    AUDITS: 'auditforce_audits',
    ACTION_PLANS: 'auditforce_plans',
    POLICIES: 'auditforce_policies',
    POLICY_HISTORY: 'auditforce_policy_history',
    MEETINGS: 'auditforce_meetings',
    NOTIFICATIONS: 'auditforce_notifications',
};

const generateId = () => Math.random().toString(36).substring(2, 11);

// Default initial data if storage is empty
const initialUsers: User[] = [
    { id: 'user-1', name: 'Willian Huller', email: 'willianhcamargo@gmail.com', role: 'Administrator', avatarUrl: `https://i.pravatar.cc/150?u=user-1`, status: 'Offline' },
    { id: 'user-2', name: 'Bob Auditor', email: 'auditor@example.com', role: 'Auditor', avatarUrl: `https://i.pravatar.cc/150?u=user-2`, password: 'password', status: 'Offline' },
    { id: 'user-3', name: 'Charlie Manager', email: 'manager@outlook.com', role: 'Manager', avatarUrl: `https://i.pravatar.cc/150?u=user-3`, password: 'password', status: 'Offline' },
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
        ]
    }
];

// Helper to load from storage
const loadFromStorage = <T>(key: string, defaultValue: T): T => {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
    } catch (e) {
        console.error(`Error loading ${key} from storage:`, e);
        return defaultValue;
    }
};

export const useMockData = () => {
    // Initialize state from localStorage
    const [users, setUsers] = useState<User[]>(() => loadFromStorage(STORAGE_KEYS.USERS, initialUsers));
    const [grids, setGrids] = useState<AuditGrid[]>(() => loadFromStorage(STORAGE_KEYS.GRIDS, initialGrids));
    const [audits, setAudits] = useState<Audit[]>(() => loadFromStorage(STORAGE_KEYS.AUDITS, []));
    const [actionPlans, setActionPlans] = useState<ActionPlan[]>(() => loadFromStorage(STORAGE_KEYS.ACTION_PLANS, []));
    const [policies, setPolicies] = useState<Policy[]>(() => loadFromStorage(STORAGE_KEYS.POLICIES, []));
    const [policyHistory, setPolicyHistory] = useState<Policy[]>(() => loadFromStorage(STORAGE_KEYS.POLICY_HISTORY, []));
    const [meetings, setMeetings] = useState<Meeting[]>(() => loadFromStorage(STORAGE_KEYS.MEETINGS, []));
    const [notifications, setNotifications] = useState<Notification[]>(() => loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, []));

    // Persist to localStorage whenever state changes
    useEffect(() => localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users)), [users]);
    useEffect(() => localStorage.setItem(STORAGE_KEYS.GRIDS, JSON.stringify(grids)), [grids]);
    useEffect(() => localStorage.setItem(STORAGE_KEYS.AUDITS, JSON.stringify(audits)), [audits]);
    useEffect(() => localStorage.setItem(STORAGE_KEYS.ACTION_PLANS, JSON.stringify(actionPlans)), [actionPlans]);
    useEffect(() => localStorage.setItem(STORAGE_KEYS.POLICIES, JSON.stringify(policies)), [policies]);
    useEffect(() => localStorage.setItem(STORAGE_KEYS.POLICY_HISTORY, JSON.stringify(policyHistory)), [policyHistory]);
    useEffect(() => localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(meetings)), [meetings]);
    useEffect(() => localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications)), [notifications]);

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
            code: `AUD-${Math.floor(Math.random() * 10000)}`,
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
        setGrids(current => current.filter(g => g.id !== gridId));
    }, []);

    const saveActionPlan = useCallback((planData: Omit<ActionPlan, 'id' | 'followUps'> | ActionPlan) => {
        let responsibleId: string;
        let isNew = false;
        let message = '';

        if ('id' in planData) {
            setActionPlans(current => current.map(p => p.id === planData.id ? { ...p, ...planData } : p));
            responsibleId = planData.who;
        } else {
            isNew = true;
            const newPlan: ActionPlan = {
                id: generateId(),
                followUps: [],
                ...(planData as Omit<ActionPlan, 'id' | 'followUps'>)
            };
            setActionPlans(current => [...current, newPlan]);
            responsibleId = newPlan.who;
        }
        
        if (isNew && responsibleId) {
            const newNotification: Notification = {
                id: generateId(),
                userId: responsibleId,
                message: `Novo plano de ação atribuído: "${planData.what}"`,
                timestamp: new Date().toISOString(),
                read: false,
            };
            setNotifications(current => [...current, newNotification]);
        }
    }, []);

    const updateActionPlanStatus = useCallback((planId: string, newStatus: TaskStatus, evidence?: string, evidenceAttachments?: Attachment[]) => {
        setActionPlans(currentPlans => 
            currentPlans.map(p => (p.id === planId ? { 
                ...p, 
                status: newStatus,
                ...(evidence ? { evidence } : {}),
                ...(evidenceAttachments ? { evidenceAttachments } : {})
            } : p))
        );
    }, []);
    
    const addFollowUpToActionPlan = useCallback((planId: string, content: string, authorId: string) => {
        const newFollowUp: FollowUp = {
            id: generateId(),
            authorId,
            content,
            timestamp: new Date().toISOString(),
        };
        setActionPlans(current => current.map(plan => plan.id === planId ? { ...plan, followUps: [newFollowUp, ...plan.followUps] } : plan));
    }, []);
    
    const updateFindingStatus = useCallback((findingId: string, status: FindingStatus) => {
        setAudits(currentAudits =>
            currentAudits.map(audit => ({
                ...audit,
                findings: audit.findings.map(finding =>
                    finding.id === findingId ? { ...finding, status } : finding
                )
            }))
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
        // Warning: storing blobs in state is session only. 
        // For real persistence of large files, we'd need a backend.
        const newAttachment: Attachment = {
            id: generateId(),
            name: file.name,
            url: URL.createObjectURL(file), 
            size: file.size,
        };
        setAudits(currentAudits => currentAudits.map(audit => ({
            ...audit,
            findings: audit.findings.map(finding =>
                finding.id === findingId ? { ...finding, attachments: [...finding.attachments, newAttachment] } : finding
            )
        })));
    }, []);

    const deleteAttachment = useCallback((findingId: string, attachmentId: string) => {
        setAudits(currentAudits => currentAudits.map(audit => ({
            ...audit,
            findings: audit.findings.map(finding =>
                finding.id === findingId ? { ...finding, attachments: finding.attachments.filter(att => att.id !== attachmentId) } : finding
            )
        })));
    }, []);

    const updateAuditStatus = useCallback((auditId: string, status: AuditStatus) => {
        setAudits(current => current.map(a => (a.id === auditId ? { ...a, status } : a)));
    }, []);
    
    const savePolicy = useCallback((policyData: Omit<Policy, 'id' | 'version' | 'createdAt' | 'updatedAt' | 'changeHistory'> | Policy, options: { createNewVersion?: boolean; changeDescription?: string; authorId?: string } = {}) => {
        const now = new Date().toISOString();
        if ('id' in policyData) {
            const existingPolicy = policies.find(p => p.id === policyData.id);
            if (!existingPolicy) return;

            let updatedPolicy: Policy;
            if (options.createNewVersion && options.authorId) {
                setPolicyHistory(current => [...current, existingPolicy]);
                const versionParts = existingPolicy.version.split('.').map(Number);
                versionParts[1] = (versionParts[1] || 0) + 1;
                const newVersion = versionParts.join('.');
                updatedPolicy = {
                    ...existingPolicy,
                    ...policyData,
                    version: newVersion,
                    updatedAt: now,
                    changeHistory: [{ version: newVersion, updatedAt: now, description: options.changeDescription || 'Revisão.', authorId: options.authorId }, ...existingPolicy.changeHistory],
                };
            } else {
                updatedPolicy = { ...existingPolicy, ...policyData, updatedAt: now };
            }
            setPolicies(current => current.map(p => (p.id === updatedPolicy.id ? updatedPolicy : p)));
        } else {
            if (!options.authorId) return;
            const newPolicy: Policy = {
                id: generateId(), version: '1.0', createdAt: now, updatedAt: now,
                ...policyData,
                changeHistory: [{ version: '1.0', updatedAt: now, description: 'Criação.', authorId: options.authorId }]
            };
            setPolicies(current => [...current, newPolicy]);
        }
    }, [policies]);

    const deletePolicy = useCallback((policyId: string) => {
        setPolicies(current => current.filter(p => p.id !== policyId));
    }, []);

    const saveMeeting = useCallback((meetingData: Omit<Meeting, 'id'> | Meeting): Meeting => {
        let savedMeeting: Meeting;
        if ('id' in meetingData) {
            setMeetings(current => current.map(m => m.id === meetingData.id ? { ...m, ...meetingData } : m));
            savedMeeting = meetingData as Meeting;
        } else {
            const newMeeting: Meeting = { id: generateId(), ...(meetingData as Omit<Meeting, 'id'>) };
            setMeetings(current => [...current, newMeeting]);
            savedMeeting = newMeeting;
        }
        return savedMeeting;
    }, []);

    const deleteMeeting = useCallback((meetingId: string) => {
        setMeetings(current => current.filter(m => m.id !== meetingId));
    }, []);

    const markNotificationRead = useCallback((notificationId: string) => {
        setNotifications(current => current.map(n => (n.id === notificationId ? { ...n, read: true } : n)));
    }, []);

    const markAllNotificationsRead = useCallback((userId: string) => {
        setNotifications(current => current.map(n => (n.userId === userId ? { ...n, read: true } : n)));
    }, []);

    const addNotification = useCallback((userId: string, message: string) => {
        const newNotification: Notification = {
            id: generateId(),
            userId,
            message,
            timestamp: new Date().toISOString(),
            read: false,
        };
        setNotifications(current => [...current, newNotification]);
    }, []);

    return {
        users, grids, audits, actionPlans, policies, policyHistory, meetings, notifications,
        addUser, updateUser, addAudit, saveGrid, deleteGrid, saveActionPlan, updateActionPlanStatus,
        addFollowUpToActionPlan, updateFindingStatus, updateFindingDescription, addAttachment,
        deleteAttachment, updateAuditStatus, savePolicy, deletePolicy, saveMeeting, deleteMeeting,
        markNotificationRead, markAllNotificationsRead, addNotification,
    };
};
