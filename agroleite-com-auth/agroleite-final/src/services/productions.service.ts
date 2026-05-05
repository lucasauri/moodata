import api from './api';
import { MilkProduction } from '../types';

export const productionService = {
  getProductions: async () => {
    const response = await api.get<MilkProduction[]>('/productions');
    return response.data;
  },

  createProduction: async (production: Omit<MilkProduction, 'id'>) => {
    const response = await api.post<MilkProduction>('/productions', production);
    return response.data;
  },

  deleteProduction: async (id: string) => {
    await api.delete(`/productions/${id}`);
  }
};
