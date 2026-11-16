-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('LOGIN', 'PATIENT_READ', 'PATIENT_CREATE', 'MEASURE_CREATE', 'ORDONNANCE_CREATE', 'DELEGATION_CREATE', 'DELEGATION_ACCEPT', 'SMS_SEND', 'DOCTOR_VERIFIED');

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "metadata" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
