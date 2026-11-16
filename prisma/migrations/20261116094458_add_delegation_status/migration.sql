-- CreateEnum
CREATE TYPE "DelegationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- AlterTable
ALTER TABLE "Delegation" ADD COLUMN     "status" "DelegationStatus" NOT NULL DEFAULT 'PENDING';
