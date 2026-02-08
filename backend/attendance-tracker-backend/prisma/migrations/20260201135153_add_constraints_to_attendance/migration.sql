/*
  Warnings:

  - You are about to drop the column `isPresent` on the `Attendance` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,date]` on the table `Attendance` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AttendanceType" AS ENUM ('OFFICE', 'WFH');

-- AlterTable
ALTER TABLE "Attendance" DROP COLUMN "isPresent",
ADD COLUMN     "type" "AttendanceType" NOT NULL DEFAULT 'WFH';

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_userId_date_key" ON "Attendance"("userId", "date");
