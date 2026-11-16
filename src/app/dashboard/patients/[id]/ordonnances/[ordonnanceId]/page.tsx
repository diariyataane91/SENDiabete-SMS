"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function ViewOrdonnance() {
  const params = useParams()
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const patientId = params.id as string
    const ordonnanceId = params.ordonnanceId as string

    if (!patientId || !ordonnanceId) return

    fetch(`/api/patients/${patientId}/ordonnances/${ordonnanceId}`)
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.error || "Impossible de charger l'ordonnance")
        }
        return res.json()
      })
      .then((d) => setData(d))
      .catch((err) => setError(err.message))
  }, [params])

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 font-medium mb-4">Erreur : {error}</p>
        <Link href={`/dashboard/patients/${params.id}`} className="text-blue-600 hover:underline">
          ← Retour à la fiche patient
        </Link>
      </div>
    )
  }

  if (!data) {
    return <div className="p-8 text-center text-slate-500 font-medium animate-pulse">Chargement de l'ordonnance...</div>
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex justify-between items-center print:hidden">
        <Link href={`/dashboard/patients/${params.id}`} className="text-blue-600 hover:underline text-sm font-medium">
          ← Retour à la fiche
        </Link>
        <button onClick={() => window.print()} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 shadow-sm transition-colors">
          🖨️ Imprimer / Sauvegarder en PDF
        </button>
      </div>

      <div className="bg-white p-12 rounded-xl shadow-sm border border-slate-200 print:shadow-none print:border-none print:p-0">
        <div className="flex justify-between items-start border-b-2 border-blue-900 pb-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-blue-900">Dr. {data.doctorName}</h1>
            <p className="text-sm text-slate-600 mt-1">Médecin Inscrit à l'Ordre</p>
            <p className="text-sm text-slate-600">SEN'DIABETE - Cabinet Médical</p>
            <p className="text-sm text-slate-600">Dakar, Sénégal</p>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-extrabold text-slate-200">ORDONNANCE</h2>
            <p className="text-sm font-medium text-slate-600 mt-2">
              Date : {new Date(data.issuedAt).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>

        <div className="mb-10 bg-slate-50 p-4 rounded-lg border border-slate-100 print:bg-white print:border-slate-300">
          <p className="text-sm"><span className="font-bold text-slate-800">Patient :</span> {data.patientName}</p>
          <p className="text-sm mt-1"><span className="font-bold text-slate-800">Téléphone :</span> {data.patientPhone}</p>
        </div>

        <div className="min-h-[300px]">
          <h3 className="text-lg font-bold text-slate-800 mb-4 underline underline-offset-4 decoration-blue-200">Prescription :</h3>
          <div className="text-base text-slate-800 whitespace-pre-wrap font-mono leading-relaxed">
            {data.content}
          </div>
        </div>

        <div className="mt-20 text-right">
          <p className="text-sm text-slate-500 mb-8">Signature et cachet du médecin</p>
          <div className="border-b border-slate-400 w-48 ml-auto"></div>
        </div>
      </div>
    </div>
  )
}