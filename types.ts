
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Auditor' | 'Manager' | 'Employee' | 'Administrator';
  avatarUrl: string;
  password?: string;
  status: 'Online' | 'Offline';
}

export enum TaskStatus {
    Pending = 'Pendente',
    InProgress = 'Em Execução',
    Standby = 'Standby',
    Done = 'Concluído',
}

export interface Task {
    id: string;
    title: string;
    description: string;
    assignedTo: string; // User ID
    dueDate: string;
    status: TaskStatus;
}

export interface FollowUp {
    id: string;
    authorId: string; // User ID
    content: string;
    timestamp: string; // ISO date string
}

export interface ActionPlan {
    id: string;
    findingId?: string; // Made optional
    performanceIndicatorId?: string; // Added for policies
    what: string;
    why: string;
    where: string;
    when: string; // ISO date string
    who: string; // User ID
    how: string;
    howMuch?: number;
    status: TaskStatus;
    followUps: FollowUp[];
}

export type AuditStatus = 'Planejando' | 'Em Execução' | 'Plano de Ação' | 'Concluído';

export interface Audit {
    id: string;
    code: string;
    title: string;
    scope: string;
    auditorId: string; // User ID
    startDate: string; // ISO date string
    endDate: string; // ISO date string
    status: AuditStatus;
    gridId: string;
    findings: Finding[];
}

export enum FindingStatus {
    Compliant = 'Conforme',
    NonCompliant = 'Não Conforme',
    NotApplicable = 'Não Aplicável',
}

export interface Attachment {
    id: string;
    name: string;
    url: string;
    size: number; // in bytes
}

export interface Finding {
    id: string;
    requirementId: string;
    title: string; // The requirement title
    description: string;
    status: FindingStatus;
    attachments: Attachment[];
}

export interface AuditRequirement {
    id: string;
    title: string;
    description: string;
    guidance: string;
}

export interface AuditGrid {
    id: string;
    title: string;
    description: string;
    scope: string;
    requirements: AuditRequirement[];
}

export type PolicyStatus = 'Rascunho' | 'Publicado' | 'Arquivado';

export interface PerformanceIndicator {
    id: string;
    objective: string;
    department: string;
    responsibleId: string; // User ID
    goal: number;
    actualValue: number;
}

export interface ChangeHistoryEntry {
    version: string;
    updatedAt: string;
    description: string;
    authorId: string;
}

export interface Policy {
    id: string;
    title: string;
    category: string;
    version: string;
    content: string; // Markdown content
    status: PolicyStatus;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
    performanceIndicators: PerformanceIndicator[];
    changeHistory: ChangeHistoryEntry[];
}

export interface Meeting {
    id: string;
    policyId: string;
    title: string;
    description: string;
    date: string; // YYYY-MM-DD
    startTime: string; // HH:MM
    endTime: string; // HH:MM
    attendeeIds: string[]; // User IDs
    organizerId: string; // User ID of the creator
}

export interface Notification {
    id: string;
    userId: string;
    message: string;
    timestamp: string; // ISO date string
    read: boolean;
}

export type UserSubmitData = (Omit<User, 'id' | 'avatarUrl' | 'status'> | Omit<User, 'avatarUrl' | 'status'>) & { avatarFile?: File | null };
export type PolicySubmitData = Omit<Policy, 'id' | 'version' | 'createdAt' | 'updatedAt' | 'changeHistory'> | Policy;
