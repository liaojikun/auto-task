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

export interface TaskStatsDetail {
  total: number;
  broken: number;
  failed: number;
  passed: number;
  skipped: number;
  unknown: number;
}

export interface TaskTimeStats {
  stop: number;
  start: number;
  duration: number;
  maxDuration: number;
  minDuration: number;
  sumDuration: number;
}

export interface TaskStats {
  time?: TaskTimeStats;
  statistic?: TaskStatsDetail;
}

export type TaskStatus = 'QUEUED' | 'RUNNING' | 'SUCCESS' | 'FAILURE' | 'ABORTED';

export interface TaskExecution {
  id: number;
  template_id: number;
  template_name?: string;
  build_number: number;
  status: TaskStatus;
  execution_env: string; // Changed from 'env'
  trigger_type: 'MANUAL' | 'SCHEDULE';
  triggered_by: string;
  start_time: string; // ISO string
  duration: number; // seconds
  allure_report_url?: string;
  stats?: TaskStats; // Made optional and updated structure
  should_notify?: boolean;
  jenkins_queue_item_url?: string;
  progress?: number;
}

export interface DashboardSummary {
  running_count: number;
  today_pass_rate: number;
}
