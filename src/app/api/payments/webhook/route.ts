import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    // CinetPay envoie les données en x-www-form-urlencoded ou en JSON
    const text = await req.text()
    const params = new URLSearchParams(text)
    
    const transactionId = params.get("cpm_trans_id")
    const status = params.get("cpm_result") // '00' signifie succès chez CinetPay

    if (!transactionId) return NextResponse.json({ error: "Pas de transaction ID" }, { status: 400 })

    // Si le paiement a réussi
    if (status === "00") {
      // On extrait l'ID du médecin depuis notre transactionId (ex: MEDI-cuid-123456789)
      const doctorId = transactionId.split("-")[1]

      const doctor = await prisma.doctorProfile.findUnique({ where: { id: doctorId } })
      
      if (doctor) {
        let newEndsAt = doctor.subscriptionEndsAt || new Date()
        if (newEndsAt < new Date()) newEndsAt = new Date()
        
        // On ajoute 1 mois (ou 12 mois selon le montant, à adapter)
        newEndsAt.setMonth(newEndsAt.getMonth() + 1)

        // Mise à jour de l'abonnement
        await prisma.doctorProfile.update({
          where: { id: doctorId },
          data: {
            plan: "PRO",
            subscriptionEndsAt: newEndsAt,
            // On peut aussi recharger les quotas SMS ici
            smsQuotaMonthly: 100, 
            smsUsedThisMonth: 0
          }
        })
        console.log(`✅ Abonnement activé pour le médecin ${doctorId}`)
      }
    }

    // On doit toujours répondre 200 à CinetPay pour dire qu'on a bien reçu l'info
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur Webhook CinetPay:", error)
    return NextResponse.json({ error: "Erreur Webhook" }, { status: 500 })
  }
}