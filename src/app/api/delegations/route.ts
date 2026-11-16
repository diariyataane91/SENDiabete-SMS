import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logAudit } from "@/lib/audit"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

    const doctor = await prisma.doctorProfile.findUnique({ where: { userId: session.user.id } })
    if (!doctor) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 })

    const body = await req.json()
    const { delegateeEmail, endsAt } = body

    const confrereUser = await prisma.user.findUnique({
      where: { email: delegateeEmail },
      include: { doctorProfile: true }
    })

    if (!confrereUser || !confrereUser.doctorProfile) {
      return NextResponse.json({ error: "Médecin introuvable" }, { status: 404 })
    }
    
    if (confrereUser.doctorProfile.status !== "VERIFIED") {
      return NextResponse.json({ error: "Ce médecin n'est pas encore validé par l'administration." }, { status: 400 })
    }

    if (confrereUser.id === session.user.id) {
      return NextResponse.json({ error: "Vous ne pouvez pas vous déléguer à vous-même." }, { status: 400 })
    }

    await prisma.delegation.create({
      data: {
        delegatorId: doctor.id,
        delegateeId: confrereUser.doctorProfile.id,
        startsAt: new Date(),
        endsAt: new Date(endsAt)
      }
    })

    // ✨ Enregistrement dans les logs
    await logAudit(session.user.id, "DELEGATION_CREATE", "Delegation", confrereUser.id, `Délégation vers ${delegateeEmail}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}