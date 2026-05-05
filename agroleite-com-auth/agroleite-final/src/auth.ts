import { AppUser, UserRole } from './types';
import api from './services/api';

const TOKEN_KEY = 'agro_jwt_token';
const USER_KEY = 'agro_user';

export async function login(
  email: string,
  password: string
): Promise<{ success: boolean; user?: AppUser; error?: string }> {
  try {
    const response = await api.post('/auth/login', { email, password });
    const { access_token, user } = response.data;
    localStorage.setItem(TOKEN_KEY, access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return { success: true, user };
  } catch (error: any) {
    console.error('Erro na requisição de login:', error);
    if (error.response && error.response.status === 401) {
      return { success: false, error: 'Credenciais inválidas.' };
    }
    return { success: false, error: 'Erro de conexão com o servidor.' };
  }
}

export function getCurrentUser(): AppUser | null {
  const token = localStorage.getItem(TOKEN_KEY);
  const userRaw = localStorage.getItem(USER_KEY);
  if (!token || !userRaw) return null;
  try {
    return JSON.parse(userRaw) as AppUser;
  } catch {
    return null;
  }
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function userKey(userId: string, key: string): string {
  return `agro_${userId}_${key}`;
}

export async function initAuth(): Promise<void> {}

/** Busca todos os usuários do backend (somente admin) */
export async function getUsers(): Promise<AppUser[]> {
  try {
    const response = await api.get('/admin/users');
    return response.data;
  } catch {
    return [];
  }
}

export async function createUser(params: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  farmName?: string;
}): Promise<{ success: boolean; error?: string; user?: AppUser }> {
  try {
    const response = await api.post('/auth/register', params);
    return { success: true, user: response.data };
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || 'Erro ao criar usuário.';
    return { success: false, error: errorMsg };
  }
}

/** Alterna o status active de um usuário */
export async function toggleUserActive(userId: string): Promise<void> {
  try {
    await api.patch(`/admin/users/${userId}/toggle`);
  } catch (error: any) {
    console.error('Erro ao alternar status:', error);
  }
}

/** Remove um usuário */
export async function deleteUser(userId: string): Promise<void> {
  try {
    await api.delete(`/admin/users/${userId}`);
  } catch (error: any) {
    console.error('Erro ao remover usuário:', error);
  }
}

export async function changePassword(
  userId: string,
  newPassword: string
): Promise<void> {
  // Implementar se necessário
}

