"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function NewOrdonnance({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const res = await fetch(`/api/patients/${params.id}/ordonnances`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    })

    if (res.ok) {
      const data = await res.json()
      router.push(`/dashboard/patients/${params.id}/ordonnances/${data.ordonnanceId}`)
    } else {
      const data = await res.json()
      setError(data.error || "Erreur lors de la création")
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href={`/dashboard/patients/${params.id}`} className="text-blue-600 hover:underline text-sm mb-2 inline-block">
          ← Retour à la fiche
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Rédiger une ordonnance</h1>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Prescription (Médicaments et posologie)</label>
            <textarea 
              required 
              rows={8}
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm" 
              placeholder="Ex:&#10;- Metformine 850mg : 1 comprimé matin et soir pendant 1 mois&#10;- Amlodipine 5mg : 1 comprimé le matin pendant 1 mois"
            />
            <p className="text-xs text-slate-500 mt-1">Ce contenu sera chiffré (AES-256) dans la base de données.</p>
          </div>

          <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-70">
            {isLoading ? "Génération..." : "Générer l'ordonnance"}
          </button>
        </form>
      </div>
    </div>
  )
}