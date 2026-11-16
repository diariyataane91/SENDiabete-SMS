import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { decrypt } from "@/lib/crypto"

export async function GET(req: Request, { params }: { params: { id: string, ordonnanceId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

    const ordonnance = await prisma.ordonnance.findUnique({
      where: { id: params.ordonnanceId },
      include: {
        patient: true,
        doctor: true
      }
    })

    if (!ordonnance) return NextResponse.json({ error: "Ordonnance introuvable" }, { status: 404 })

    const doctorName = `${decrypt(ordonnance.doctor.firstNameEnc)} ${decrypt(ordonnance.doctor.lastNameEnc)}`
    const patientName = `${decrypt(ordonnance.patient.firstNameEnc)} ${decrypt(ordonnance.patient.lastNameEnc)}`
    const content = decrypt(ordonnance.contentEnc)

    return NextResponse.json({
      doctorName,
      patientName,
      patientPhone: ordonnance.patient.phoneE164,
      content,
      issuedAt: ordonnance.issuedAt
    })
  } catch (error) {
    console.error("🔥 ERREUR API ORDONNANCE:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}