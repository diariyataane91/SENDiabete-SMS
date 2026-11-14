import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

    const body = await req.json()
    const { glycemieMax, systoliqueMax, diastoliqueMax } = body

    await prisma.objectif.updateMany({
      where: { patientId: params.id, active: true },
      data: { active: false }
    })

    await prisma.objectif.create({
      data: {
        patientId: params.id,
        glycemieMax: glycemieMax ? parseInt(glycemieMax) : null,
        systoliqueMax: systoliqueMax ? parseInt(systoliqueMax) : null,
        diastoliqueMax: diastoliqueMax ? parseInt(diastoliqueMax) : null,
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}