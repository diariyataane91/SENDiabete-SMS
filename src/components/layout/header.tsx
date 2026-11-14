"use client"

import { signOut } from "next-auth/react"

export default function Header({ userEmail }: { userEmail: string }) {
  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8">
      <div className="text-slate-500 text-sm">
        Espace Médecin
      </div>
      
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-slate-700">{userEmail}</span>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-sm bg-slate-100 hover:bg-red-50 hover:text-red-600 px-3 py-1.5 rounded-md transition-colors"
        >
          Déconnexion
        </button>
      </div>
    </header>
  )
}