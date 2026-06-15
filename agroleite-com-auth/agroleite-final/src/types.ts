export interface Animal {
  id: string;
  name: string;
  tag: string;
  breed: string;
  birthDate?: string;
  category: 'cow' | 'heifer';
  status: 'lactation' | 'dry' | 'pregnant' | 'sick' | 'pre-calving' | 'dead';
  dailyTarget?: number;
  weight?: number;
  ecc?: number;
  lastInsemination?: string;
  expectedCalving?: string;
  lastCalving?: string;
  dryingDate?: string;
}

export interface MilkProduction {
  id: string;
  animalId: string;
  date: string;
  amount: number;
  period: 'morning' | 'afternoon' | 'night' | 'allday';
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

export type UserRole = 'admin' | 'user';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  farmName?: string;
}
