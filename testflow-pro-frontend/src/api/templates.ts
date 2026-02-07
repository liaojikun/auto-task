import apiClient from './client';
import { TestTemplate } from './types';

export const templateApi = {
  getAll: async (): Promise<TestTemplate[]> => {
    const response = await apiClient.get<TestTemplate[]>('/templates');
    return response.data;
  },

  trigger: async (templateId: number, env: string): Promise<{ taskId: number }> => {
    const response = await apiClient.post<{ taskId: number }>(`/templates/${templateId}/run`, { env });
    return response.data;
  }
};
