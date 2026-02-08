import { Resolver, Query,Mutation, Args, Context, registerEnumType, Int, InputType, Field, ObjectType} from '@nestjs/graphql';
import { AttendanceService } from './attendance.service.js';
import { GqlAuthGuard } from '../auth/gql-auth.guard.js';
import { UseGuards } from '@nestjs/common';
import { AttendanceType } from '../generated/prisma/client.js';

registerEnumType(AttendanceType, {
  name: 'AttendanceType', 
});

@InputType()
export class AttendanceInput {
  @Field()
  date: string;

  @Field(() => AttendanceType)
  type: AttendanceType;
}

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

@Resolver()
export class AttendanceResolver {
  constructor(private attendanceService: AttendanceService) {}

@Mutation(() => String)
@UseGuards(GqlAuthGuard)
async markAttendance(
  @Args('type') type: 'OFFICE' | 'WFH',
  @Args('date') date: string, 
  @Context() context: any
) {
  const userId = context.req.user.userId;
  await this.attendanceService.logAttendance(userId, type, date);
  return `Attendance updated for ${date}`;
}


@Mutation(() => String)
  @UseGuards(GqlAuthGuard)
  async saveMonthlyAttendance(
    @Args({ name: 'data', type: () => [AttendanceInput] }) data: AttendanceInput[],
    @Context() context: any,
  ) {
    const userId = context.req.user.userId;
    await this.attendanceService.bulkLogAttendance(userId, data);
    return `Successfully updated ${data.length} records.`;
  }
  
@Query(() => [Attendance])
  @UseGuards(GqlAuthGuard)
  async getMyAttendance(
    @Args('month', { type: () => Int }) month: number,
    @Args('year', { type: () => Int }) year: number,
    @Context() context: any,
  ) {
    // Extract userId from the decoded JWT payload
    const userId = context.req.user.userId;
    
    // Delegate the database logic to the service
    return this.attendanceService.getMonthlyAttendance(userId, month, year);
  }

}