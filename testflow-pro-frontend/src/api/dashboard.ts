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

  getRecentTasks: async (
    page: number = 1, 
    pageSize: number = 5,
    filters: { taskName?: string; user?: string } = {}
  ): Promise<{ items: TaskExecution[]; total: number; page: number; size: number }> => {
    const params = {
      page,
      size: pageSize,
      ...filters
    };
    const response = await apiClient.get<{ items: TaskExecution[]; total: number; page: number; size: number }>('/dashboard/recent', { params });
    return response.data;
  }
};
