import React, { useState, useCallback } from 'react';
import { useMockData } from './hooks/useMockData';
import type { User, Audit, AuditGrid, ActionPlan, Finding, AuditStatus } from './types';
import { TaskStatus } from './types';

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
import { CreateActionPlanModal } from './components/CreateActionPlanModal';
import { Sidebar } from './components/Sidebar';
import { Chatbot } from './components/Chatbot';
import { ReportModal } from './components/ReportModal';
import { Toast } from './components/Toast';

type Page = 'dashboard' | 'audits' | 'grids' | 'users' | 'chatbot';

interface ToastMessage {
    id: number;
    message: string;
    type: 'success' | 'error';
}

export type UserSubmitData = (Omit<User, 'id' | 'avatarUrl' | 'status'> | Omit<User, 'avatarUrl' | 'status'>) & { avatarFile?: File | null };


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
        setActionPlanToEdit(null);
        setCreateActionPlanModalOpen(true);
    };

    const handleEditActionPlan = (plan: ActionPlan) => {
        setActionPlanToEdit(plan);
        setCurrentFindingIdForActionPlan(null);
        setCreateActionPlanModalOpen(true);
    };
    
    const handleSaveActionPlan = (planData: Omit<ActionPlan, 'id'> | ActionPlan) => {
        mockData.saveActionPlan(planData);
        const responsibleUser = mockData.users.find(u => u.id === planData.who);
        const message = 'id' in planData
            ? `Plano de ação atualizado. ${responsibleUser?.name || 'O responsável'} será notificado.`
            : `Plano de ação criado. ${responsibleUser?.name || 'O responsável'} será notificado por e-mail.`;
        addToast(message);
        setCreateActionPlanModalOpen(false);
        setActionPlanToEdit(null);
        setCurrentFindingIdForActionPlan(null);
    };

    const handleUpdateActionPlanStatus = (planId: string, newStatus: TaskStatus) => {
        mockData.updateActionPlanStatus(planId, newStatus);
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
            case 'chatbot': {
                const userAudits = mockData.audits.filter(
                    (audit) => audit.auditorId === currentUser.id || currentUser.role === 'Administrator'
                );
                const userFindingIds = new Set(
                    userAudits.flatMap((audit) => audit.findings.map((finding) => finding.id))
                );
                const userActionPlans = mockData.actionPlans.filter((plan) =>
                    userFindingIds.has(plan.findingId)
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
            <CreateActionPlanModal
                isOpen={isCreateActionPlanModalOpen}
                onClose={() => { setCreateActionPlanModalOpen(false); setActionPlanToEdit(null); }}
                onSave={handleSaveActionPlan}
                users={mockData.users}
                findingId={currentFindingIdForActionPlan}
                planToEdit={actionPlanToEdit}
            />
            <ReportModal 
                isOpen={!!reportData}
                onClose={() => setReportData(null)}
                data={reportData}
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