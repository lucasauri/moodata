import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FarmConfig } from '../types';

const OFFLINE_KEY = '@agro_offline_farmconfig';

const DEFAULT_CONFIG: FarmConfig = {
  name: 'Minha Fazenda',
  producer: '',
  location: '',
  pveDays: 60,
  dryingPeriodDays: 60,
};

export const farmConfigService = {
  getConfig: async (): Promise<FarmConfig> => {
    try {
      const response = await api.get('/farm-config');
      const data = response.data;
      await AsyncStorage.setItem(OFFLINE_KEY, JSON.stringify(data));
      return data;
    } catch (error) {
      console.warn('API indisponível, tentando cache offline (config)...');
      const offlineData = await AsyncStorage.getItem(OFFLINE_KEY);
      if (offlineData) return JSON.parse(offlineData) as FarmConfig;
      return DEFAULT_CONFIG;
    }
  },

  updateConfig: async (config: FarmConfig): Promise<FarmConfig> => {
    const response = await api.put('/farm-config', config);
    const data = response.data;
    await AsyncStorage.setItem(OFFLINE_KEY, JSON.stringify(data));
    return data;
  },
};
