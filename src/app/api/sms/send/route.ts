import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    // 1. Vérification de l'authentification du médecin
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // 2. Récupération du profil pour vérifier le quota
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!doctorProfile) {
      return NextResponse.json({ error: "Profil introuvable" }, { status: 404 })
    }

    // 3. Vérification stricte du quota mensuel
    if (doctorProfile.smsUsedThisMonth >= doctorProfile.smsQuotaMonthly) {
      return NextResponse.json(
        { error: "Quota SMS atteint pour ce mois. Veuillez utiliser WhatsApp." }, 
        { status: 403 }
      )
    }

    // 4. Récupération des données de la requête
    const body = await req.json()
    const { phone, message } = body

    // 5. Récupération des accès LAMPUSH depuis les variables d'environnement
    const lamLogin = process.env.LAM_SMS_LOGIN
    const lamPassword = process.env.LAM_SMS_PASSWORD
    const lamSender = process.env.LAM_SMS_SENDER_ID || "SEN'DIABETE"

    if (!lamLogin || !lamPassword) {
      return NextResponse.json(
        { error: "Configuration SMS Push manquante sur le serveur." }, 
        { status: 500 }
      )
    }

    // 6. Appel réel à l'API SMS Push de LAfricaMobile
    const response = await fetch("https://api.lafricamobile.com/api/v1/sms/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        login: lamLogin,
        password: lamPassword,
        sender: lamSender,
        to: phone,          // Numéro au format E.164 (ex: +221771234567)
        message: message
      })
    })

    // 7. Gestion des erreurs de l'opérateur
    if (!response.ok) {
      const lamError = await response.text()
      console.error("Erreur LAfricaMobile:", lamError)
      return NextResponse.json(
        { error: "Échec de l'envoi via l'opérateur télécom." }, 
        { status: 500 }
      )
    }

    // 8. Incrémentation du quota SEULEMENT si l'envoi a réussi
    await prisma.doctorProfile.update({
      where: { id: doctorProfile.id },
      data: { smsUsedThisMonth: { increment: 1 } }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Erreur serveur SMS:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" }, 
      { status: 500 }
    )
  }
}