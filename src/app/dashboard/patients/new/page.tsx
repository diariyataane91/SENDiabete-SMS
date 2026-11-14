"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function NewPatient() {
  const router = useRouter()
  const [form, setForm] = useState({ firstName: "", lastName: "", phoneE164: "" })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const res = await fetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      router.push("/dashboard/patients")
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error || "Une erreur est survenue")
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard/patients" className="text-blue-600 hover:underline text-sm mb-2 inline-block">
          ← Retour à la liste
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Nouveau Patient</h1>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Prénom</label>
              <input required value={form.firstName} onChange={(e) => setForm({...form, firstName: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
              <input required value={form.lastName} onChange={(e) => setForm({...form, lastName: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Numéro de téléphone (ex: +221771234567)</label>
            <input required type="tel" value={form.phoneE164} onChange={(e) => setForm({...form, phoneE164: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            <p className="text-xs text-slate-500 mt-1">Ce numéro servira au patient pour envoyer ses constantes par SMS/USSD.</p>
          </div>

          <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-70 mt-4">
            {isLoading ? "Enregistrement..." : "Enregistrer le patient"}
          </button>
        </form>
      </div>
    </div>
  )
}