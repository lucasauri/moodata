import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { applyMovementTransition, ReproductionEventType } from '../animals/animal-reproduction';
import { CreateHealthEventDto } from './dto/create-health-event.dto';

@Injectable()
export class HealthService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.healthEvent.findMany({
      where: { userId },
      include: { animal: true },
      orderBy: { date: 'desc' },
    });
  }

  async create(userId: string, data: CreateHealthEventDto) {
    // Verificar se o animal pertence ao usuário logado (segurança multi-tenant)
    const animal = await this.prisma.animal.findFirst({
      where: { id: data.animalId, userId },
    });
    if (!animal) {
      throw new NotFoundException('Animal não encontrado para este usuário.');
    }

    const eventDate = data.date ? new Date(data.date) : new Date();
    const movementTypes = new Set<ReproductionEventType>([
      'birth', 'calving', 'drying', 'insemination', 'coverage',
      'pregnancy_diagnosis', 'sale', 'death',
    ]);

    return this.prisma.$transaction(async (tx) => {
      const event = await tx.healthEvent.create({
        data: {
          animalId: data.animalId,
          type: data.type,
          description: data.description,
          date: eventDate,
          nextDoseDate: data.nextDoseDate ? new Date(data.nextDoseDate) : null,
          responsible: data.responsible ?? null,
          withdrawalDays: data.withdrawalDays ?? null,
          userId,
        },
      });

      if (movementTypes.has(data.type as ReproductionEventType)) {
        const state = applyMovementTransition(
          data.type as ReproductionEventType,
          animal.status,
          eventDate,
        );
        await tx.animal.update({ where: { id: data.animalId }, data: state });
      }

      return event;
    });
  }

  async remove(userId: string, id: string) {
    const event = await this.prisma.healthEvent.findFirst({
      where: { id, userId },
    });
    if (!event) throw new NotFoundException('Evento de saúde não encontrado');

    await this.prisma.healthEvent.delete({ where: { id } });
    return { success: true };
  }
}
