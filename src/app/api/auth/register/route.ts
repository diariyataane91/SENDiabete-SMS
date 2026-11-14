import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { encrypt } from "@/lib/crypto"
import { createHmac } from "crypto"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { firstName, lastName, email, password, ordreNumber } = body

    if (!firstName || !lastName || !email || !password || !ordreNumber) {
      return NextResponse.json({ error: "Tous les champs sont obligatoires" }, { status: 400 })
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 400 })
    }

    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash(password, 10)

    // Chiffrer les données identifiantes (AES)
    const lastNameEnc = encrypt(lastName)
    const firstNameEnc = encrypt(firstName)

    // Hasher le numéro d'ordre (HMAC pour unicité et recherche)
    const hmacKey = process.env.HMAC_KEY || '12345678901234567890123456789012'
    const ordreNumberHash = createHmac('sha256', hmacKey).update(ordreNumber).digest('hex')

    // Créer le médecin avec le statut PENDING
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "DOCTOR",
        doctorProfile: {
          create: {
            firstNameEnc,
            lastNameEnc,
            ordreNumberHash,
            status: "PENDING"
          }
        }
      }
    })

    return NextResponse.json({ success: true, message: "Inscription réussie. En attente de validation." })
  } catch (error) {
    console.error("Erreur inscription:", error)
    return NextResponse.json({ error: "Erreur lors de l'inscription" }, { status: 500 })
  }
}