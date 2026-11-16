import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  
  // Sécurité stricte : Seul l'ADMIN peut accéder à ces pages
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Menu de gauche Admin */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold text-white">MediSuivi</h1>
          <p className="text-xs text-slate-400 mt-1">Console d'Administration</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link 
            href="/admin/medecins" 
            className="block px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            👨🏾‍⚕️ Gestion des Médecins
          </Link>
          
          <Link 
            href="/admin/audit" 
            className="block px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            📋 Audit & Logs
          </Link>

          {/* On ajoutera Abonnements & Paiements ici plus tard */}
          <div className="block px-4 py-2 rounded-lg text-sm font-medium text-slate-600 cursor-not-allowed">
            💳 Abonnements (Bientôt)
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link 
            href="/dashboard" 
            className="block text-center bg-slate-800 hover:bg-slate-700 py-2 rounded-lg text-sm transition-colors"
          >
            Retour à l'application
          </Link>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}