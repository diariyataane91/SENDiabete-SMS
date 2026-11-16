import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { encrypt } from "@/lib/crypto"
import { logAudit } from "@/lib/audit"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: session.user.id }
    })
    if (!doctorProfile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 })

    const body = await req.json()
    const { content } = body

    if (!content) return NextResponse.json({ error: "Le contenu est requis" }, { status: 400 })

    const contentEnc = encrypt(content)

    const ordonnance = await prisma.ordonnance.create({
      data: {
        patientId: params.id,
        doctorId: doctorProfile.id,
        contentEnc
      }
    })

    // ✨ Enregistrement dans les logs
    await logAudit(session.user.id, "ORDONNANCE_CREATE", "Patient", params.id, `Création d'une ordonnance`)

    return NextResponse.json({ success: true, ordonnanceId: ordonnance.id })
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}