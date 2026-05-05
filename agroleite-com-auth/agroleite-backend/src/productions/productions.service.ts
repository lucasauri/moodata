import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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

  async create(userId: string, data: any) {
    const productionDate = data.date ? new Date(data.date) : new Date();
    const amount = parseFloat(data.amount) || 0;

    return this.prisma.milkProduction.create({
      data: {
        ...data,
        amount,
        date: productionDate,
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
