import {
  Controller,
  Get,
  Delete,
  Patch,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Controller de administração — todas as rotas exigem role 'admin'.
 * A verificação é feita de forma declarativa pelo RolesGuard,
 * sem necessidade de if manuais dentro de cada método.
 */
@Roles('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(private prisma: PrismaService) {}

  /** Lista todos os usuários */
  @Get('users')
  async listUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        farmName: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /** Alterna o status active de um usuário */
  @Patch('users/:id/toggle')
  async toggleUser(@Param('id') id: string, @Request() req: any) {
    if (req.user.sub === id) {
      throw new ForbiddenException('Você não pode bloquear a si mesmo.');
    }

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return this.prisma.user.update({
      where: { id },
      data: { active: !user.active },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        farmName: true,
        active: true,
      },
    });
  }

  /** Remove um usuário */
  @Delete('users/:id')
  async deleteUser(@Param('id') id: string, @Request() req: any) {
    if (req.user.sub === id) {
      throw new ForbiddenException('Você não pode remover a si mesmo.');
    }

    await this.prisma.user.delete({ where: { id } });
    return { success: true };
  }
}
