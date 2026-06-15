import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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

    const event = await this.prisma.healthEvent.create({
      data: {
        animalId: data.animalId,
        type: data.type,
        description: data.description,
        date: data.date ? new Date(data.date) : new Date(),
        nextDoseDate: data.nextDoseDate ? new Date(data.nextDoseDate) : null,
        responsible: data.responsible ?? null,
        withdrawalDays: data.withdrawalDays ?? null,
        userId,
      },
    });

    // Lógica de negócio: morte do animal atualiza seu status automaticamente
    if (data.type === 'death') {
      await this.prisma.animal.update({
        where: { id: data.animalId },
        data: { status: 'dead' },
      });
    }

    return event;
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
