import { BadRequestException } from '@nestjs/common';

export type ReproductionEventType =
  | 'birth'
  | 'calving'
  | 'drying'
  | 'insemination'
  | 'coverage'
  | 'pregnancy_diagnosis'
  | 'sale'
  | 'death';

export function validateAnimalState(category: string, status: string): void {
  if (category === 'heifer' && status === 'lactation') {
    throw new BadRequestException('Uma novilha não pode estar em lactação.');
  }
}

export function applyCalvingTransition(
  category: string,
  lastCalving: Date | string,
): { category: 'cow'; status: 'lactation'; lastCalving: Date } {
  const parsedDate = typeof lastCalving === 'string' ? new Date(lastCalving) : lastCalving;

  if (Number.isNaN(parsedDate.getTime())) {
    throw new BadRequestException('Data do parto inválida.');
  }

  return {
    category: 'cow',
    status: 'lactation',
    lastCalving: parsedDate,
  };
}

export function applyMovementTransition(
  type: ReproductionEventType,
  currentStatus: string,
  date: Date | string,
): Record<string, string | Date | null> {
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(parsedDate.getTime())) {
    throw new BadRequestException('Data da movimentação inválida.');
  }

  if (currentStatus === 'dead' && type !== 'death') {
    throw new BadRequestException('Não é possível registrar movimentações para um animal morto.');
  }

  switch (type) {
    case 'calving':
      return { category: 'cow', status: 'lactation', lastCalving: parsedDate, expectedCalving: null, dryingDate: null };
    case 'birth':
      return { category: 'heifer', status: 'dry', birthDate: parsedDate };
    case 'drying':
      return { status: 'dry', dryingDate: parsedDate };
    case 'insemination':
    case 'coverage':
      return { lastInsemination: parsedDate, status: 'pregnant' };
    case 'pregnancy_diagnosis':
      return { status: 'pregnant' };
    case 'sale':
      return { status: 'sold' };
    case 'death':
      return { status: 'dead' };
    default:
      return {};
  }
}

export function applyInseminationTransition(
  status: string,
  nextStatus: string,
): string {
  if (status === 'dead') {
    throw new BadRequestException('Não é possível alterar o status de um animal morto.');
  }

  return nextStatus;
}
