import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { logAudit } from "@/lib/audit"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

    const body = await req.json()
    const { oldPassword, newPassword } = body

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Le nouveau mot de passe doit faire au moins 6 caractères" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 })

    // Vérification de l'ancien mot de passe
    const isPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash)
    if (!isPasswordValid) {
      return NextResponse.json({ error: "L'ancien mot de passe est incorrect" }, { status: 400 })
    }

    // Hachage du nouveau mot de passe
    const newPasswordHash = await bcrypt.hash(newPassword, 10)

    // Mise à jour
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash }
    })

    // Log d'audit
    await logAudit(session.user.id, "LOGIN", "User", user.id, "Changement de mot de passe")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur changement MDP:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}