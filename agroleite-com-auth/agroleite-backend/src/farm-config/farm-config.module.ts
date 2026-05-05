import { Module } from '@nestjs/common';
import { FarmConfigController } from './farm-config.controller';
import { FarmConfigService } from './farm-config.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FarmConfigController],
  providers: [FarmConfigService],
})
export class FarmConfigModule {}
