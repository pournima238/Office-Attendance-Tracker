import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service.js';
import { AttendanceResolver } from './attendance.resolver.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';


@Module({
  imports:[PrismaModule,AuthModule],
  providers: [AttendanceService, AttendanceResolver]
})
export class AttendanceModule {}
