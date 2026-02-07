export interface TestTemplate {
  id: number;
  name: string;
  jenkins_job_name: string;
  default_env: string;
  available_envs: string[]; // Backend sends JSON array
  description?: string;
  params?: string;
  auto_notify?: boolean;
}

export interface TaskStats {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
}

export type TaskStatus = 'QUEUED' | 'RUNNING' | 'SUCCESS' | 'FAILURE' | 'ABORTED';

export interface TaskExecution {
  id: number;
  template_id: number;
  template_name?: string; // Joined from backend
  build_number: number;
  status: TaskStatus;
  env: string;
  trigger_type: 'MANUAL' | 'SCHEDULE';
  triggered_by: string;
  start_time: string; // ISO string
  duration: number; // seconds
  allure_report_url?: string;
  stats: TaskStats;
  progress?: number; // Optional, for frontend 'running' simulation/calculation
}

export interface DashboardSummary {
  running_count: number;
  today_pass_rate: number;
}
