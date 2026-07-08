import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Proteção contra brute-force: máx 5 tentativas de login por minuto
  @Throttle([{ ttl: 60000, limit: 5 }])
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() signInDto: LoginDto) {
    const user = await this.authService.validateUser(
      signInDto.email,
      signInDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    return this.authService.login(user);
  }

  // Proteção contra spam de contas: máx 3 registros por minuto
  @Throttle([{ ttl: 60000, limit: 3 }])
  @Post('register')
  async register(@Body() createUserDto: RegisterDto) {
    return this.authService.register(createUserDto);
  }
}

