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

    if (type === 'GLYCEMIE' && !valeurGlycemie) return NextResponse.json({ error: "Valeur requise" }, { status: 400 })
    if (type === 'TENSION' && (!systolique || !diastolique)) return NextResponse.json({ error: "Valeurs requises" }, { status: 400 })

    const mesure = await prisma.mesure.create({
      data: {
        patientId: params.id,
        type,
        valeurGlycemie: type === 'GLYCEMIE' ? parseInt(valeurGlycemie) : null,
        systolique: type === 'TENSION' ? parseInt(systolique) : null,
        diastolique: type === 'TENSION' ? parseInt(diastolique) : null,
      }
    })

    return NextResponse.json({ success: true, mesure })
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}