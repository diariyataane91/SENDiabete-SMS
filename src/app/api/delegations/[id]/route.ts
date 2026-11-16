import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { logAudit } from "@/lib/audit"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

    const body = await req.json()
    const { action } = body 

    const doctor = await prisma.doctorProfile.findUnique({ where: { userId: session.user.id } })
    if (!doctor) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 })

    const delegation = await prisma.delegation.findUnique({ where: { id: params.id } })
    if (!delegation) return NextResponse.json({ error: "Délégation introuvable" }, { status: 404 })

    if (action === "accept" || action === "reject") {
      if (delegation.delegateeId !== doctor.id) {
        return NextResponse.json({ error: "Action non autorisée" }, { status: 403 })
      }
      await prisma.delegation.update({
        where: { id: params.id },
        data: { status: action === "accept" ? "ACCEPTED" : "REJECTED" }
      })
      
      // ✨ Enregistrement dans les logs
      if (action === "accept") {
        await logAudit(session.user.id, "DELEGATION_ACCEPT", "Delegation", params.id, `Acceptation de la délégation`)
      }
    } 
    else if (action === "revoke") {
      if (delegation.delegatorId !== doctor.id) {
        return NextResponse.json({ error: "Action non autorisée" }, { status: 403 })
      }
      await prisma.delegation.update({
        where: { id: params.id },
        data: { revokedAt: new Date() }
      })
    }

    revalidatePath("/dashboard/delegations")
    revalidatePath("/dashboard/patients")
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}