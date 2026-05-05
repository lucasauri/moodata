import api from './api';
import { FarmConfig } from '../types';

export const farmConfigService = {
  getConfig: async () => {
    const response = await api.get<FarmConfig>('/farm-config');
    return response.data;
  },

  updateConfig: async (config: FarmConfig) => {
    const response = await api.put<FarmConfig>('/farm-config', config);
    return response.data;
  }
};
