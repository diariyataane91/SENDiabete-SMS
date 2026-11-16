"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function DelegationForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [dateFin, setDateFin] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [toast, setToast] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const res = await fetch("/api/delegations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ delegateeEmail: email, endsAt: dateFin }),
    })

    if (res.ok) {
      setToast("Demande de délégation envoyée au confrère.")
      setEmail("")
      setDateFin("")
      router.refresh()
      setTimeout(() => setToast(""), 4000)
    } else {
      const data = await res.json()
      setError(data.error)
    }
    setIsLoading(false)
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8 relative">
      <h2 className="text-lg font-bold text-slate-800 mb-4">Accorder une délégation</h2>
      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
      
      <form onSubmit={handleSubmit} className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-1">Email du confrère</label>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="confrere@hopital.sn" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Jusqu'au</label>
          <input required type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <button type="submit" disabled={isLoading} className="bg-slate-800 text-white font-semibold px-6 py-2 rounded-lg hover:bg-slate-900 disabled:opacity-70">
          {isLoading ? "Envoi..." : "Déléguer l'accès"}
        </button>
      </form>

      {toast && (
        <div className="fixed bottom-6 right-6 px-6 py-3 rounded-xl shadow-xl text-white font-medium text-sm bg-slate-800 animate-fade-in z-50">
          {toast}
        </div>
      )}
    </div>
  )
}