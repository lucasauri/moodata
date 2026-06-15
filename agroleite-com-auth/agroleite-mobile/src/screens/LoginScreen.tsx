import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { TOKEN_KEY } from '../services/api';

interface Props {
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onLoginSuccess }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Erro', 'Preencha e-mail e senha.');
      return;
    }

    setLoading(true);
    try {
      console.log(`[Login] Tentando conectar em: ${api.defaults.baseURL}/auth/login`);
      const response = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });
      const { access_token } = response.data;

      // Salva o token no celular
      await AsyncStorage.setItem(TOKEN_KEY, access_token);

      // Redireciona para o aplicativo
      onLoginSuccess();
    } catch (error: any) {
      console.log('[Login] Erro:', error.message);
      console.log('[Login] Response:', error.response?.status, error.response?.data);

      let msg = 'Erro ao entrar.';
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network')) {
        msg = `Sem conexão com o servidor.\n\nVerifique se o backend está rodando em:\n${api.defaults.baseURL}`;
      } else if (error.response?.status === 401) {
        msg = 'E-mail ou senha incorretos.';
      } else if (error.response?.data?.message) {
        msg = typeof error.response.data.message === 'string'
          ? error.response.data.message
          : 'Credenciais inválidas.';
      }

      Alert.alert('Falha no Login', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🐄</Text>
          <Text style={styles.logoText}>MooData</Text>
          <Text style={styles.subtitle}>Gestão Leiteira Inteligente</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            placeholderTextColor="#94a3b8"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
            returnKeyType="next"
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Digite sua senha"
            placeholderTextColor="#94a3b8"
            secureTextEntry={true}
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="password"
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.serverInfo}>
            Servidor: {api.defaults.baseURL}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#15803d',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -1,
  },
  subtitle: {
    color: '#bbf7d0',
    fontSize: 15,
    marginTop: 4,
    fontWeight: '500',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#16a34a',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  serverInfo: {
    textAlign: 'center',
    fontSize: 10,
    color: '#cbd5e1',
    marginTop: 16,
  },
});
