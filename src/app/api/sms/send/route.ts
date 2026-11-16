import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logAudit } from "@/lib/audit"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!doctorProfile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 })

    if (doctorProfile.smsUsedThisMonth >= doctorProfile.smsQuotaMonthly) {
      return NextResponse.json({ error: "Quota SMS atteint pour ce mois. Utilisez WhatsApp." }, { status: 403 })
    }

    const body = await req.json()
    const { phone, message } = body

    const lamLogin = process.env.LAM_SMS_LOGIN
    const lamPassword = process.env.LAM_SMS_PASSWORD
    const lamSender = process.env.LAM_SMS_SENDER_ID || "SEN'DIABETE"

    if (!lamLogin || !lamPassword) {
      return NextResponse.json({ error: "Configuration SMS Push manquante sur le serveur." }, { status: 500 })
    }

    const response = await fetch("https://api.lafricamobile.com/api/v1/sms/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        login: lamLogin,
        password: lamPassword,
        sender: lamSender,
        to: phone,
        message: message
      })
    })

    if (!response.ok) {
      const lamError = await response.text()
      console.error("Erreur LAfricaMobile:", lamError)
      return NextResponse.json({ error: "Échec de l'envoi via l'opérateur." }, { status: 500 })
    }

    await prisma.doctorProfile.update({
      where: { id: doctorProfile.id },
      data: { smsUsedThisMonth: { increment: 1 } }
    })

    // ✨ Enregistrement dans les logs
    await logAudit(session.user.id, "SMS_SEND", "Patient", phone, `SMS envoyé au ${phone}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur serveur SMS:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}