import { ObjectType, Field, Int } from '@nestjs/graphql';
import { AttendanceType } from 'generated/prisma/enums.js';
@ObjectType()
export class Attendance {
  @Field(() => Int)
  id: number;

  @Field()
  date: Date;

  @Field(() => AttendanceType)
  type: AttendanceType;

  @Field(() => Int)
  userId: number;
}