import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

    const body = await req.json()
    const { plan } = body

    const doctor = await prisma.doctorProfile.findUnique({
      where: { userId: session.user.id },
      include: { user: true }
    })
    if (!doctor) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 })

    const amount = plan === "PRO" ? 10000 : 25000 
    const transactionId = `MEDI-${doctor.id}-${Date.now()}`

    // ⚠️ NOUVELLES VARIABLES POUR LA V1
    const cinetpayToken = process.env.CINETPAY_TOKEN // Le Jeton Bearer (JWT)

    if (!cinetpayToken) {
      return NextResponse.json({ error: "Jeton CinetPay manquant dans le .env" }, { status: 500 })
    }

    // Appel à la NOUVELLE API CinetPay (v1)
    const cinetpayRes = await fetch("https://api.cinetpay.co/v1/payment", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${cinetpayToken}` // ✨ Nouveau système d'authentification
      },
      body: JSON.stringify({
        merchant_transaction_id: transactionId, // Le nom du champ a changé
        amount: amount,
        currency: "XOF",
        designation: `Abonnement MediSuivi - Forfait ${plan}`, // 'description' devient 'designation'
        success_url: `${process.env.APP_URL || 'http://localhost:3000'}/dashboard/compte?payment=success`,
        notify_url: `${process.env.APP_URL || 'http://localhost:3000'}/api/payments/webhook`,
        // Les infos client sont optionnelles mais recommandées
        customer_email: doctor.user.email,
        customer_name: "Medecin"
      })
    })

    const cinetpayData = await cinetpayRes.json()

    // La structure de la réponse a aussi changé
    if (cinetpayData.payment_url) {
      return NextResponse.json({ paymentUrl: cinetpayData.payment_url })
    } else {
      console.error("Erreur CinetPay:", cinetpayData)
      return NextResponse.json({ error: "CinetPay a refusé la transaction." }, { status: 400 })
    }

  } catch (error) {
    console.error("🔥 ERREUR API CINETPAY:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
