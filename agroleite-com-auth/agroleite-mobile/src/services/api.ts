import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const TOKEN_KEY = '@agro_jwt_token';

const api = axios.create({
  // IMPORTANTE: Este é o IP da sua máquina na rede Wi-Fi. 
  // Emuladores ou celulares reais não acessam o backend via 'localhost'.
  baseURL: 'http://192.168.53.68:3001',
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
