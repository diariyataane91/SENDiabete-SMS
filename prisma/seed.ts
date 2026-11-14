import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@medisuivi.sn'
  const password = 'Admin123!' // Ton mot de passe temporaire

  // On vérifie si l'admin existe déjà
  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    console.log('L\'administrateur existe déjà !')
    return
  }

  // On crypte le mot de passe
  const passwordHash = await bcrypt.hash(password, 10)

  // On crée l'utilisateur et son profil médecin
  await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: 'ADMIN',
      doctorProfile: {
        create: {
          firstNameEnc: 'Admin',
          lastNameEnc: 'MediSuivi',
          ordreNumberHash: 'ADMIN-001',
          status: 'VERIFIED'
        }
      }
    }
  })

  console.log('✅ Compte Administrateur créé avec succès !')
  console.log('Email:', email)
  console.log('Mot de passe:', password)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })