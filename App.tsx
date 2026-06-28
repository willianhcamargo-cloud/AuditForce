
import React, { useState, useCallback } from 'react';
import { useMockData } from './hooks/useMockData';
import type { User, Audit, AuditGrid, ActionPlan, Finding, AuditStatus, Policy, Meeting, PerformanceIndicator, TaskStatus, UserSubmitData, PolicySubmitData } from './types';

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
import { InviteCompleteScreen } from './components/InviteCompleteScreen';


type Page = 'dashboard' | 'audits' | 'grids' | 'users' | 'chatbot' | 'policies';

interface ToastMessage {
    id: number;
    message: string;
    type: 'success' | 'error';
}

// Helper to convert File to Base64
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export const App: React.FC = () => {
    const mockData = useMockData();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);

    const [inviteToken, setInviteToken] = useState<string | null>(null);
    const [inviteUser, setInviteUser] = useState<User | null>(null);

    const dispatchServerEmail = async (to: string, subject: string, htmlContent: string) => {
        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ to, subject, htmlContent })
            });
            const data = await response.json();
            if (data.success) {
                if (data.testUrl) {
                    console.log(`[E-mail de Teste] Visualizar em: ${data.testUrl}`);
                    addToast(`E-mail real enviado! (Modo sandbox, visualize na console do navegador)`, 'success');
                } else {
                    addToast(`E-mail enviado com sucesso para ${to}!`, 'success');
                }
                return true;
            } else {
                throw new Error(data.error || 'Erro no envio do e-mail.');
            }
        } catch (error: any) {
            console.error('Falha ao enviar e-mail via servidor:', error);
            addToast(`Falha ao enviar e-mail real: ${error.message || error}`, 'error');
            return false;
        }
    };


    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const inviteParam = params.get('invite');
        if (inviteParam) {
            setInviteToken(inviteParam);
            const user = mockData.users.find(u => u.inviteToken === inviteParam && u.isPendingInvite);
            if (user) {
                setInviteUser(user);
            } else {
                // Check if user has already activated or if token is invalid
                const alreadyActivated = mockData.users.find(u => u.inviteToken === inviteParam && !u.isPendingInvite);
                if (alreadyActivated) {
                    addToast('Este convite já foi aceito e o cadastro concluído.', 'error');
                } else {
                    addToast('Convite inválido ou expirado.', 'error');
                }
                window.history.replaceState({}, document.title, window.location.pathname);
                setInviteToken(null);
                setInviteUser(null);
            }
        }
    }, [mockData.users]);

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
        const user = mockData.users.find(u => u.email.toLowerCase() === lowerCaseEmail);
        
        if (user) {
            // If administrator and password is not set yet, reject normal login.
            if (user.role === 'Administrator' && !user.password) {
                return false;
            }
            
            if (user.password !== password) {
                return false;
            }
            
            const userWithOnlineStatus: User = { ...user, status: 'Online' };
            mockData.updateUser(userWithOnlineStatus);
            setCurrentUser(userWithOnlineStatus);
            return true;
        }

        return false;
    };

    const handleSetAdminPassword = (email: string, password: string) => {
        const lowerCaseEmail = email.toLowerCase();
        const user = mockData.users.find(u => u.email.toLowerCase() === lowerCaseEmail && u.role === 'Administrator');
        if (user) {
            const updatedUser: User = { ...user, password, status: 'Online' };
            mockData.updateUser(updatedUser);
            setCurrentUser(updatedUser);
            addToast('Senha do administrador definida com sucesso! Bem-vindo.');
        }
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

    const handleSaveUser = async (userData: UserSubmitData) => {
        const { avatarFile, ...restUserData } = userData;
        const lowerCaseEmail = ('email' in restUserData ? restUserData.email : '').toLowerCase();

        let avatarUrl = undefined;
        if (avatarFile) {
            try {
                avatarUrl = await fileToBase64(avatarFile);
            } catch (e) {
                console.error("Error converting avatar to base64", e);
            }
        }

        if ('id' in restUserData) {
            const userToUpdate = mockData.users.find(u => u.id === restUserData.id);
            if (!userToUpdate) {
                addToast(`Erro: Usuário não encontrado.`, 'error');
                return;
            }

            const updatedUser: User = {
                ...userToUpdate,
                ...restUserData,
                avatarUrl: avatarUrl || userToUpdate.avatarUrl,
            };
            mockData.updateUser(updatedUser);
            addToast(`Usuário ${restUserData.name} atualizado.`);
        } else {
            if (mockData.users.some(u => u.email.toLowerCase() === lowerCaseEmail)) {
                addToast(`O e-mail ${restUserData.email} já está em uso.`, 'error');
                return;
            }
            
            const inviteToken = 'inv-' + Math.random().toString(36).substring(2, 11);
            
            mockData.addUser({
                ...restUserData,
                avatarUrl: avatarUrl,
                isPendingInvite: true,
                invitedAt: new Date().toISOString(),
                inviteToken: inviteToken,
            });

            // Build gorgeous invitation HTML email
            const inviteLink = `${window.location.origin}${window.location.pathname}?invite=${inviteToken}`;
            const emailSubject = `AuditForce - Aceite o Convite para Cadastro`;
            const emailBody = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 24px; border-bottom: 2px solid #3b82f6; padding-bottom: 16px;">
                        <h1 style="color: #3b82f6; margin: 0; font-size: 28px; font-weight: 800; tracking-tight: -0.05em;">AuditForce</h1>
                        <p style="color: #6b7280; font-size: 14px; margin-top: 4px; font-weight: 500;">Gestão Inteligente de Auditoria</p>
                    </div>
                    <p style="font-size: 16px; color: #111827; font-weight: 600;">Olá, <strong>${restUserData.name}</strong>!</p>
                    <p style="font-size: 14px; color: #374151; line-height: 1.6;">
                        Você foi cadastrado por um Administrador para integrar a plataforma de auditoria do <strong>AuditForce</strong> com o perfil de <strong>${
                            restUserData.role === 'Employee' ? 'Funcionário' :
                            restUserData.role === 'Manager' ? 'Gerente' :
                            restUserData.role === 'Auditor' ? 'Auditor' : 'Administrador'
                        }</strong>.
                    </p>
                    <p style="font-size: 14px; color: #374151; line-height: 1.6; margin-bottom: 20px;">
                        Para aceitar este convite, confirmar seu endereço de e-mail e definir sua senha de acesso inicial, clique no botão de ativação abaixo:
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${inviteLink}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; font-weight: bold; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">
                            Aceitar Solicitação e Definir Senha
                        </a>
                    </div>
                    <p style="font-size: 13px; color: #4b5563; line-height: 1.6; margin-top: 24px;">
                        Se o botão acima não funcionar, copie e cole o seguinte link em seu navegador:
                    </p>
                    <p style="font-size: 12px; word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px;">
                        <a href="${inviteLink}" style="color: #2563eb; text-decoration: underline;">${inviteLink}</a>
                    </p>
                    <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
                    <p style="font-size: 11px; color: #9ca3af; text-align: center; line-height: 1.4;">
                        Este é um e-mail automatizado de convite enviado pelo sistema AuditForce.<br/>
                        Por favor, não responda diretamente a esta mensagem.
                    </p>
                </div>
            `;

            // Save simulated email to mock list
            const newSimulatedEmail = {
                id: 'email-' + Math.random().toString(36).substring(2, 11),
                to: restUserData.email,
                subject: emailSubject,
                body: emailBody,
                sentAt: new Date().toISOString(),
                inviteToken: inviteToken,
                name: restUserData.name
            };

            const existingEmails = JSON.parse(localStorage.getItem('auditforce_sent_emails') || '[]');
            localStorage.setItem('auditforce_sent_emails', JSON.stringify([newSimulatedEmail, ...existingEmails]));

            // Dispatch instant notification update
            window.dispatchEvent(new Event('auditforce_emails_updated'));

            // Dispatch automated real server email
            dispatchServerEmail(restUserData.email, emailSubject, emailBody);
        }

        setCreateUserModalOpen(false);
        setUserToEdit(null);
    };

    const handleCompleteInvite = (password: string) => {
        if (!inviteUser) return;

        const updatedUser: User = {
            ...inviteUser,
            isPendingInvite: false,
            password: password,
            status: 'Online',
        };

        // Save to mockData
        mockData.updateUser(updatedUser);

        // Notify administrators
        const administrators = mockData.users.filter(u => u.role === 'Administrator' || u.email.toLowerCase() === 'willianhcamargo@gmail.com');
        administrators.forEach(admin => {
            mockData.addNotification(admin.id, `O usuário ${inviteUser.name} finalizou o cadastro e agora está ativo.`);

            const adminSubject = `AuditForce - Cadastro Concluído: ${inviteUser.name}`;
            const adminBody = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 24px; border-bottom: 2px solid #10b981; padding-bottom: 16px;">
                        <h1 style="color: #10b981; margin: 0; font-size: 28px; font-weight: 800; tracking-tight: -0.05em;">AuditForce</h1>
                        <p style="color: #6b7280; font-size: 14px; margin-top: 4px; font-weight: 500;">Cadastro Concluído com Sucesso</p>
                    </div>
                    <p style="font-size: 16px; color: #111827; font-weight: 600;">Olá, Administrador!</p>
                    <p style="font-size: 14px; color: #374151; line-height: 1.6;">
                        O usuário <strong>${inviteUser.name}</strong> (${inviteUser.email}) aceitou o convite e concluiu com sucesso o seu cadastro no <strong>AuditForce</strong>.
                    </p>
                    <p style="font-size: 14px; color: #374151; line-height: 1.6;">
                        Ele agora possui acesso ativo como <strong>${
                            inviteUser.role === 'Employee' ? 'Funcionário' :
                            inviteUser.role === 'Manager' ? 'Gerente' :
                            inviteUser.role === 'Auditor' ? 'Auditor' : 'Administrador'
                        }</strong> e já pode acessar a plataforma.
                    </p>
                    <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
                    <p style="font-size: 11px; color: #9ca3af; text-align: center; line-height: 1.4;">
                        Este é um e-mail automatizado enviado pelo sistema AuditForce.<br/>
                        Por favor, não responda diretamente a esta mensagem.
                    </p>
                </div>
            `;
            dispatchServerEmail(admin.email, adminSubject, adminBody);
        });

        // Set current user (login the user automatically)
        setCurrentUser(updatedUser);

        // Clean query param
        window.history.replaceState({}, document.title, window.location.pathname);
        setInviteToken(null);
        setInviteUser(null);

        addToast('Cadastro concluído com sucesso! Bem-vindo ao AuditForce.');
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

     const handleUpdateCurrentUserAvatar = async (file: File) => {
        if (currentUser) {
            try {
                const base64Avatar = await fileToBase64(file);
                const updatedUser = { ...currentUser, avatarUrl: base64Avatar };
                mockData.updateUser(updatedUser);
                setCurrentUser(updatedUser);
                addToast('Foto de perfil atualizada!');
            } catch (e) {
                addToast('Erro ao atualizar foto.', 'error');
            }
        }
    };

    const handleSaveAudit = (auditData: Omit<Audit, 'id' | 'findings' | 'status' | 'code'>) => {
        mockData.addAudit(auditData);
        setCreateAuditModalOpen(false);
        addToast(`Auditoria agendada com sucesso.`);
    };
    
    const handleSaveGrid = (gridData: AuditGrid | Omit<AuditGrid, 'id'>) => {
        mockData.saveGrid(gridData);
        setCreateGridModalOpen(false);
        setGridToEdit(null);
        addToast(`Grade de auditoria salva.`);
    };

    const handleEditGrid = (gridId: string) => {
        const grid = mockData.grids.find(g => g.id === gridId);
        if(grid) {
            setGridToEdit(grid);
            setCreateGridModalOpen(true);
        }
    }

    const handleGetAIAssistance = async (findingDescription: string) => {
        if (!findingDescription) {
            setAiRecommendation('Por favor, adicione uma descrição.');
            return;
        }
        setIsGeneratingAIRecommendation(true);
        setAiRecommendation('');
        try {
            const recommendation = await generateRecommendation(findingDescription);
            setAiRecommendation(recommendation);
        } catch (error) {
            setAiRecommendation('Erro ao gerar recomendação.');
        } finally {
            setIsGeneratingAIRecommendation(false);
        }
    };

    const handleSaveActionPlan = (planData: Omit<ActionPlan, 'id' | 'followUps'> | ActionPlan) => {
        mockData.saveActionPlan(planData);
        setCreateActionPlanModalOpen(false);
        setActionPlanToEdit(null);
        addToast(`Plano de ação atualizado.`);
    };
    
    const handleOpenCreateActionPlanModal = (context: { findingId?: string, indicatorId?: string }) => {
        if (context.findingId) {
            setCurrentFindingIdForActionPlan(context.findingId);
            setCurrentIndicatorIdForActionPlan(null);
        } else if (context.indicatorId) {
            setCurrentFindingIdForActionPlan(null);
            setCurrentIndicatorIdForActionPlan(context.indicatorId);
        }
        setActionPlanToEdit(null);
        setCreateActionPlanModalOpen(true);
    };

    const handleOpenEditActionPlanModal = (plan: ActionPlan) => {
        setActionPlanToEdit(plan);
        if (plan.findingId) {
            setCurrentFindingIdForActionPlan(plan.findingId);
            setCurrentIndicatorIdForActionPlan(null);
        } else if (plan.performanceIndicatorId) {
            setCurrentFindingIdForActionPlan(null);
            setCurrentIndicatorIdForActionPlan(plan.performanceIndicatorId);
        }
        setCreateActionPlanModalOpen(true);
    };
    
    const handleOpenReport = (auditId: string) => {
        const audit = mockData.audits.find(a => a.id === auditId);
        if (!audit) return;
        const grid = mockData.grids.find(g => g.id === audit.gridId);
        if (!grid) return;
        const auditor = mockData.users.find(u => u.id === audit.auditorId);
        const actionPlans = mockData.actionPlans.filter(p => audit.findings.some(f => f.id === p.findingId));
        setReportData({ audit, grid, auditor, actionPlans, users: mockData.users });
    };
    
    const handleSavePolicy = (policyData: PolicySubmitData) => {
        const isEditing = 'id' in policyData;
        const authorId = currentUser?.id;
        if (!authorId) return;

        if (isEditing) {
            const originalPolicy = mockData.policies.find(p => p.id === policyData.id);
            if (originalPolicy && (originalPolicy.content !== policyData.content)) {
                 setVersionConfirmState({ policyData, isOpen: true });
                 return;
            }
        }
        
        mockData.savePolicy(policyData, { authorId });
        addToast(isEditing ? 'Política atualizada.' : 'Política criada.');
        setCreatePolicyModalOpen(false);
        setPolicyToEdit(null);
    };

    const handleVersionConfirm = (decision: 'new' | 'update', changeDescription?: string) => {
        if (!versionConfirmState || !currentUser) return;
        const { policyData } = versionConfirmState;
        mockData.savePolicy(policyData, { createNewVersion: decision === 'new', changeDescription, authorId: currentUser.id });
        addToast('Versão da política salva.');
        setVersionConfirmState(null);
        setCreatePolicyModalOpen(false);
        setPolicyToEdit(null);
    };

    const handleSaveMeeting = (meetingData: Omit<Meeting, 'id'> | Meeting) => {
        if (!currentUser) return;
        const fullMeetingData = 'id' in meetingData ? meetingData : { ...meetingData, organizerId: currentUser.id };
        const savedMeeting = mockData.saveMeeting(fullMeetingData);
        setCreateMeetingModalOpen(false);
        setMeetingToEdit(null);
        addToast('Reunião agendada.');
        
        const policy = mockData.policies.find(p => p.id === savedMeeting.policyId);
        const attendees = mockData.users.filter(u => savedMeeting.attendeeIds.includes(u.id));
        const { content, filename } = generateICSFile(savedMeeting, policy, attendees, currentUser);
        const mailtoUrl = `mailto:${attendees.map(u => u.email).join(',')}?subject=Reunião AuditForce: ${savedMeeting.title}`;
        setInvitationDetails({ content, filename, mailtoUrl });
    };

    // Render logic
    const selectedAudit = selectedAuditId ? mockData.audits.find(a => a.id === selectedAuditId) : null;
    const selectedGrid = selectedAudit ? mockData.grids.find(g => g.id === selectedAudit.gridId) : null;

    if (inviteUser) return (
        <InviteCompleteScreen 
            user={inviteUser} 
            onCompleteRegistration={handleCompleteInvite} 
        />
    );

    if (!currentUser) return (
        <LoginScreen 
            users={mockData.users} 
            onLogin={handleLogin} 
            onSetAdminPassword={handleSetAdminPassword} 
        />
    );

    const renderPage = () => {
        if (selectedAudit && selectedGrid) {
            return (
                <AuditDetails
                    audit={selectedAudit}
                    grid={selectedGrid}
                    auditor={mockData.users.find(u => u.id === selectedAudit.auditorId)}
                    users={mockData.users}
                    actionPlans={mockData.actionPlans.filter(p => selectedAudit.findings.some(f => f.id === p.findingId))}
                    onUpdateFindingStatus={mockData.updateFindingStatus}
                    onUpdateFindingDescription={mockData.updateFindingDescription}
                    onAttachFile={mockData.addAttachment}
                    onDeleteAttachment={mockData.deleteAttachment}
                    onUpdateActionPlanStatus={mockData.updateActionPlanStatus}
                    onAddFollowUp={(planId, content) => mockData.addFollowUpToActionPlan(planId, content, currentUser.id)}
                    onCreateActionPlan={(findingId) => handleOpenCreateActionPlanModal({ findingId })}
                    onEditActionPlan={handleOpenEditActionPlanModal}
                    onGetAIAssistance={handleGetAIAssistance}
                    aiRecommendation={aiRecommendation}
                    isGeneratingAIRecommendation={isGeneratingAIRecommendation}
                    onUpdateAuditStatus={mockData.updateAuditStatus}
                    currentUser={currentUser}
                />
            );
        }

        switch (currentPage) {
            case 'dashboard': return <Dashboard audits={mockData.audits} actionPlans={mockData.actionPlans} currentUser={currentUser} onNavigate={handleNavigate} />;
            case 'audits': return <AuditList audits={mockData.audits} users={mockData.users} onSelectAudit={handleSelectAudit} onCreateAudit={() => setCreateAuditModalOpen(true)} onUpdateAuditStatus={mockData.updateAuditStatus} currentUser={currentUser} onOpenReport={handleOpenReport} />;
            case 'grids': return <GridManagement grids={mockData.grids} onCreateGrid={() => { setGridToEdit(null); setCreateGridModalOpen(true); }} onEditGrid={handleEditGrid} onDeleteGrid={mockData.deleteGrid} currentUser={currentUser} />;
            case 'users': return (
                <UserManagement 
                    users={mockData.users} 
                    onCreateUser={handleOpenCreateUserModal} 
                    onEditUser={handleOpenEditUserModal} 
                    currentUser={currentUser}
                />
            );
            case 'chatbot': return <Chatbot currentUser={currentUser} audits={mockData.audits} grids={mockData.grids} actionPlans={mockData.actionPlans} />;
            case 'policies': return <PolicyManagement policies={mockData.policies} currentUser={currentUser} onCreatePolicy={() => { setPolicyToEdit(null); setCreatePolicyModalOpen(true); }} onEditPolicy={(policy) => { setPolicyToEdit(policy); setCreatePolicyModalOpen(true); }} onDeletePolicy={(policy) => setPolicyToDelete(policy)} onOpenViewPolicy={(policy) => setPolicyToView(policy)} users={mockData.users} meetings={mockData.meetings} onOpenCreateMeeting={(date) => { setMeetingToEdit(null); setDefaultMeetingDate(date || null); setCreateMeetingModalOpen(true); }} onCancelMeeting={(meeting) => setMeetingToCancel(meeting)} onEditMeeting={(meeting) => { setMeetingToEdit(meeting); setCreateMeetingModalOpen(true); }} onAddFollowUp={(planId, content) => mockData.addFollowUpToActionPlan(planId, content, currentUser.id)} />;
            default: return <Dashboard audits={mockData.audits} actionPlans={mockData.actionPlans} currentUser={currentUser} onNavigate={handleNavigate} />;
        }
    };
    
    return (
        <div className="flex h-screen bg-background dark:bg-dark-background text-on-background dark:text-dark-on-background">
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
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    {renderPage()}
                </main>
            </div>
            
            <CreateUserModal isOpen={isCreateUserModalOpen} onClose={() => setCreateUserModalOpen(false)} onSubmit={handleSaveUser} userToEdit={userToEdit} allUsers={mockData.users} />
            <CreateAuditModal isOpen={isCreateAuditModalOpen} onClose={() => setCreateAuditModalOpen(false)} onSave={handleSaveAudit} users={mockData.users} grids={mockData.grids} />
            <CreateGridModal isOpen={isCreateGridModalOpen} onClose={() => setCreateGridModalOpen(false)} onSave={handleSaveGrid} gridToEdit={gridToEdit} />
             <CreateActionPlanModal isOpen={isCreateActionPlanModalOpen} onClose={() => setCreateActionPlanModalOpen(false)} onSave={handleSaveActionPlan} users={mockData.users} findingId={currentFindingIdForActionPlan} performanceIndicatorId={currentIndicatorIdForActionPlan} planToEdit={actionPlanToEdit} />
            <ReportModal isOpen={!!reportData} onClose={() => setReportData(null)} data={reportData} />
            <CreatePolicyModal isOpen={isCreatePolicyModalOpen} onClose={() => { setCreatePolicyModalOpen(false); setPolicyToEdit(null); }} onSave={handleSavePolicy} policyToEdit={policyToEdit} users={mockData.users} />
            {policyToView && <ViewPolicyModal isOpen={!!policyToView} onClose={() => setPolicyToView(null)} policy={policyToView} policyHistory={mockData.policyHistory} users={mockData.users} actionPlans={mockData.actionPlans.filter(p => policyToView.performanceIndicators.some(i => i.id === p.performanceIndicatorId))} onCreateActionPlan={(indicatorId) => handleOpenCreateActionPlanModal({ indicatorId })} onEditActionPlan={handleOpenEditActionPlanModal} onAddFollowUp={(planId, content) => mockData.addFollowUpToActionPlan(planId, content, currentUser.id)} onUpdateActionPlanStatus={mockData.updateActionPlanStatus} currentUser={currentUser} />}
            {policyToDelete && <ConfirmationModal isOpen={!!policyToDelete} onClose={() => setPolicyToDelete(null)} onConfirm={() => { mockData.deletePolicy(policyToDelete.id); addToast(`Política excluída.`); setPolicyToDelete(null); }} title="Excluir Política" message={`Deseja excluir "${policyToDelete.title}"?`} />}
            {versionConfirmState?.isOpen && <VersionConfirmationModal isOpen={versionConfirmState.isOpen} onClose={() => setVersionConfirmState(null)} onConfirm={handleVersionConfirm} />}
            <CreateMeetingModal isOpen={isCreateMeetingModalOpen} onClose={() => { setCreateMeetingModalOpen(false); setMeetingToEdit(null); }} onSave={handleSaveMeeting} policies={mockData.policies} users={mockData.users} defaultDate={defaultMeetingDate} meetingToEdit={meetingToEdit} />
            {invitationDetails && <MeetingConfirmationModal isOpen={!!invitationDetails} onClose={() => setInvitationDetails(null)} invitationDetails={invitationDetails} />}
            {meetingToCancel && <ConfirmationModal isOpen={!!meetingToCancel} onClose={() => setMeetingToCancel(null)} onConfirm={() => { mockData.deleteMeeting(meetingToCancel.id); addToast(`Reunião cancelada.`); setMeetingToCancel(null); }} title="Cancelar Reunião" message={`Deseja cancelar "${meetingToCancel.title}"?`} />}

            <div className="fixed bottom-5 right-5 z-50 space-y-2">
                {toasts.map(toast => <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} />)}
            </div>
        </div>
    );
};
