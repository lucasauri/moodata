import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { FarmConfigService } from './farm-config.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateFarmConfigDto } from './dto/update-farm-config.dto';

@UseGuards(JwtAuthGuard)
@Controller('farm-config')
export class FarmConfigController {
  constructor(private farmConfigService: FarmConfigService) {}

  @Get()
  findOne(@Request() req: any) {
    return this.farmConfigService.findOne(req.user.sub);
  }

  @Put()
  update(@Request() req: any, @Body() body: UpdateFarmConfigDto) {
    return this.farmConfigService.update(req.user.sub, body);
  }
}

