"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminActions({ doctorId, currentStatus }: { doctorId: string, currentStatus: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<"verify" | "reject" | "reset" | null>(null)
  const [toast, setToast] = useState<{ message: string, type: "success" | "error" } | null>(null)

  const handleAction = async (action: "verify" | "reject") => {
    setIsLoading(action)
    const res = await fetch(`/api/admin/medecins/${doctorId}/${action}`, { method: "POST" })
    
    if (res.ok) {
      setToast({ 
        message: action === "verify" ? "Médecin validé avec succès." : "Médecin rejeté.", 
        type: "success" 
      })
      router.refresh()
    } else {
      setToast({ message: "Une erreur est survenue.", type: "error" })
    }
    
    setIsLoading(null)
    setTimeout(() => setToast(null), 3000)
  }

  const handleResetPassword = async () => {
    if (!confirm("Voulez-vous réinitialiser le mot de passe de ce médecin ?")) return
    setIsLoading("reset")
    
    const res = await fetch(`/api/admin/medecins/${doctorId}/reset-password`, { method: "POST" })
    const data = await res.json()
    
    if (res.ok) {
      setToast({ message: `Nouveau MDP : ${data.tempPassword}`, type: "success" })
    } else {
      setToast({ message: "Erreur lors de la réinitialisation.", type: "error" })
    }
    setIsLoading(null)
    setTimeout(() => setToast(null), 8000)
  }

  return (
    <>
      <div className="flex gap-2">
        {currentStatus !== "VERIFIED" && (
          <button 
            onClick={() => handleAction("verify")} 
            disabled={isLoading !== null} 
            className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-1 shadow-sm"
          >
            {isLoading === "verify" ? "⏳ En cours..." : "✓ Valider"}
          </button>
        )}
        
        {currentStatus !== "REJECTED" && (
          <button 
            onClick={() => handleAction("reject")} 
            disabled={isLoading !== null} 
            className="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-100 disabled:opacity-50 transition-colors flex items-center gap-1"
          >
            {isLoading === "reject" ? "⏳ En cours..." : "✕ Rejeter"}
          </button>
        )}

        <button 
          onClick={handleResetPassword} 
          disabled={isLoading !== null} 
          className="bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-200 disabled:opacity-50 transition-colors"
          title="Réinitialiser le mot de passe"
        >
          {isLoading === "reset" ? "⏳" : "🔑 MDP"}
        </button>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-xl shadow-xl text-white font-medium text-sm animate-fade-in z-50 ${
          toast.type === "success" ? "bg-slate-800" : "bg-red-600"
        }`}>
          {toast.message}
        </div>
      )}
    </>
  )
}