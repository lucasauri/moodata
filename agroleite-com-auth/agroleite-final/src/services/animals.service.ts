import api from './api';
import { Animal } from '../types';

export const animalService = {
  getAnimals: async () => {
    const response = await api.get<Animal[]>('/animals');
    return response.data;
  },

  createAnimal: async (animal: Omit<Animal, 'id'>) => {
    const response = await api.post<Animal>('/animals', animal);
    return response.data;
  },

  updateAnimal: async (id: string, animal: Partial<Animal>) => {
    const response = await api.patch<Animal>(`/animals/${id}`, animal);
    return response.data;
  },

  deleteAnimal: async (id: string) => {
    await api.delete(`/animals/${id}`);
  }
};
