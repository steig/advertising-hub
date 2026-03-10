export interface Report {
  id: string;
  team_id: string;
  name: string;
  platform: string;
  data_config: string; // JSON string
  schedule: string | null;
  is_active: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ReportWithMeta extends Report {
  latest_version?: number;
  latest_prompt?: string;
  last_execution_status?: ExecutionStatus | null;
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

export type ExecutionStatus = 'pending' | 'fetching_data' | 'analyzing' | 'delivering' | 'completed' | 'failed';
export type TriggerType = 'manual' | 'scheduled';

export interface ReportExecution {
  id: string;
  report_id: string;
  prompt_version_id: string;
  status: ExecutionStatus;
  output_key: string | null;
  summary_text: string | null;
  error: string | null;
  trigger_type: TriggerType;
  delivery_status: string | null; // JSON string
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  prompt_version?: number;
}

export interface DataConfig {
  date_range?: { start: string; end: string } | string; // 'last_7d', 'last_30d', etc.
  metrics?: string[];
  dimensions?: string[];
  filters?: Record<string, string>;
}

export interface DeliveryConfig {
  email_recipients?: string[];
  slack_webhook_url?: string;
}

export interface CreateReportInput {
  name: string;
  platform: string;
  data_config: DataConfig;
  schedule?: string;
  delivery_config?: DeliveryConfig;
  prompt_text: string;
}

export interface UpdateReportInput {
  name?: string;
  data_config?: DataConfig;
  schedule?: string | null;
  delivery_config?: DeliveryConfig;
  is_active?: boolean;
}
