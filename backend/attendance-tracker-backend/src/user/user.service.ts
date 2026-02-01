import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';


@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  createUser(email: string, name: string, password:string) {
    return this.prisma.user.create({
      data: { email, name ,password},
    });
  }

  findAll() {
    return this.prisma.user.findMany();
  }
}
