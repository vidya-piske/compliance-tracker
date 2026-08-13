-- CreateEnum
CREATE TYPE "Action" AS ENUM ('FIRST_WARNING', 'FINAL_WRITTEN_WARNING', 'SUSPENSION_3_DAYS', 'SUSPENSION_5_DAYS', 'DISMISSAL');

-- CreateTable
CREATE TABLE "Rule" (
    "id" SERIAL NOT NULL,
    "violationId" INTEGER NOT NULL,
    "offenseNumber" INTEGER NOT NULL,
    "action" "Action" NOT NULL,

    CONSTRAINT "Rule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Rule" ADD CONSTRAINT "Rule_violationId_fkey" FOREIGN KEY ("violationId") REFERENCES "Violation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
