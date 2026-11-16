import { prisma } from "@/lib/prisma"

export async function logAudit(
  actorId: string,
  action: "LOGIN" | "PATIENT_READ" | "PATIENT_CREATE" | "MEASURE_CREATE" | "ORDONNANCE_CREATE" | "DELEGATION_CREATE" | "DELEGATION_ACCEPT" | "SMS_SEND" | "DOCTOR_VERIFIED",
  targetType?: string,
  targetId?: string,
  metadata?: string
) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId,
        action,
        targetType,
        targetId,
        metadata,
      }
    })
  } catch (error) {
    console.error("Erreur d'écriture du log d'audit:", error)
  }
}