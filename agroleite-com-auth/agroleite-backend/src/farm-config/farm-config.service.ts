import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FarmConfigService {
  constructor(private prisma: PrismaService) {}

  async findOne(userId: string) {
    let config = await this.prisma.farmConfig.findUnique({
      where: { userId },
    });

    // Se não existir, cria um padrão
    if (!config) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      config = await this.prisma.farmConfig.create({
        data: {
          userId,
          name: user?.farmName || 'Minha Fazenda',
          producer: user?.name || '',
          location: '',
        },
      });
    }

    return config;
  }

  async update(userId: string, data: any) {
    return this.prisma.farmConfig.upsert({
      where: { userId },
      update: data,
      create: { ...data, userId },
    });
  }
}
