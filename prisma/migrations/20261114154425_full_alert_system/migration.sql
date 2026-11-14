-- AlterTable
ALTER TABLE "DoctorProfile" ADD COLUMN     "smsQuotaMonthly" INTEGER NOT NULL DEFAULT 20,
ADD COLUMN     "smsUsedThisMonth" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Mesure" ADD COLUMN     "alertRaised" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "alertReason" TEXT;

-- CreateTable
CREATE TABLE "Objectif" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "glycemieMax" INTEGER,
    "systoliqueMax" INTEGER,
    "diastoliqueMax" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Objectif_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Objectif" ADD CONSTRAINT "Objectif_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
