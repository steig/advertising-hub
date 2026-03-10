import type { PlatformConfig } from '../../types/platform';
import type { AgentDefinition } from '../../types/agent';
import type { MCPRegistry } from '../../types/mcp-registry';
import { getTeamId } from '../contexts/TeamContext';

interface FetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
}

let isRefreshing = false;

async function fetchApi<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { method = 'GET', headers = {}, body } = options;

  const reqHeaders: Record<string, string> = {
    ...headers,
  };

  const teamId = getTeamId();
  if (teamId) {
    reqHeaders['X-Team-Id'] = teamId;
  }

  if (body !== undefined && !reqHeaders['Content-Type']) {
    reqHeaders['Content-Type'] = 'application/json';
  }

  // Add CSRF-style header on mutations
  if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
    reqHeaders['X-Requested-With'] = 'XMLHttpRequest';
  }

  const init: RequestInit = {
    method,
    headers: reqHeaders,
    credentials: 'include',
  };

  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  let res = await fetch(`/api${path}`, init);

  // 401 retry: attempt token refresh once
  if (res.status === 401 && !isRefreshing) {
    isRefreshing = true;
    try {
      const refreshRes = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });
      if (refreshRes.ok) {
        res = await fetch(`/api${path}`, init);
      }
    } finally {
      isRefreshing = false;
    }
  }

  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json() as Promise<T>;
}

// Auth
export function getMe() {
  return fetchApi<{ user: { id: string; email: string; name: string; avatar_url?: string }; teams: { id: string; slug: string; name: string; role: string }[] }>('/auth/me');
}

// Teams
export function getTeams() {
  return fetchApi<{ id: string; slug: string; name: string; role: string }[]>('/teams');
}

export function createTeam(data: { name: string; slug: string }) {
  return fetchApi<{ id: string; slug: string; name: string }>('/teams', { method: 'POST', body: data });
}

// Members
export function getMembers() {
  return fetchApi<{ user_id: string; email: string; name: string; role: string; joined_at: string }[]>('/members');
}

export function updateMemberRole(userId: string, role: string) {
  return fetchApi<{ success: boolean }>(`/members/${userId}`, { method: 'PATCH', body: { role } });
}

export function removeMember(userId: string) {
  return fetchApi<{ success: boolean }>(`/members/${userId}`, { method: 'DELETE' });
}

// Invitations
export function getInvitations() {
  return fetchApi<{ id: string; email: string; role: string; status: string; created_at: string }[]>('/invitations');
}

export function createInvitation(data: { email: string; role: string }) {
  return fetchApi<{ id: string }>('/invitations', { method: 'POST', body: data });
}

export function revokeInvitation(id: string) {
  return fetchApi<{ success: boolean }>(`/invitations/${id}`, { method: 'DELETE' });
}

export function getPendingInvitations() {
  return fetchApi<{ invitations: { id: string; team_name: string; role: string }[] }>('/invitations/pending');
}

export function acceptInvitation(id: string) {
  return fetchApi<{ success: boolean }>(`/invitations/${id}/accept`, { method: 'POST' });
}

// Audit
export function getAuditLog(page = 1) {
  return fetchApi<{ items: { id: number; user_id: string; user_name?: string; action: string; target_type: string | null; target_id: string | null; metadata: string | null; created_at: string }[]; total: number; page: number; pages: number }>(`/audit?page=${page}&limit=50`);
}

export function deleteConversations(ids: string[]) {
  return Promise.allSettled(ids.map((id) => deleteConversation(id)));
}

// Platforms
export function getPlatforms(category?: string) {
  const params = category ? `?category=${category}` : '';
  return fetchApi<PlatformConfig[]>(`/platforms${params}`);
}

export function getPlatform(slug: string) {
  return fetchApi<PlatformConfig>(`/platforms/${slug}`);
}

// Agents
export function getAgents(category?: string) {
  const params = category ? `?category=${category}` : '';
  return fetchApi<AgentDefinition[]>(`/agents${params}`);
}

export function getAgent(slug: string) {
  return fetchApi<AgentDefinition>(`/agents/${slug}`);
}

// Scripts
export interface ScriptMeta {
  id: string;
  filename: string;
  description: string;
}

export interface ScriptSource extends ScriptMeta {
  source: string;
}

export function getScripts() {
  return fetchApi<ScriptMeta[]>('/scripts');
}

export function getScriptSource(id: string) {
  return fetchApi<ScriptSource>(`/scripts/${id}/source`);
}

// MCP
export function getMcpRegistry() {
  return fetchApi<MCPRegistry>('/mcp/registry');
}

// Health
export interface HealthStatus {
  status: string;
  platforms: number;
  agents: number;
  timestamp: string;
}

export function getHealth() {
  return fetchApi<HealthStatus>('/health');
}

// Conversations
export interface Conversation {
  id: string;
  agent_slug: string;
  title: string;
  created_at: string;
  updated_at: string;
  shared_at: string | null;
}

export function getConversations() {
  return fetchApi<Conversation[]>('/conversations');
}

export function createConversation(agentSlug: string) {
  return fetchApi<{ id: string; agentSlug: string; title: string }>('/conversations', {
    method: 'POST',
    body: { agentSlug },
  });
}

export function renameConversation(id: string, title: string) {
  return fetchApi<{ id: string; title: string }>(`/conversations/${id}`, {
    method: 'PATCH',
    body: { title },
  });
}

export function deleteConversation(id: string) {
  return fetchApi<void>(`/conversations/${id}`, { method: 'DELETE' });
}

export function toggleShareConversation(id: string) {
  return fetchApi<{ shared: boolean; url?: string }>(`/conversations/${id}/share`, { method: 'POST' });
}

export function getConversationHistory(id: string) {
  return fetchApi<{ role: string; content: string; timestamp: number }[]>(
    `/conversations/${id}/history`
  );
}

export function getSharedConversation(id: string) {
  return fetchApi<{
    conversation: Conversation;
    messages: { role: string; content: string; timestamp: number }[];
  }>(`/shared/${id}`);
}

// Team Platforms
export interface TeamPlatform {
  platform: string;
  enabled_at: string;
  enabled_by: string;
}

export function getEnabledPlatforms() {
  return fetchApi<TeamPlatform[]>('/team-platforms');
}

export function enablePlatform(platform: string) {
  return fetchApi<{ platform: string; enabled: boolean }>(`/team-platforms/${platform}`, { method: 'POST' });
}

export function disablePlatform(platform: string) {
  return fetchApi<{ platform: string; enabled: boolean }>(`/team-platforms/${platform}`, { method: 'DELETE' });
}

// Reports
export interface Report {
  id: string;
  team_id: string;
  name: string;
  platform: string;
  data_config: string;
  schedule: string | null;
  is_active: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  latest_version?: number;
  latest_prompt?: string;
  last_execution_status?: string | null;
  last_execution_at?: string | null;
  creator_name?: string;
}

export interface PromptVersion {
  id: string;
  report_id: string;
  version: number;
  prompt_text: string;
  created_by: string;
  created_at: string;
  creator_name?: string;
}

export interface ReportExecution {
  id: string;
  report_id: string;
  prompt_version_id: string;
  status: string;
  output_key: string | null;
  summary_text: string | null;
  error: string | null;
  trigger_type: string;
  delivery_status: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  prompt_version?: number;
}

export function getReports() {
  return fetchApi<Report[]>('/reports');
}

export function getReport(id: string) {
  return fetchApi<Report>(`/reports/${id}`);
}

export function createReport(data: {
  name: string;
  platform: string;
  data_config: Record<string, unknown>;
  schedule?: string;
  delivery_config?: { email_recipients?: string[]; slack_webhook_url?: string };
  prompt_text: string;
}) {
  return fetchApi<Report>('/reports', { method: 'POST', body: data });
}

export function updateReport(id: string, data: Record<string, unknown>) {
  return fetchApi<Report>(`/reports/${id}`, { method: 'PATCH', body: data });
}

export function deleteReport(id: string) {
  return fetchApi<{ ok: boolean }>(`/reports/${id}`, { method: 'DELETE' });
}

export function getPromptVersions(reportId: string) {
  return fetchApi<PromptVersion[]>(`/reports/${reportId}/versions`);
}

export function createPromptVersion(reportId: string, prompt_text: string) {
  return fetchApi<PromptVersion>(`/reports/${reportId}/versions`, { method: 'POST', body: { prompt_text } });
}

export function getReportExecutions(reportId: string, page = 1) {
  return fetchApi<{ items: ReportExecution[]; total: number; page: number; pages: number }>(
    `/reports/${reportId}/executions?page=${page}&limit=20`
  );
}

export function runReport(reportId: string) {
  return fetchApi<{ execution_id: string }>(`/reports/${reportId}/run`, { method: 'POST' });
}

export function getExecutionDetail(execId: string) {
  return fetchApi<ReportExecution>(`/reports/executions/${execId}`);
}

export async function getExecutionOutput(execId: string): Promise<Record<string, unknown>> {
  return fetchApi<Record<string, unknown>>(`/reports/executions/${execId}/output`);
}
