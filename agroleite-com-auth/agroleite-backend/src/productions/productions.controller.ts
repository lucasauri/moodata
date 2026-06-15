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
import { ProductionsService } from './productions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateProductionDto } from './dto/create-production.dto';

@UseGuards(JwtAuthGuard)
@Controller('productions')
export class ProductionsController {
  constructor(private productionsService: ProductionsService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.productionsService.findAll(req.user.sub);
  }

  @Post()
  create(@Request() req: any, @Body() body: CreateProductionDto) {
    return this.productionsService.create(req.user.sub, body);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.productionsService.remove(req.user.sub, id);
  }
}

