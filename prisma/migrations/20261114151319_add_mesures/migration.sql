-- CreateEnum
CREATE TYPE "MeasureType" AS ENUM ('GLYCEMIE', 'TENSION');

-- CreateTable
CREATE TABLE "Mesure" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "type" "MeasureType" NOT NULL,
    "valeurGlycemie" INTEGER,
    "systolique" INTEGER,
    "diastolique" INTEGER,
    "measuredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mesure_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Mesure" ADD CONSTRAINT "Mesure_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
