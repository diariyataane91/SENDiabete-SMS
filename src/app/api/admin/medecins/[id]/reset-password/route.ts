import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Le mot de passe temporaire qu'on va générer
    const tempPassword = "MediSuivi2024!"
    const passwordHash = await bcrypt.hash(tempPassword, 10)

    // On met à jour l'utilisateur lié à ce profil
    const doctor = await prisma.doctorProfile.findUnique({
      where: { id: params.id }
    })

    if (!doctor) return NextResponse.json({ error: "Médecin introuvable" }, { status: 404 })

    await prisma.user.update({
      where: { id: doctor.userId },
      data: { passwordHash }
    })

    return NextResponse.json({ success: true, tempPassword })
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}