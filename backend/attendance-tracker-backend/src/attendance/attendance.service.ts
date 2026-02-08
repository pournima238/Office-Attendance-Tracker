import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AttendanceType } from 'generated/prisma/enums.js';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}
async logAttendance(userId: number, type: 'OFFICE' | 'WFH', dateInput: string) {
  const normalizedDate = new Date(dateInput);
  normalizedDate.setHours(0, 0, 0, 0); 

  return this.prisma.attendance.upsert({
    where: {
      userId_date: { 
        userId, 
        date: normalizedDate 
      },
    },
    update: { type }, 
    create: {
      userId,
      type,
      date: normalizedDate,
    },
  });
}

async getMonthlyAttendance(userId: number, month: number, year: number) {
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);
    return this.prisma.attendance.findMany({
      where: {
        userId: userId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      orderBy: { date: 'asc' },
    });
  }

async bulkLogAttendance(userId: number, records: { date: string; type: AttendanceType}[]) {
  return this.prisma.$transaction(
    records.map((record) => {
      const normalizedDate = new Date(record.date);
      normalizedDate.setHours(0, 0, 0, 0);
      return this.prisma.attendance.upsert({
        where: {
          userId_date: { userId, date: normalizedDate },
        },
        update: { type: record.type },
        create: {
          userId,
          type: record.type,
          date: normalizedDate,
        },
      });
    }),
  );
}
}