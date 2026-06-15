import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (user) {
      if (!user.active) {
        throw new UnauthorizedException(
          'Conta bloqueada. Entre em contato com o administrador.',
        );
      }
      const isMatch = await bcrypt.compare(pass, user.password);
      if (isMatch) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }

  async register(data: RegisterDto) {
    const { name, email, password, farmName } = data;
    const role = 'user';

    const existingUser = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new BadRequestException('E-mail já está em uso.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await this.prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role || 'user',
        farmName,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;
    return result;
  }
}
