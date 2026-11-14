"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function NewMesure({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [type, setType] = useState<"GLYCEMIE" | "TENSION">("GLYCEMIE")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  const [formData, setFormData] = useState({
    valeurGlycemie: "",
    systolique: "",
    diastolique: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const res = await fetch(`/api/patients/${params.id}/mesures`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, ...formData }),
    })

    if (res.ok) {
      router.push(`/dashboard/patients/${params.id}`)
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error || "Erreur lors de l'enregistrement")
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <Link href={`/dashboard/patients/${params.id}`} className="text-blue-600 hover:underline text-sm mb-2 inline-block">
          ← Retour à la fiche
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Ajouter une mesure</h1>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

        <div className="flex gap-4 mb-6">
          <button 
            onClick={() => setType("GLYCEMIE")} 
            className={`flex-1 py-2 rounded-lg font-medium border ${type === 'GLYCEMIE' ? 'bg-blue-50 border-blue-600 text-blue-700' : 'border-slate-300 text-slate-600'}`}
          >
            Glycémie
          </button>
          <button 
            onClick={() => setType("TENSION")} 
            className={`flex-1 py-2 rounded-lg font-medium border ${type === 'TENSION' ? 'bg-blue-50 border-blue-600 text-blue-700' : 'border-slate-300 text-slate-600'}`}
          >
            Tension
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {type === "GLYCEMIE" ? (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Glycémie (mg/dL)</label>
              <input required type="number" value={formData.valeurGlycemie} onChange={(e) => setFormData({...formData, valeurGlycemie: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: 120" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Systolique (mmHg)</label>
                <input required type="number" value={formData.systolique} onChange={(e) => setFormData({...formData, systolique: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: 130" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Diastolique (mmHg)</label>
                <input required type="number" value={formData.diastolique} onChange={(e) => setFormData({...formData, diastolique: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: 80" />
              </div>
            </div>
          )}

          <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-70 mt-4">
            {isLoading ? "Enregistrement..." : "Enregistrer la mesure"}
          </button>
        </form>
      </div>
    </div>
  )
}