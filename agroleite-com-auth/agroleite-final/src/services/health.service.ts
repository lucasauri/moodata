import api from './api';
import { HealthEvent } from '../types';

export const healthService = {
  getEvents: async () => {
    const response = await api.get<HealthEvent[]>('/health');
    return response.data;
  },

  createEvent: async (event: Omit<HealthEvent, 'id'>) => {
    const response = await api.post<HealthEvent>('/health', event);
    return response.data;
  },

  deleteEvent: async (id: string) => {
    await api.delete(`/health/${id}`);
  }
};
