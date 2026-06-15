import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorator que marca um controller ou rota com os roles necessários para acesso.
 * Use em conjunto com o RolesGuard.
 *
 * @example
 * @Roles('admin')
 * @UseGuards(JwtAuthGuard, RolesGuard)
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
