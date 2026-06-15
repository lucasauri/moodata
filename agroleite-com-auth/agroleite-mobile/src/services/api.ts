import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const TOKEN_KEY = '@agro_jwt_token';

const api = axios.create({
  // Configure EXPO_PUBLIC_API_URL no arquivo .env do projeto mobile.
  // Exemplo: EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
  // No emulador Android, 10.0.2.2 é o alias do localhost do PC host.
  // Em dispositivo físico, defina EXPO_PUBLIC_API_URL no arquivo .env
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token nas requisições do mobile
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    console.error('Erro ao ler token no interceptor', e);
  }
  return config;
});

// Interceptor para deslogar se a conta for bloqueada
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
    return Promise.reject(error);
  }
);

export default api;
