import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AnimalsService } from './animals.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('animals')
export class AnimalsController {
  constructor(private animalsService: AnimalsService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.animalsService.findAll(req.user.sub);
  }

  @Post()
  create(@Request() req: any, @Body() body: any) {
    return this.animalsService.create(req.user.sub, body);
  }

  @Patch(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    return this.animalsService.update(req.user.sub, id, body);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.animalsService.remove(req.user.sub, id);
  }
}
