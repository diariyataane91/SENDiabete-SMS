import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis")
        }

        // ... (au début du fichier, garde tes imports)

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { doctorProfile: true } // ✨ On inclut le profil
        })

        if (!user) throw new Error("Utilisateur introuvable")

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!isValid) throw new Error("Mot de passe incorrect")

        // ✨ VÉRIFICATION DU STATUT
        if (user.doctorProfile && user.doctorProfile.status === "PENDING") {
          throw new Error("Votre compte est en attente de validation par l'administration.")
        }
        if (user.doctorProfile && user.doctorProfile.status === "REJECTED") {
          throw new Error("Votre compte a été rejeté. Contactez l'administration.")
        }

        return { id: user.id, email: user.email, role: user.role } as any
// ... (garde la suite du fichier)
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role
        ;(session.user as any).id = token.id
      }
      return session
    }
  },
  pages: { signIn: '/login' },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET
}