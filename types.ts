
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Auditor' | 'Manager' | 'Employee' | 'Administrator';
  avatarUrl: string;
  password?: string;
}

export enum TaskStatus {
    ToDo = 'A Fazer',
    InProgress = 'Em Progresso',
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

export interface ActionPlan {
    id: string;
    findingId: string;
    what: string;
    why: string;
    where: string;
    when: string; // ISO date string
    who: string; // User ID
    how: string;
    howMuch?: number;
    status: TaskStatus;
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