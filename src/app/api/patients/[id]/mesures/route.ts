import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

    const body = await req.json()
    const { type, valeurGlycemie, systolique, diastolique } = body

    const objectif = await prisma.objectif.findFirst({
      where: { patientId: params.id, active: true }
    })

    let alertRaised = false
    let alertReason = null

    if (objectif) {
      if (type === 'GLYCEMIE') {
        const val = parseInt(valeurGlycemie)
        if (objectif.glycemieMax && val > objectif.glycemieMax) {
          alertRaised = true
          alertReason = `Glycémie élevée (${val} > ${objectif.glycemieMax})`
        }
      } else if (type === 'TENSION') {
        const sys = parseInt(systolique)
        const dia = parseInt(diastolique)
        if ((objectif.systoliqueMax && sys > objectif.systoliqueMax) || (objectif.diastoliqueMax && dia > objectif.diastoliqueMax)) {
          alertRaised = true
          alertReason = `Tension élevée (${sys}/${dia})`
        }
      }
    }

    const mesure = await prisma.mesure.create({
      data: {
        patientId: params.id,
        type,
        valeurGlycemie: type === 'GLYCEMIE' ? parseInt(valeurGlycemie) : null,
        systolique: type === 'TENSION' ? parseInt(systolique) : null,
        diastolique: type === 'TENSION' ? parseInt(diastolique) : null,
        alertRaised,
        alertReason
      }
    })

    return NextResponse.json({ success: true, mesure })
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}