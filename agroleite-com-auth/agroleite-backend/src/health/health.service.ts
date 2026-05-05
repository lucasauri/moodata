import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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

  async create(userId: string, data: any) {
    return this.prisma.healthEvent.create({
      data: {
        ...data,
        date: data.date ? new Date(data.date) : new Date(),
        nextDoseDate: data.nextDoseDate ? new Date(data.nextDoseDate) : null,
        withdrawalDays: data.withdrawalDays ? parseFloat(data.withdrawalDays) : null,
        userId,
      },
    });
  }

  async remove(userId: string, id: string) {
    const event = await this.prisma.healthEvent.findFirst({ where: { id, userId } });
    if (!event) throw new NotFoundException('Evento de saúde não encontrado');
    
    await this.prisma.healthEvent.delete({ where: { id } });
    return { success: true };
  }
}
