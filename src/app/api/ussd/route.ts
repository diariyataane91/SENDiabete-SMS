import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const msisdn = body.msisdn // ex: "221771234567"
    const sessionId = body.sessionid
    const text = body.text || "" 

    // 1. Vérification de sécurité (Token LAM)
    const token = req.headers.get("token")
    const expectedToken = process.env.LAM_USSD_TOKEN
    if (expectedToken && token !== expectedToken) {
      return new NextResponse("Non autorisé", { status: 401 })
    }

    // 2. Identifier le patient via son numéro (on ajoute le "+")
    const formattedPhone = `+${msisdn}`
    const patient = await prisma.patient.findUnique({
      where: { phoneE164: formattedPhone },
      include: { objectifs: { where: { active: true }, take: 1 } }
    })

    let message = ""
    let sessionEnd = "false"

    // 3. Logique du menu (State Machine)
    if (!patient) {
      message = "Votre numero n'est pas enregistre chez MediSuivi. Contactez votre medecin."
      sessionEnd = "true"
    } else {
      const input = text.split("*") // Transforme "1*120" en ["1", "120"]
      
      if (text === "") {
        message = "Bienvenue sur MediSuivi. Que souhaitez-vous faire ?\n1. Envoyer une glycemie\n2. Envoyer une tension"
      } 
      else if (text === "1") {
        message = "Entrez votre taux de glycemie en mg/dL (ex: 120) :"
      } 
      else if (text === "2") {
        message = "Entrez votre tension (ex: 130 80) :"
      } 
      else if (input[0] === "1" && input.length === 2) {
        // Enregistrement de la GLYCEMIE
        const val = parseInt(input[1])
        if (isNaN(val)) {
          message = "Valeur invalide. Veuillez recomposer le code."
        } else {
          const objectif = patient.objectifs[0]
          const alertRaised = objectif?.glycemieMax ? val > objectif.glycemieMax : false
          
          await prisma.mesure.create({
            data: {
              patientId: patient.id,
              type: "GLYCEMIE",
              valeurGlycemie: val,
              alertRaised,
              alertReason: alertRaised ? `Glycémie élevée (${val} > ${objectif?.glycemieMax})` : null
            }
          })
          message = `Merci. Glycemie de ${val} mg/dL enregistree.`
        }
        sessionEnd = "true"
      } 
      else if (input[0] === "2" && input.length === 3) {
        // Enregistrement de la TENSION (ex: 2*130*80)
        const sys = parseInt(input[1])
        const dia = parseInt(input[2])
        if (isNaN(sys) || isNaN(dia)) {
          message = "Format invalide. Veuillez recomposer le code."
        } else {
          const objectif = patient.objectifs[0]
          const alertRaised = (objectif?.systoliqueMax && sys > objectif.systoliqueMax) || (objectif?.diastoliqueMax && dia > objectif.diastoliqueMax)
          
          await prisma.mesure.create({
            data: {
              patientId: patient.id,
              type: "TENSION",
              systolique: sys,
              diastolique: dia,
              alertRaised: !!alertRaised,
              alertReason: alertRaised ? `Tension élevée (${sys}/${dia})` : null
            }
          })
          message = `Merci. Tension de ${sys}/${dia} mmHg enregistree.`
        }
        sessionEnd = "true"
      } 
      else {
        message = "Choix invalide. Veuillez recomposer le code."
        sessionEnd = "true"
      }
    }

    // 4. Réponse au format exact exigé par LAfricaMobile
    return NextResponse.json(
      {
        page: { session_end: sessionEnd },
        message: message
      },
      {
        headers: {
          "Content-Type": "application/json",
          "login": process.env.LAM_USSD_LOGIN || "",
          "password": process.env.LAM_USSD_PASSWORD || "",
          "sessionid": sessionId
        }
      }
    )

  } catch (error) {
    console.error("Erreur Webhook USSD:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}