import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { AdminModule } from './admin/admin.module';

import { AnimalsModule } from './animals/animals.module';
import { ProductionsModule } from './productions/productions.module';
import { HealthModule } from './health/health.module';
import { FarmConfigModule } from './farm-config/farm-config.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    AdminModule,
    AnimalsModule,
    ProductionsModule,
    HealthModule,
    FarmConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
