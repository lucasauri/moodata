import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Animal } from '../types';

const OFFLINE_ANIMALS_KEY = '@agro_offline_animals';

export const animalsService = {
  getAnimals: async (): Promise<Animal[]> => {
    try {
      // 1. Tenta buscar da API (Internet)
      const response = await api.get('/animals');
      const animals = response.data;
      
      // 2. Salva no AsyncStorage para uso offline no futuro
      await AsyncStorage.setItem(OFFLINE_ANIMALS_KEY, JSON.stringify(animals));
      
      return animals;
    } catch (error) {
      console.warn('Erro ao buscar animais na API. Tentando cache offline...');
      
      // 3. Se falhou (sem internet ou API fora do ar), tenta ler do AsyncStorage
      const offlineData = await AsyncStorage.getItem(OFFLINE_ANIMALS_KEY);
      if (offlineData) {
        return JSON.parse(offlineData) as Animal[];
      }
      
      // Se não tem cache, joga o erro pra frente
      throw new Error('Sem conexão com a internet e sem dados salvos offline.');
    }
  }
};
