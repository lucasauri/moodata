import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HealthEvent } from '../types';

const OFFLINE_KEY = '@agro_offline_health';

export const healthService = {
  getEvents: async (): Promise<HealthEvent[]> => {
    try {
      const response = await api.get('/health');
      const data = response.data;
      await AsyncStorage.setItem(OFFLINE_KEY, JSON.stringify(data));
      return data;
    } catch (error) {
      console.warn('API indisponível, tentando cache offline (saúde)...');
      const offlineData = await AsyncStorage.getItem(OFFLINE_KEY);
      if (offlineData) return JSON.parse(offlineData) as HealthEvent[];
      throw new Error('Sem conexão e sem dados salvos offline.');
    }
  },

  createEvent: async (data: Omit<HealthEvent, 'id'>): Promise<HealthEvent> => {
    const response = await api.post('/health', data);
    return response.data;
  },

  deleteEvent: async (id: string): Promise<void> => {
    await api.delete(`/health/${id}`);
  },
};
