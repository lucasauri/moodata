import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { applyCalvingTransition, validateAnimalState } from './animal-reproduction';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';

@Injectable()
export class AnimalsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.animal.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(userId: string, data: CreateAnimalDto) {
    validateAnimalState(data.category, data.status);

    return this.prisma.animal.create({
      data: {
        name: data.name ?? '',
        tag: data.tag,
        breed: data.breed,
        category: data.category,
        status: data.status,
        dailyTarget: data.dailyTarget ?? 0,
        weight: data.weight ?? null,
        ecc: data.ecc ?? null,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        lastInsemination: data.lastInsemination ? new Date(data.lastInsemination) : null,
        lastCalving: data.lastCalving ? new Date(data.lastCalving) : null,
        expectedCalving: data.expectedCalving ? new Date(data.expectedCalving) : null,
        dryingDate: data.dryingDate ? new Date(data.dryingDate) : null,
        geneticLine: data.geneticLine ?? null,
        origin: data.origin ?? null,
        sireName: data.sireName ?? null,
        damName: data.damName ?? null,
        fatherTag: data.fatherTag ?? null,
        motherTag: data.motherTag ?? null,
        registrationCode: data.registrationCode ?? null,
        userId,
      },
    });
  }

  async update(userId: string, id: string, data: UpdateAnimalDto) {
    const animal = await this.ensureOwnership(userId, id);

    const category = data.category !== undefined ? data.category : animal.category;
    const status = data.status !== undefined ? data.status : animal.status;

    validateAnimalState(category, status);

    return this.prisma.animal.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.tag !== undefined && { tag: data.tag }),
        ...(data.breed !== undefined && { breed: data.breed }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.dailyTarget !== undefined && { dailyTarget: data.dailyTarget }),
        ...(data.weight !== undefined && { weight: data.weight ?? null }),
        ...(data.ecc !== undefined && { ecc: data.ecc ?? null }),
        ...(data.birthDate !== undefined && { birthDate: data.birthDate ? new Date(data.birthDate) : null }),
        ...(data.lastInsemination !== undefined && { lastInsemination: data.lastInsemination ? new Date(data.lastInsemination) : null }),
        ...(data.lastCalving !== undefined && { lastCalving: data.lastCalving ? new Date(data.lastCalving) : null }),
        ...(data.expectedCalving !== undefined && { expectedCalving: data.expectedCalving ? new Date(data.expectedCalving) : null }),
        ...(data.dryingDate !== undefined && { dryingDate: data.dryingDate ? new Date(data.dryingDate) : null }),
        ...(data.geneticLine !== undefined && { geneticLine: data.geneticLine ?? null }),
        ...(data.origin !== undefined && { origin: data.origin ?? null }),
        ...(data.sireName !== undefined && { sireName: data.sireName ?? null }),
        ...(data.damName !== undefined && { damName: data.damName ?? null }),
        ...(data.fatherTag !== undefined && { fatherTag: data.fatherTag ?? null }),
        ...(data.motherTag !== undefined && { motherTag: data.motherTag ?? null }),
        ...(data.registrationCode !== undefined && { registrationCode: data.registrationCode ?? null }),
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.ensureOwnership(userId, id);
    await this.prisma.animal.delete({ where: { id } });
    return { success: true };
  }

  private async ensureOwnership(userId: string, id: string) {
    const animal = await this.prisma.animal.findFirst({
      where: { id, userId },
    });
    if (!animal) throw new NotFoundException('Animal não encontrado');
    return animal;
  }
}
