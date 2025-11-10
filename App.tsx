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

type Page = 'dashboard' | 'audits' | 'grids' | 'users';

const App: React.FC = () => {
    const mockData = useMockData();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);

    // Modal States
    const [isCreateUserModalOpen, setCreateUserModalOpen] = useState(false);
    const [isCreateAuditModalOpen, setCreateAuditModalOpen] = useState(false);
    const [isCreateGridModalOpen, setCreateGridModalOpen] = useState(false);
    const [gridToEdit, setGridToEdit] = useState<AuditGrid | null>(null);
    const [isCreateActionPlanModalOpen, setCreateActionPlanModalOpen] = useState(false);
    const [actionPlanToEdit, setActionPlanToEdit] = useState<ActionPlan | null>(null);
    const [currentFindingIdForActionPlan, setCurrentFindingIdForActionPlan] = useState<string | null>(null);
    
    // AI State
    const [aiRecommendation, setAiRecommendation] = useState('');
    const [isGeneratingAIRecommendation, setIsGeneratingAIRecommendation] = useState(false);

    const handleLogin = (email: string, password?: string): boolean => {
        const user = mockData.users.find(u => u.email === email && u.password === password);
        if (user) {
            setCurrentUser(user);
            return true;
        }
        return false;
    };

    const handleLogout = () => {
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

    const handleCreateUser = (userData: Omit<User, 'id' | 'avatarUrl'>) => {
        mockData.addUser(userData);
        setCreateUserModalOpen(false);
    };

    const handleSaveAudit = (auditData: Omit<Audit, 'id' | 'findings' | 'status' | 'code'>) => {
        mockData.addAudit(auditData);
        setCreateAuditModalOpen(false);
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
                return <AuditList audits={mockData.audits} users={mockData.users} onSelectAudit={handleSelectAudit} onCreateAudit={() => setCreateAuditModalOpen(true)} onUpdateAuditStatus={mockData.updateAuditStatus} currentUser={currentUser!} />;
            case 'grids':
                return <GridManagement grids={mockData.grids} onCreateGrid={() => { setGridToEdit(null); setCreateGridModalOpen(true); }} onEditGrid={handleEditGrid} onDeleteGrid={mockData.deleteGrid} currentUser={currentUser!} />;
            case 'users':
                return <UserManagement users={mockData.users} onCreateUser={() => setCreateUserModalOpen(true)} currentUser={currentUser!} />;
            default:
                return <div>Página não encontrada</div>;
        }
    };

    if (!currentUser) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    return (
        <div className="bg-background dark:bg-dark-background min-h-screen">
            <Header
                currentUser={currentUser}
                onNavigate={handleNavigate}
                onLogout={handleLogout}
                onBack={selectedAuditId ? handleBackToAudits : undefined}
            />
            <main className="container mx-auto p-4 md:p-6">
                {renderContent()}
            </main>
            <CreateUserModal
                isOpen={isCreateUserModalOpen}
                onClose={() => setCreateUserModalOpen(false)}
                onSubmit={handleCreateUser}
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
        </div>
    );
};

export default App;