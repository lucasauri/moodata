import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TOKEN_KEY } from './src/services/api';
import LoginScreen from './src/screens/LoginScreen';
import MainTabs from './src/navigation/MainTabs';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      setIsAuthenticated(!!token);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#15803d' }}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        ) : !isAuthenticated ? (
          <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />
        ) : (
          <NavigationContainer>
            <MainTabs onLogout={() => setIsAuthenticated(false)} />
          </NavigationContainer>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
