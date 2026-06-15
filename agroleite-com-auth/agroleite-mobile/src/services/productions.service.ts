import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MilkProduction } from '../types';

const OFFLINE_KEY = '@agro_offline_productions';

export const productionsService = {
  getProductions: async (): Promise<MilkProduction[]> => {
    try {
      const response = await api.get('/productions');
      const data = response.data;
      await AsyncStorage.setItem(OFFLINE_KEY, JSON.stringify(data));
      return data;
    } catch (error) {
      console.warn('API indisponível, tentando cache offline (produções)...');
      const offlineData = await AsyncStorage.getItem(OFFLINE_KEY);
      if (offlineData) return JSON.parse(offlineData) as MilkProduction[];
      throw new Error('Sem conexão e sem dados salvos offline.');
    }
  },

  createProduction: async (data: Omit<MilkProduction, 'id'>): Promise<MilkProduction> => {
    const response = await api.post('/productions', data);
    return response.data;
  },

  deleteProduction: async (id: string): Promise<void> => {
    await api.delete(`/productions/${id}`);
  },
};
