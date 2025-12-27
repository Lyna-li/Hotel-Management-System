import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private prisma: PrismaService) {}

  // Validate email + password
  async validateUser(email: string, password: string) {
    const user = await this.getUserByEmailForAuth(email);
    if (!user) throw new Error('Invalid credentials');

    const match = await bcrypt.compare(password, user.mot_de_passe);
    if (!match) throw new Error('Invalid credentials');

    return user; // return the user object for internal use
  }

  // You can still hash password before creating/updating
  async hashPassword(password: string) {
    if (password.length < 8)
      throw new Error('Password must be at least 8 chars');
    return bcrypt.hash(password, 10);
  }
  async getUserByEmailForAuth(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id_user: true,
        email: true,
        mot_de_passe: true,
        role: true,
      },
    });
  }
}
