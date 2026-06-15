import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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

  @Post('register')
  async register(@Body() createUserDto: RegisterDto) {
    return this.authService.register(createUserDto);
  }
}
