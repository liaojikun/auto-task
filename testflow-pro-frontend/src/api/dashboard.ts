import apiClient from './client';
import type { TaskExecution, DashboardSummary } from './types';

export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    const response = await apiClient.get<DashboardSummary>('/dashboard/summary');
    return response.data;
  },

  getRunningTasks: async (): Promise<TaskExecution[]> => {
    const response = await apiClient.get<TaskExecution[]>('/dashboard/running');
    return response.data;
  },

  trigger: async (templateId: number, env: string, auto_notify?: boolean): Promise<TaskExecution> => {
    const response = await apiClient.post<TaskExecution>('/dashboard/trigger', { template_id: templateId, env, auto_notify });
    return response.data;
  },

  getRecentTasks: async (
    _page: number = 1, 
    _pageSize: number = 5,
    _filters: { taskName?: string; user?: string } = {}
  ): Promise<{ items: TaskExecution[]; total: number; page: number; size: number }> => {
    // Backend currently only supports 'limit' and returns a list.
    // We will simulate pagination for now or just return what we have.
    // Ignoring page/filters for the actual API call as backend doesn't support them yet.
    const params = {
      limit: 20 // Fetch enough to show some history
    };
    const response = await apiClient.get<TaskExecution[]>('/dashboard/recent', { params });
    
    // Client-side filtering/pagination could be done here if needed, 
    // but for now we just wrap the result.
    return {
        items: response.data,
        total: response.data.length,
        page: 1,
        size: response.data.length
    };
  }
};
