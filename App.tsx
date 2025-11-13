

import React, { useState, useCallback } from 'react';
import { useMockData } from './hooks/useMockData';
import type { User, Audit, AuditGrid, ActionPlan, Finding, AuditStatus, Policy, Meeting, PerformanceIndicator, TaskStatus } from './types';

import { LoginScreen } from './components/LoginScreen';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { AuditList } from './components/AuditList';
import { AuditDetails } from './components/AuditDetails';
import { UserManagement } from './components/UserManagement';
import { GridManagement } from './components/GridManagement';
import { CreateUserModal } from './components/CreateUserModal';
import { CreateAuditModal } from './components/CreateAuditModal';
import { CreateGridModal } from './components/CreateGridModal';
import { generateRecommendation } from './services/geminiService';
import { generateICSFile } from './services/calendarService';
import { CreateActionPlanModal } from './components/CreateActionPlanModal';
import { Sidebar } from './components/Sidebar';
import { Chatbot } from './components/Chatbot';
import { ReportModal } from './components/ReportModal';
import { Toast } from './components/Toast';
import { PolicyManagement } from './components/PolicyManagement';
import { CreatePolicyModal } from './components/CreatePolicyModal';
import { ViewPolicyModal } from './components/ViewPolicyModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { CreateMeetingModal } from './components/CreateMeetingModal';
import { MeetingConfirmationModal } from './components/MeetingConfirmationModal';
import { VersionConfirmationModal } from './components/VersionConfirmationModal';


type Page = 'dashboard' | 'audits' | 'grids' | 'users' | 'chatbot' | 'policies';

interface ToastMessage {
    id: number;
    message: string;
    type: 'success' | 'error';
}

export type UserSubmitData = (Omit<User, 'id' | 'avatarUrl' | 'status'> | Omit<User, 'avatarUrl' | 'status'>) & { avatarFile?: File | null };
type PolicySubmitData = Omit<Policy, 'id' | 'version' | 'createdAt' | 'updatedAt' | 'changeHistory'> | Policy;


const App: React.FC = () => {
    const mockData = useMockData();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);

    // Modal States
    const [isCreateUserModalOpen, setCreateUserModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [isCreateAuditModalOpen, setCreateAuditModalOpen] = useState(false);
    const [isCreateGridModalOpen, setCreateGridModalOpen] = useState(false);
    const [gridToEdit, setGridToEdit] = useState<AuditGrid | null>(null);
    const [isCreateActionPlanModalOpen, setCreateActionPlanModalOpen] = useState(false);
    const [actionPlanToEdit, setActionPlanToEdit] = useState<ActionPlan | null>(null);
    const [currentFindingIdForActionPlan, setCurrentFindingIdForActionPlan] = useState<string | null>(null);
    const [currentIndicatorIdForActionPlan, setCurrentIndicatorIdForActionPlan] = useState<string | null>(null);
    const [isCreatePolicyModalOpen, setCreatePolicyModalOpen] = useState(false);
    const [policyToEdit, setPolicyToEdit] = useState<Policy | null>(null);
    const [policyToView, setPolicyToView] = useState<Policy | null>(null);
    const [policyToDelete, setPolicyToDelete] = useState<Policy | null>(null);
    const [isCreateMeetingModalOpen, setCreateMeetingModalOpen] = useState(false);
    const [meetingToEdit, setMeetingToEdit] = useState<Meeting | null>(null);
    const [defaultMeetingDate, setDefaultMeetingDate] = useState<string | null>(null);
    const [invitationDetails, setInvitationDetails] = useState<{ content: string; filename: string; mailtoUrl: string } | null>(null);
    const [meetingToCancel, setMeetingToCancel] = useState<Meeting | null>(null);
    const [versionConfirmState, setVersionConfirmState] = useState<{ policyData: PolicySubmitData, isOpen: boolean } | null>(null);
    const [reportData, setReportData] = useState<{
        audit: Audit;
        grid: AuditGrid;
        auditor?: User;
        actionPlans: ActionPlan[];
        users: User[];
    } | null>(null);
    
    // AI State
    const [aiRecommendation, setAiRecommendation] = useState('');
    const [isGeneratingAIRecommendation, setIsGeneratingAIRecommendation] = useState(false);

    // Toast State
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = (message: string, type: 'success' | 'error' = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, 5000);
    };

    const handleLogin = (email: string, password?: string): boolean => {
        const lowerCaseEmail = email.toLowerCase();
        let user: User | undefined;

        // Special case for passwordless admin login
        if (lowerCaseEmail === 'willianhcamargo@gmail.com') {
            user = mockData.users.find(u => u.email.toLowerCase() === lowerCaseEmail && u.role === 'Administrator');
        } else {
            // Standard login for all other users
            user = mockData.users.find(u => u.email.toLowerCase() === lowerCaseEmail && u.password === password);
        }
        
        if (user) {
            const userWithOnlineStatus: User = { ...user, status: 'Online' };
            mockData.updateUser(userWithOnlineStatus);
            setCurrentUser(userWithOnlineStatus);
            return true;
        }

        return false;
    };

    const handleLogout = () => {
        if (currentUser) {
            mockData.updateUser({ ...currentUser, status: 'Offline' });
        }
        setCurrentUser(null);
        setCurrentPage('dashboard');
        setSelectedAuditId(null);
    };

    const handleNavigate = (page: Page) => {
        setSelectedAuditId(null);
        setCurrentPage(page);
    };

    const handleSelectAudit = (auditId: string) => {
        setSelectedAuditId(auditId);
    };

    const handleBackToAudits = () => {
        setSelectedAuditId(null);
    };

    const handleSaveUser = (userData: UserSubmitData) => {
        const { avatarFile, ...restUserData } = userData;
        const lowerCaseEmail = ('email' in restUserData ? restUserData.email : '').toLowerCase();

        // Editing User
        if ('id' in restUserData) {
            const otherUsers = mockData.users.filter(u => u.id !== restUserData.id);
            if (otherUsers.some(u => u.email.toLowerCase() === lowerCaseEmail)) {
                addToast(`O e-mail ${restUserData.email} já está em uso por outro usuário.`, 'error');
                return;
            }
            
            const userToUpdate = mockData.users.find(u => u.id === restUserData.id)!;
            const updatedUser: User = {
                ...userToUpdate,
                ...restUserData,
                avatarUrl: avatarFile ? URL.createObjectURL(avatarFile) : userToUpdate.avatarUrl,
            };
            mockData.updateUser(updatedUser);
            addToast(`Usuário ${restUserData.name} atualizado com sucesso.`);
        
        // Creating User
        } else {
             if (mockData.users.some(u => u.email.toLowerCase() === lowerCaseEmail)) {
                addToast(`O e-mail ${restUserData.email} já está em uso.`, 'error');
                return;
            }
            
            const userToCreate = {
                ...restUserData,
                avatarUrl: avatarFile ? URL.createObjectURL(avatarFile) : undefined,
            };
            mockData.addUser(userToCreate);
            addToast(`Um e-mail de boas-vindas foi enviado para ${restUserData.email}.`);
        }

        setCreateUserModalOpen(false);
        setUserToEdit(null);
    };
    
    const handleOpenEditUserModal = (userId: string) => {
        const user = mockData.users.find(u => u.id === userId);
        if (user) {
            setUserToEdit(user);
            setCreateUserModalOpen(true);
        }
    };
    
    const handleOpenCreateUserModal = () => {
        setUserToEdit(null);
        setCreateUserModalOpen(true);
    };

     const handleUpdateCurrentUserAvatar = (file: File) => {
        if (currentUser) {
            const newAvatarUrl = URL.createObjectURL(file);
            const updatedUser = { ...currentUser, avatarUrl: newAvatarUrl };
            mockData.updateUser(updatedUser);
            setCurrentUser(updatedUser); // Update state for immediate reflection
            addToast('Foto de perfil atualizada com sucesso!');
        }
    };

    const handleSaveAudit = (auditData: Omit<Audit, 'id' | 'findings' | 'status' | 'code'>) => {
        mockData.addAudit(auditData);
        setCreateAuditModalOpen(false);
        const auditorName = mockData.users.find(u => u.id === auditData.auditorId)?.name || 'O auditor';
        addToast(`Auditoria agendada. ${auditorName} será notificado por e-mail.`);
    };
    
    const handleSaveGrid = (gridData: AuditGrid | Omit<AuditGrid, 'id'>) => {
        mockData.saveGrid(gridData);
        setCreateGridModalOpen(false);
        setGridToEdit(null);
    };

    const handleEditGrid = (gridId: string) => {
        const grid = mockData.grids.find(g => g.id === gridId);
        if(grid) {
            setGridToEdit(grid);
            setCreateGridModalOpen(true);
        }
    }

    const handleGetAIAssistance = async (findingDescription: string) => {
        setIsGeneratingAIRecommendation(true);
        setAiRecommendation('');
        try {
            const recommendation = await generateRecommendation(findingDescription);
            setAiRecommendation(recommendation);
        } catch (error) {
            console.error(error);
            setAiRecommendation("Desculpe, não foi possível gerar uma recomendação no momento.");
        } finally {
            setIsGeneratingAIRecommendation(false);
        }
    };

    const handleOpenCreateActionPlan = (findingId: string) => {
        setCurrentFindingIdForActionPlan(findingId);
        setCurrentIndicatorIdForActionPlan(null); // Ensure only one is active
        setActionPlanToEdit(null);
        setCreateActionPlanModalOpen(true);
    };

    const handleOpenCreatePolicyActionPlan = (indicatorId: string) => {
        setCurrentIndicatorIdForActionPlan(indicatorId);
        setCurrentFindingIdForActionPlan(null); // Ensure only one is active
        setActionPlanToEdit(null);
        setCreateActionPlanModalOpen(true);
    };

    const handleEditActionPlan = (plan: ActionPlan) => {
        setActionPlanToEdit(plan);
        setCurrentFindingIdForActionPlan(null);
        setCurrentIndicatorIdForActionPlan(null);
        setCreateActionPlanModalOpen(true);
    };
    
    const handleSaveActionPlan = (planData: Omit<ActionPlan, 'id' | 'followUps'> | ActionPlan) => {
        mockData.saveActionPlan(planData);
        const responsibleUser = mockData.users.find(u => u.id === planData.who);
        const message = 'id' in planData
            ? `Plano de ação atualizado. ${responsibleUser?.name || 'O responsável'} será notificado.`
            : `Plano de ação criado. ${responsibleUser?.name || 'O responsável'} será notificado por e-mail.`;
        addToast(message);
        setCreateActionPlanModalOpen(false);
        setActionPlanToEdit(null);
        setCurrentFindingIdForActionPlan(null);
        setCurrentIndicatorIdForActionPlan(null);
    };

    const handleUpdateActionPlanStatus = (planId: string, newStatus: TaskStatus) => {
        mockData.updateActionPlanStatus(planId, newStatus);
        addToast('Status do plano de ação atualizado.');
    };

    const handleAddFollowUp = (planId: string, content: string) => {
        if (!currentUser) return;
        mockData.addFollowUpToActionPlan(planId, content, currentUser.id);
        addToast('Follow-up adicionado com sucesso.');
    };

    const handleDeleteAttachment = (findingId: string, attachmentId: string) => {
        mockData.deleteAttachment(findingId, attachmentId);
    };

    const handleOpenReport = (auditId: string) => {
        const audit = mockData.audits.find(a => a.id === auditId);
        if (!audit) return;

        const grid = mockData.grids.find(g => g.id === audit.gridId);
        if (!grid) return;

        const auditor = mockData.users.find(u => u.id === audit.auditorId);
        const actionPlans = mockData.actionPlans.filter(p => audit.findings.some(f => f.id === p.findingId));

        setReportData({
            audit,
            grid,
            auditor,
            actionPlans,
            users: mockData.users,
        });
    };

    const handleSavePolicy = (policyData: PolicySubmitData) => {
        if (!currentUser) return;
    
        // If it's a new policy, save directly.
        if (!('id' in policyData)) {
            mockData.savePolicy(policyData, { authorId: currentUser.id });
            addToast(`Política "${policyData.title}" criada com sucesso.`);
            setCreatePolicyModalOpen(false);
            setPolicyToEdit(null);
            return;
        }
    
        // If it's an existing policy, check for changes robustly.
        const originalPolicy = mockData.policies.find(p => p.id === policyData.id);
        if (!originalPolicy) {
             addToast(`Erro: Política original não encontrada.`, 'error');
             setCreatePolicyModalOpen(false);
             setPolicyToEdit(null);
             return;
        }

        let hasChanged = false;

        // 1. Check top-level fields
        if (
            originalPolicy.title !== policyData.title ||
            originalPolicy.category !== policyData.category ||
            originalPolicy.status !== policyData.status ||
            originalPolicy.content !== policyData.content
        ) {
            hasChanged = true;
        }

        // 2. Check performance indicators for changes
        if (!hasChanged) {
            const originalIndicators = originalPolicy.performanceIndicators;
            const newIndicators = (policyData as Policy).performanceIndicators;

            if (originalIndicators.length !== newIndicators.length) {
                hasChanged = true;
            } else {
                const oldIndicatorsMap = new Map(
                    originalIndicators.map(ind => [ind.id, ind])
                );

                // FIX: Cast the array in the loop to ensure correct type inference for `newIndicator`.
                for (const newIndicator of newIndicators as PerformanceIndicator[]) {
                    const oldIndicator = oldIndicatorsMap.get(newIndicator.id);

                    if (!oldIndicator) {
                        // This means an indicator was replaced (new ID), which is a change.
                        hasChanged = true;
                        break;
                    }

                    if (
                        oldIndicator.objective !== newIndicator.objective ||
                        oldIndicator.department !== newIndicator.department ||
                        oldIndicator.responsibleId !== newIndicator.responsibleId ||
                        oldIndicator.goal !== newIndicator.goal ||
                        oldIndicator.actualValue !== newIndicator.actualValue
                    ) {
                        hasChanged = true;
                        break;
                    }
                }
            }
        }

        if (hasChanged) {
            setVersionConfirmState({ policyData, isOpen: true });
        }
    
        // Close the editor modal. The version modal will open if needed.
        setCreatePolicyModalOpen(false);
        setPolicyToEdit(null);
    };
    
    const handleConfirmVersionedSave = (decision: 'new' | 'update', changeDescription?: string) => {
        if (!versionConfirmState || !currentUser) return;

        const { policyData } = versionConfirmState;

        mockData.savePolicy(policyData, {
            createNewVersion: decision === 'new',
            changeDescription: changeDescription,
            authorId: currentUser.id
        });

        const message = decision === 'new'
            ? `Nova versão da política "${policyData.title}" foi criada.`
            : `Política "${policyData.title}" atualizada com sucesso.`;
        addToast(message);

        setVersionConfirmState(null);
    };

    const handleConfirmDeletePolicy = () => {
        if (policyToDelete) {
            mockData.deletePolicy(policyToDelete.id);
            addToast(`Política "${policyToDelete.title}" excluída com sucesso.`, 'success');
            setPolicyToDelete(null);
        }
    };

    const handleOpenEditPolicy = (policy: Policy) => {
        setPolicyToEdit(policy);
        setCreatePolicyModalOpen(true);
    };

    const handleSaveMeeting = (meetingData: Omit<Meeting, 'id' | 'organizerId'> | Meeting) => {
        let meetingToSave: Omit<Meeting, 'id'> | Meeting;

        if ('id' in meetingData) { // Editing
            meetingToSave = meetingData;
        } else { // Creating
            meetingToSave = {
                ...meetingData,
                organizerId: currentUser!.id
            };
        }
        
        const savedMeeting = mockData.saveMeeting(meetingToSave);

        const policy = mockData.policies.find(p => p.id === savedMeeting.policyId);
        const attendees = mockData.users.filter(u => savedMeeting.attendeeIds.includes(u.id));

        if (currentUser) {
            const { content, filename } = generateICSFile(savedMeeting, policy, attendees, currentUser);
            const message = 'id' in meetingData ? 'Reunião atualizada com sucesso!' : 'Reunião agendada com sucesso!';
            addToast(message);

            const recipientEmails = attendees.map(u => u.email).join(',');
            const subject = encodeURIComponent(`Convite: ${savedMeeting.title}`);
            const body = encodeURIComponent(
`Olá,

Você foi convidado(a) para a reunião "${savedMeeting.title}".

Data: ${new Date(savedMeeting.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
Horário: ${savedMeeting.startTime} - ${savedMeeting.endTime}

Para adicionar este evento à sua agenda, por favor, anexe o arquivo .ics que será baixado ao enviar este e-mail.

Atenciosamente,
${currentUser.name}`
            );
            const mailtoUrl = `mailto:${recipientEmails}?subject=${subject}&body=${body}`;

            setInvitationDetails({ content, filename, mailtoUrl });
        }
        
        setCreateMeetingModalOpen(false);
        setMeetingToEdit(null);
    };

    const handleConfirmCancelMeeting = () => {
        if (meetingToCancel) {
            mockData.deleteMeeting(meetingToCancel.id);
            addToast(`Reunião "${meetingToCancel.title}" cancelada e participantes notificados.`);
            setMeetingToCancel(null);
        }
    };

    const handleOpenCreateMeeting = (date?: string) => {
        setMeetingToEdit(null);
        setDefaultMeetingDate(date || null);
        setCreateMeetingModalOpen(true);
    };

    const handleOpenEditMeeting = (meeting: Meeting) => {
        setMeetingToEdit(meeting);
        setDefaultMeetingDate(null);
        setCreateMeetingModalOpen(true);
    };
    
    const renderContent = () => {
        if (selectedAuditId) {
            const audit = mockData.audits.find(a => a.id === selectedAuditId);
            const grid = mockData.grids.find(g => g.id === audit?.gridId);
            if (!audit || !grid) return <div>Auditoria não encontrada.</div>;

            const findingsMap = new Map<string, Finding>();
            audit.findings.forEach(f => findingsMap.set(f.requirementId, f));

            const actionPlans = mockData.actionPlans.filter(p => audit.findings.some(f => f.id === p.findingId));
            
            return (
                <AuditDetails
                    audit={audit}
                    grid={grid}
                    auditor={mockData.users.find(u => u.id === audit.auditorId)}
                    users={mockData.users}
                    actionPlans={actionPlans}
                    onUpdateFindingStatus={mockData.updateFindingStatus}
                    onUpdateFindingDescription={mockData.updateFindingDescription}
                    onAttachFile={mockData.addAttachment}
                    onDeleteAttachment={handleDeleteAttachment}
                    onUpdateActionPlanStatus={handleUpdateActionPlanStatus}
                    onGetAIAssistance={handleGetAIAssistance}
                    aiRecommendation={aiRecommendation}
                    isGeneratingAIRecommendation={isGeneratingAIRecommendation}
                    onCreateActionPlan={handleOpenCreateActionPlan}
                    onEditActionPlan={handleEditActionPlan}
                    onUpdateAuditStatus={mockData.updateAuditStatus}
                    onAddFollowUp={handleAddFollowUp}
                    currentUser={currentUser!}
                />
            );
        }

        switch (currentPage) {
            case 'dashboard':
                return <Dashboard audits={mockData.audits} actionPlans={mockData.actionPlans} currentUser={currentUser!} onNavigate={handleNavigate} />;
            case 'audits':
                return <AuditList audits={mockData.audits} users={mockData.users} onSelectAudit={handleSelectAudit} onCreateAudit={() => setCreateAuditModalOpen(true)} onUpdateAuditStatus={mockData.updateAuditStatus} currentUser={currentUser!} onOpenReport={handleOpenReport} />;
            case 'grids':
                return <GridManagement grids={mockData.grids} onCreateGrid={() => { setGridToEdit(null); setCreateGridModalOpen(true); }} onEditGrid={handleEditGrid} onDeleteGrid={mockData.deleteGrid} currentUser={currentUser!} />;
            case 'users':
                return <UserManagement users={mockData.users} onCreateUser={handleOpenCreateUserModal} onEditUser={handleOpenEditUserModal} currentUser={currentUser!} />;
            case 'policies':
                return <PolicyManagement policies={mockData.policies} currentUser={currentUser!} onEditPolicy={handleOpenEditPolicy} onDeletePolicy={setPolicyToDelete} onOpenViewPolicy={setPolicyToView} onCreatePolicy={() => { setPolicyToEdit(null); setCreatePolicyModalOpen(true); }} users={mockData.users} meetings={mockData.meetings} onOpenCreateMeeting={handleOpenCreateMeeting} onCancelMeeting={setMeetingToCancel} onEditMeeting={handleOpenEditMeeting} onAddFollowUp={handleAddFollowUp} />;
            case 'chatbot': {
                const userAudits = mockData.audits.filter(
                    (audit) => audit.auditorId === currentUser.id || currentUser.role === 'Administrator'
                );
                const userFindingIds = new Set(
                    userAudits.flatMap((audit) => audit.findings.map((finding) => finding.id))
                );
                const userActionPlans = mockData.actionPlans.filter((plan) =>
                    plan.findingId && userFindingIds.has(plan.findingId)
                );
                return (
                    <Chatbot
                        currentUser={currentUser}
                        audits={userAudits}
                        grids={mockData.grids}
                        actionPlans={userActionPlans}
                    />
                );
            }
            default:
                return <div>Página não encontrada</div>;
        }
    };

    if (!currentUser) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    return (
        <div className="flex h-screen bg-background dark:bg-dark-background text-on-surface dark:text-dark-on-surface">
            <Sidebar onNavigate={handleNavigate} currentPage={currentPage} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header
                    currentUser={currentUser}
                    onLogout={handleLogout}
                    onBack={selectedAuditId ? handleBackToAudits : undefined}
                    onUpdateAvatar={handleUpdateCurrentUserAvatar}
                    notifications={mockData.notifications.filter(n => n.userId === currentUser.id)}
                    onMarkNotificationRead={mockData.markNotificationRead}
                    onMarkAllNotificationsRead={() => mockData.markAllNotificationsRead(currentUser.id)}
                />
                <main className="flex-1 overflow-y-auto">
                    <div className="container mx-auto p-4 md:p-6 h-full">
                      {renderContent()}
                    </div>
                </main>
            </div>

            {/* Modals */}
            <CreateUserModal
                isOpen={isCreateUserModalOpen}
                onClose={() => { setCreateUserModalOpen(false); setUserToEdit(null); }}
                onSubmit={handleSaveUser}
                userToEdit={userToEdit}
                allUsers={mockData.users}
            />
            <CreateAuditModal
                isOpen={isCreateAuditModalOpen}
                onClose={() => setCreateAuditModalOpen(false)}
                onSave={handleSaveAudit}
                users={mockData.users.filter(u => u.role === 'Auditor')}
                grids={mockData.grids}
            />
            <CreateGridModal 
                isOpen={isCreateGridModalOpen}
                onClose={() => { setCreateGridModalOpen(false); setGridToEdit(null); }}
                onSave={handleSaveGrid}
                gridToEdit={gridToEdit}
            />
             <CreatePolicyModal
                isOpen={isCreatePolicyModalOpen}
                onClose={() => { setCreatePolicyModalOpen(false); setPolicyToEdit(null); }}
                onSave={handleSavePolicy}
                policyToEdit={policyToEdit}
                users={mockData.users}
            />
            <ViewPolicyModal
                isOpen={!!policyToView}
                onClose={() => setPolicyToView(null)}
                policy={policyToView}
                policyHistory={mockData.policyHistory}
                users={mockData.users}
                actionPlans={mockData.actionPlans}
                onCreateActionPlan={handleOpenCreatePolicyActionPlan}
                onEditActionPlan={handleEditActionPlan}
                onAddFollowUp={handleAddFollowUp}
                onUpdateActionPlanStatus={handleUpdateActionPlanStatus}
                currentUser={currentUser}
            />
             <VersionConfirmationModal
                isOpen={versionConfirmState?.isOpen || false}
                onClose={() => setVersionConfirmState(null)}
                onConfirm={handleConfirmVersionedSave}
            />
            <CreateActionPlanModal
                isOpen={isCreateActionPlanModalOpen}
                onClose={() => { setCreateActionPlanModalOpen(false); setActionPlanToEdit(null); }}
                onSave={handleSaveActionPlan}
                users={mockData.users}
                findingId={currentFindingIdForActionPlan}
                performanceIndicatorId={currentIndicatorIdForActionPlan}
                planToEdit={actionPlanToEdit}
            />
            <CreateMeetingModal
                isOpen={isCreateMeetingModalOpen}
                onClose={() => {
                    setCreateMeetingModalOpen(false);
                    setDefaultMeetingDate(null);
                    setMeetingToEdit(null);
                }}
                onSave={handleSaveMeeting}
                policies={mockData.policies}
                users={mockData.users}
                defaultDate={defaultMeetingDate}
                meetingToEdit={meetingToEdit}
            />
            <MeetingConfirmationModal
                isOpen={!!invitationDetails}
                onClose={() => setInvitationDetails(null)}
                invitationDetails={invitationDetails}
            />
            <ReportModal 
                isOpen={!!reportData}
                onClose={() => setReportData(null)}
                data={reportData}
            />
            <ConfirmationModal
                isOpen={!!policyToDelete}
                onClose={() => setPolicyToDelete(null)}
                onConfirm={handleConfirmDeletePolicy}
                title="Confirmar Exclusão de Política"
                message={`Tem certeza de que deseja excluir a política "${policyToDelete?.title}"? Esta ação não pode ser desfeita.`}
            />
             <ConfirmationModal
                isOpen={!!meetingToCancel}
                onClose={() => setMeetingToCancel(null)}
                onConfirm={handleConfirmCancelMeeting}
                title="Confirmar Cancelamento"
                message={`Tem certeza de que deseja cancelar a reunião "${meetingToCancel?.title}"? Todos os participantes serão notificados.`}
            />
             {/* Toast Container */}
            <div className="fixed bottom-4 right-4 z-[100] w-full max-w-sm space-y-3">
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                    />
                ))}
            </div>
        </div>
    );
};

export default App;
