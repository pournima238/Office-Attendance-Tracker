import { Field, InputType } from "@nestjs/graphql";
import { AttendanceType } from "../generated/prisma/client.js";

@InputType()
export class AttendanceInput {
  @Field()
  date: string;

  @Field(() => AttendanceType)
  type: AttendanceType;
}