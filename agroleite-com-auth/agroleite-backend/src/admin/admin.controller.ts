import {
  Controller,
  Get,
  Delete,
  Patch,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private prisma: PrismaService) {}

  /** Lista todos os usuários (somente admins) */
  @Get('users')
  async listUsers(@Request() req: any) {
    if (req.user.role !== 'admin')
      throw new ForbiddenException('Acesso negado');

    const users = await this.prisma.user.findMany({
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
    return users;
  }

  /** Alterna o status active de um usuário */
  @Patch('users/:id/toggle')
  async toggleUser(@Param('id') id: string, @Request() req: any) {
    if (req.user.role !== 'admin')
      throw new ForbiddenException('Acesso negado');
    if (req.user.sub === id)
      throw new ForbiddenException('Você não pode bloquear a si mesmo');

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new ForbiddenException('Usuário não encontrado');

    const updated = await this.prisma.user.update({
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
    return updated;
  }

  /** Remove um usuário */
  @Delete('users/:id')
  async deleteUser(@Param('id') id: string, @Request() req: any) {
    if (req.user.role !== 'admin')
      throw new ForbiddenException('Acesso negado');
    if (req.user.sub === id)
      throw new ForbiddenException('Você não pode remover a si mesmo');

    await this.prisma.user.delete({ where: { id } });
    return { success: true };
  }
}
