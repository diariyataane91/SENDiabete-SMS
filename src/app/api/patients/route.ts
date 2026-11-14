import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { encrypt } from "@/lib/crypto"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await req.json()
    const { firstName, lastName, phoneE164 } = body

    if (!firstName || !lastName || !phoneE164) {
      return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 })
    }

    // On récupère le profil du médecin connecté
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!doctorProfile) {
      return NextResponse.json({ error: "Profil médecin introuvable" }, { status: 404 })
    }

    // ✨ CHIFFREMENT DES DONNÉES SENSIBLES
    const encryptedFirstName = encrypt(firstName)
    const encryptedLastName = encrypt(lastName)

    const patient = await prisma.patient.create({
      data: {
        firstNameEnc: encryptedFirstName,
        lastNameEnc: encryptedLastName,
        phoneE164: phoneE164,
        referentDoctorId: doctorProfile.id
      }
    })

    return NextResponse.json({ success: true, patient: { id: patient.id } })
  } catch (error: any) {
    // Gérer l'erreur si le numéro de téléphone existe déjà
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Ce numéro de téléphone est déjà enregistré." }, { status: 400 })
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}