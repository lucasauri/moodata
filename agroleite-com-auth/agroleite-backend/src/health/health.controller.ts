import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { HealthService } from './health.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('health')
export class HealthController {
  constructor(private healthService: HealthService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.healthService.findAll(req.user.sub);
  }

  @Post()
  create(@Request() req: any, @Body() body: any) {
    return this.healthService.create(req.user.sub, body);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.healthService.remove(req.user.sub, id);
  }
}
