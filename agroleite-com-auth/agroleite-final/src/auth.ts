import { AppUser, UserRole } from './types';

const TOKEN_KEY = 'agro_jwt_token';
const USER_KEY = 'agro_user';
const API_URL = 'http://localhost:3001'; // Ajustado para 3001

export async function login(
  email: string,
  password: string
): Promise<{ success: boolean; user?: AppUser; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { success: false, error: 'Credenciais inválidas.' };
      }
      return { success: false, error: 'Erro ao fazer login. Tente novamente mais tarde.' };
    }

    const data = await response.json();
    const { access_token, user } = data;

    // Salvar token e dados do usuário logado
    localStorage.setItem(TOKEN_KEY, access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    return { success: true, user };
  } catch (error) {
    console.error('Erro na requisição de login:', error);
    return { success: false, error: 'Erro de conexão com o servidor.' };
  }
}

export function getCurrentUser(): AppUser | null {
  const token = localStorage.getItem(TOKEN_KEY);
  const userRaw = localStorage.getItem(USER_KEY);
  
  if (!token || !userRaw) return null;

  try {
    const user = JSON.parse(userRaw) as AppUser;
    return user;
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

export async function initAuth(): Promise<void> {
  // Inicialização pode ser vazia
}

export function getUsers(): AppUser[] {
  // Retorna array vazio ou mock para não quebrar a tela de AdminPanel
  return [];
}

export async function createUser(params: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  farmName?: string;
}): Promise<{ success: boolean; error?: string; user?: AppUser }> {
  return { success: false, error: 'Criação de usuários deve ser feita no backend.' };
}

export function toggleUserActive(userId: string): void {
  // Fictício
}

export function deleteUser(userId: string): void {
  // Fictício
}

export async function changePassword(
  userId: string,
  newPassword: string
): Promise<void> {
  // Fictício
}
