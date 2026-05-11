import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TOKEN_KEY } from './src/services/api';
import LoginScreen from './src/screens/LoginScreen';
import HerdScreen from './src/screens/HerdScreen';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      // Se existe token, loga direto
      setIsAuthenticated(!!token);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#15803d' }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  // Se tem token -> Tela Rebanho. Se não tem -> Tela de Login
  return isAuthenticated ? (
    <HerdScreen onLogout={() => setIsAuthenticated(false)} />
  ) : (
    <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />
  );
}
