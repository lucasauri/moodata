import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductionDto } from './dto/create-production.dto';

@Injectable()
export class ProductionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.milkProduction.findMany({
      where: { userId },
      include: { animal: true },
      orderBy: { date: 'desc' },
    });
  }

  async create(userId: string, data: CreateProductionDto) {
    // Verificar se o animal pertence ao usuário logado (segurança multi-tenant)
    const animal = await this.prisma.animal.findFirst({
      where: { id: data.animalId, userId },
    });
    if (!animal) {
      throw new NotFoundException('Animal não encontrado para este usuário.');
    }

    return this.prisma.milkProduction.create({
      data: {
        animalId: data.animalId,
        amount: data.amount,
        date: data.date ? new Date(data.date) : new Date(),
        period: data.period,
        quality: data.quality,
        destination: data.destination,
        observation: data.observation ?? null,
        userId,
      },
    });
  }

  async remove(userId: string, id: string) {
    const prod = await this.prisma.milkProduction.findFirst({
      where: { id, userId },
    });
    if (!prod) throw new NotFoundException('Produção não encontrada');

    await this.prisma.milkProduction.delete({ where: { id } });
    return { success: true };
  }
}
