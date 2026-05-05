import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnimalsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.animal.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(userId: string, data: any) {
    const formattedData = this.formatAnimalData(data);
    return this.prisma.animal.create({
      data: { ...formattedData, userId },
    });
  }

  async update(userId: string, id: string, data: any) {
    await this.ensureOwnership(userId, id);
    const formattedData = this.formatAnimalData(data);
    return this.prisma.animal.update({
      where: { id },
      data: formattedData,
    });
  }

  private formatAnimalData(data: any) {
    const formatted = { ...data };
    
    // Converter datas de string para Date
    const dateFields = ['birthDate', 'lastInsemination', 'lastCalving', 'expectedCalving', 'dryingDate'];
    dateFields.forEach(field => {
      if (formatted[field]) {
        formatted[field] = new Date(formatted[field]);
      } else {
        delete formatted[field]; // Se for vazio/null, deixa o Prisma tratar como nulo ou não atualizar
      }
    });

    // Garantir que números sejam números e não NaN
    if (formatted.dailyTarget !== undefined) formatted.dailyTarget = parseFloat(formatted.dailyTarget) || 0;
    if (formatted.weight !== undefined) formatted.weight = formatted.weight ? parseFloat(formatted.weight) : null;
    if (formatted.ecc !== undefined) formatted.ecc = formatted.ecc ? parseFloat(formatted.ecc) : null;

    return formatted;
  }

  async remove(userId: string, id: string) {
    await this.ensureOwnership(userId, id);
    await this.prisma.animal.delete({ where: { id } });
    return { success: true };
  }

  private async ensureOwnership(userId: string, id: string) {
    const animal = await this.prisma.animal.findFirst({ where: { id, userId } });
    if (!animal) throw new NotFoundException('Animal não encontrado');
    return animal;
  }
}
