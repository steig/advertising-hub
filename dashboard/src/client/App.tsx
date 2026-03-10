import { Routes, Route, Outlet } from 'react-router';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ErrorBoundary } from './components/ErrorBoundary';
import { UserProvider } from './contexts/UserContext';
import { TeamProvider } from './contexts/TeamContext';
import { ToastProvider } from './contexts/ToastContext';
import { AuthGuard } from './components/auth/AuthGuard';
import { TeamGuard } from './components/auth/TeamGuard';
import { LoginPage } from './components/auth/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { PlatformsPage } from './pages/PlatformsPage';
import { PlatformDetailPage } from './pages/PlatformDetailPage';
import { AgentsPage } from './pages/AgentsPage';
import { AgentDetailPage } from './pages/AgentDetailPage';
import { ScriptsPage } from './pages/ScriptsPage';
import { SettingsPage } from './pages/SettingsPage';
import { HealthPage } from './pages/HealthPage';
import { ChatPage } from './pages/ChatPage';
import { SharedConversationPage } from './pages/SharedConversationPage';
import { CreateTeamPage } from './pages/CreateTeamPage';
import { AcceptInvitationPage } from './pages/AcceptInvitationPage';
import { TeamSettingsPage } from './pages/TeamSettingsPage';
import { MembersPage } from './pages/MembersPage';
import { InvitationsPage } from './pages/InvitationsPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { ReportsPage } from './pages/ReportsPage';
import { ReportDetailPage } from './pages/ReportDetailPage';
import { ReportEditorPage } from './pages/ReportEditorPage';
import { ExecutionDetailPage } from './pages/ExecutionDetailPage';

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <p className="text-6xl font-bold text-slate-700 mb-2">404</p>
      <p className="text-slate-400 mb-4">Page not found</p>
      <a href="/" className="text-sm text-blue-400 hover:text-blue-300">Go to Dashboard</a>
    </div>
  );
}

function DashboardLayout() {
  return (
    <div className="flex h-screen bg-slate-900 text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-3 focus:bg-blue-600 focus:text-white">
          Skip to main content
        </a>
        <main id="main-content" className="flex-1 overflow-y-auto p-6">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

export function App() {
  return (
    <ToastProvider>
    <UserProvider>
      <TeamProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/shared/:conversationId" element={<SharedConversationPage />} />

          {/* Authenticated routes */}
          <Route element={<AuthGuard />}>
            <Route path="/invitations" element={<AcceptInvitationPage />} />
            <Route path="/teams/new" element={<CreateTeamPage />} />

            {/* Team-scoped routes */}
            <Route element={<TeamGuard />}>
              {/* Full-screen pages (no sidebar/header) */}
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/chat/:conversationId" element={<ChatPage />} />

              {/* Dashboard layout pages */}
              <Route element={<DashboardLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/platforms" element={<PlatformsPage />} />
                <Route path="/platforms/:slug" element={<PlatformDetailPage />} />
                <Route path="/agents" element={<AgentsPage />} />
                <Route path="/agents/:slug" element={<AgentDetailPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/reports/new" element={<ReportEditorPage />} />
                <Route path="/reports/:id" element={<ReportDetailPage />} />
                <Route path="/reports/:id/edit" element={<ReportEditorPage />} />
                <Route path="/reports/:id/executions/:execId" element={<ExecutionDetailPage />} />
                <Route path="/scripts" element={<ScriptsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/settings/team" element={<TeamSettingsPage />} />
                <Route path="/settings/members" element={<MembersPage />} />
                <Route path="/settings/invitations" element={<InvitationsPage />} />
                <Route path="/settings/audit" element={<AuditLogPage />} />
                <Route path="/health" element={<HealthPage />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </TeamProvider>
    </UserProvider>
    </ToastProvider>
  );
}
