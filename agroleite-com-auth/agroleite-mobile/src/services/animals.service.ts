import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Animal } from '../types';

// Payload de criação: exclui id e userId (userId é extraído do JWT no servidor)
type CreateAnimalPayload = Omit<Animal, 'id' | 'userId'>;
type UpdateAnimalPayload = Partial<Omit<Animal, 'id' | 'userId'>>;

export const animalsService = {
  getAnimals: async (): Promise<Animal[]> => {
    try {
      const response = await api.get('/animals');
      const animals = response.data;
      await AsyncStorage.setItem(OFFLINE_KEY, JSON.stringify(animals));
      return animals;
    } catch (error) {
      console.warn('API indisponível, tentando cache offline...');
      const offlineData = await AsyncStorage.getItem(OFFLINE_KEY);
      if (offlineData) return JSON.parse(offlineData) as Animal[];
      throw new Error('Sem conexão e sem dados salvos offline.');
    }
  },

  createAnimal: async (data: CreateAnimalPayload): Promise<Animal> => {
    const response = await api.post('/animals', data);
    return response.data;
  },

  updateAnimal: async (id: string, data: UpdateAnimalPayload): Promise<Animal> => {
    const response = await api.patch(`/animals/${id}`, data);
    return response.data;
  },

  deleteAnimal: async (id: string): Promise<void> => {
    await api.delete(`/animals/${id}`);
  },
};

