import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

/**
 * Guard que verifica se o usuário autenticado possui o(s) role(s) necessário(s).
 * Deve ser usado APÓS o JwtAuthGuard (que popula req.user).
 *
 * Se nenhum role for exigido pela rota (@Roles não aplicado), o acesso é permitido.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Se nenhum role for exigido, libera o acesso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Acesso negado: permissão insuficiente.');
    }

    return true;
  }
}
