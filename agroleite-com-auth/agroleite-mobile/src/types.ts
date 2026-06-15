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
  birthDate?: string;
  category: 'cow' | 'heifer';
  status: 'lactation' | 'pregnant' | 'dry' | 'pre-calving' | 'sick' | 'dead';
  dailyTarget?: number;
  lastCalving?: string;
  lastInsemination?: string;
  expectedCalving?: string;
  dryingDate?: string;
  weight?: number;
  ecc?: number;
  userId: string;
}

export interface MilkProduction {
  id: string;
  animalId: string;
  date: string;
  amount: number;
  period: 'morning' | 'afternoon' | 'night';
  quality: 'good' | 'regular' | 'low';
  destination: 'tank' | 'calves' | 'internal' | 'disposal';
  observation?: string;
}

export interface HealthEvent {
  id: string;
  animalId: string;
  date: string;
  nextDoseDate?: string;
  type: 'vaccine' | 'medication' | 'insemination' | 'checkup' | 'calving' | 'birth' | 'purchase' | 'death';
  description: string;
  responsible?: string;
  withdrawalDays?: number;
}

export interface FarmConfig {
  name: string;
  producer: string;
  location: string;
  pveDays: number;
  dryingPeriodDays: number;
}
