import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { logAudit } from "@/lib/audit"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    await prisma.doctorProfile.update({
      where: { id: params.id },
      data: { status: "VERIFIED" }
    })

    // ✨ Enregistrement dans les logs
    await logAudit(session.user.id, "DOCTOR_VERIFIED", "DoctorProfile", params.id, `Validation du médecin`)

    revalidatePath("/admin/medecins")
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("🔥 Erreur API Verify:", error)
    return NextResponse.json({ error: "Erreur lors de la validation en base" }, { status: 500 })
  }
}