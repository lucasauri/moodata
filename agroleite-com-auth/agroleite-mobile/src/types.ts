export type UserRole = 'admin' | 'user';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  farmName?: string;
  active: boolean;
}

export interface Animal {
  id: string;
  tag: string;
  name?: string;
  breed: string;
  category: 'cow' | 'heifer';
  status: 'lactation' | 'pregnant' | 'dry' | 'pre-calving' | 'sick';
  dailyTarget: number;
  lastCalving?: string;
  expectedCalving?: string;
  dryingDate?: string;
  weight?: number;
  ecc?: number;
  userId: string;
}
