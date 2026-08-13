-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'EMPLOYEE_NOTIFIED', 'ACTION_IN_PROGRESS', 'COMPLETED', 'CLOSED');

-- CreateTable
CREATE TABLE "Case" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "violationId" INTEGER NOT NULL,
    "offenseNumber" INTEGER NOT NULL,
    "action" "Action" NOT NULL,
    "status" "CaseStatus" NOT NULL DEFAULT 'DRAFT',

    CONSTRAINT "Case_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_violationId_fkey" FOREIGN KEY ("violationId") REFERENCES "Violation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
