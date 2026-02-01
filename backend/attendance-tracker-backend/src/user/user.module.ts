import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { UserService } from './user.service.js';
import { UserResolver } from './user.resolver.js';



@Module({
  imports:[PrismaModule],
  providers: [UserService, UserResolver]
})
export class UserModule {}
