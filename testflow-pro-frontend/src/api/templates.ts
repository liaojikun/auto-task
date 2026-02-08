import apiClient from './client';
import type { TestTemplate } from './types';

export interface CreateTemplateParams {
  name: string;
  jenkins_job_name: string;
  default_env: string;
  params?: string;
  auto_notify?: boolean;
  available_envs?: string[];
  notification_ids?: number[];
}

export const templateApi = {
  getAll: async (): Promise<TestTemplate[]> => {
    const response = await apiClient.get<TestTemplate[]>('/templates/');
    return response.data;
  },

  create: async (data: CreateTemplateParams): Promise<TestTemplate> => {
    const response = await apiClient.post<TestTemplate>('/templates/', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateTemplateParams>): Promise<TestTemplate> => {
    const response = await apiClient.put<TestTemplate>(`/templates/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/templates/${id}`);
  },
};