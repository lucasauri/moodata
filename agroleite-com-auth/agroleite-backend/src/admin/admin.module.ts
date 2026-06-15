import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../auth/roles.guard';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AdminController],
  providers: [RolesGuard],
})
export class AdminModule {}
