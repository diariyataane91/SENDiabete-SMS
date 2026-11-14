-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "lastNameEnc" TEXT NOT NULL,
    "firstNameEnc" TEXT NOT NULL,
    "phoneE164" TEXT NOT NULL,
    "referentDoctorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Patient_phoneE164_key" ON "Patient"("phoneE164");

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_referentDoctorId_fkey" FOREIGN KEY ("referentDoctorId") REFERENCES "DoctorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
