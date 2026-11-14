"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ObjectifForm({ patientId, initialData }: { patientId: string, initialData?: any }) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(!initialData)
  const [isLoading, setIsLoading] = useState(false)
  
  const [form, setForm] = useState({
    glycemieMax: initialData?.glycemieMax || "",
    systoliqueMax: initialData?.systoliqueMax || "",
    diastoliqueMax: initialData?.diastoliqueMax || ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    await fetch(`/api/patients/${patientId}/objectifs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    setIsLoading(false)
    setIsEditing(false)
    router.refresh()
  }

  if (!isEditing) {
    return (
      <button onClick={() => setIsEditing(true)} className="mt-4 text-sm text-blue-600 hover:underline font-medium">
        Modifier les objectifs
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-slate-100 space-y-3">
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Glycémie max (mg/dL)</label>
        <input type="number" value={form.glycemieMax} onChange={(e) => setForm({...form, glycemieMax: e.target.value})} className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500" placeholder="Ex: 140" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Tension Sys. max</label>
          <input type="number" value={form.systoliqueMax} onChange={(e) => setForm({...form, systoliqueMax: e.target.value})} className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500" placeholder="Ex: 140" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Tension Dia. max</label>
          <input type="number" value={form.diastoliqueMax} onChange={(e) => setForm({...form, diastoliqueMax: e.target.value})} className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500" placeholder="Ex: 90" />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={isLoading} className="bg-slate-800 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-slate-900">
          {isLoading ? "..." : "Enregistrer"}
        </button>
        {initialData && (
          <button type="button" onClick={() => setIsEditing(false)} className="text-slate-500 px-3 py-1.5 text-sm hover:bg-slate-100 rounded-md">
            Annuler
          </button>
        )}
      </div>
    </form>
  )
}