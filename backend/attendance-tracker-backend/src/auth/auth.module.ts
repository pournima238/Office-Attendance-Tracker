import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthService } from './auth.service.js';
import { AuthResolver } from './auth.resolver.js';


@Module({
  imports: [
    PrismaModule,
    PassportModule,
    // PASTE IT HERE:
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'SUPER_KEY',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, AuthResolver],
  exports: [AuthService], // Export if other modules need to use AuthService
})
export class AuthModule {}