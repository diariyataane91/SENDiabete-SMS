import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function Dashboard() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold text-slate-800">Tableau de bord</h1>
      <p className="mt-4 text-slate-600">Bienvenue, {session.user?.email} ! (Rôle : {(session.user as any)?.role})</p>
    </main>
  )
}