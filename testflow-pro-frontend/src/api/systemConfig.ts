import client from './client';

export interface SystemConfigResponse {
  data: Array<Record<string, string[]>>;
}

export const systemConfigApi = {
  getAll: async (): Promise<SystemConfigResponse> => {
    const response = await client.get('/system-configs/');
    return response.data;
  }
};
