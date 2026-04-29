import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  // Usuário mockado. No mundo real, usaríamos um repositório (ex: TypeORM/Prisma)
  // A senha aqui é o hash de 'admin123'
  private readonly users = [
    {
      id: 'admin-001',
      name: 'Administrador',
      email: 'admin@agroleite.com',
      passwordHash: '$2b$10$PjeLNs4Ih16EklNS8vw59OnBsKMnrHfJrQfAux96dRo1bTrYvJYqi', // Hash de 'admin123'
      role: 'admin',
      active: true,
      farmName: 'AgroLeite',
      createdAt: new Date().toISOString(),
    },
  ];

  constructor(private jwtService: JwtService) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (user && user.active) {
      const isMatch = await bcrypt.compare(pass, user.passwordHash);
      if (isMatch) {
        const { passwordHash, ...result } = user;
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
}
