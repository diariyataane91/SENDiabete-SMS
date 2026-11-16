import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function AdminOverview() {
  // Statistiques globales
  const totalDoctors = await prisma.doctorProfile.count()
  const totalPatients = await prisma.patient.count()
  const totalMesures = await prisma.mesure.count()
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Vue d'ensemble</h1>
        <p className="text-slate-500 mt-1">Bienvenue sur la console de gestion de MediSuivi.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Médecins inscrits</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">{totalDoctors}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Patients suivis</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">{totalPatients}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Mesures transmises</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">{totalMesures}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/admin/medecins" className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 transition-colors group">
          <h2 className="text-lg font-bold text-slate-800 group-hover:text-blue-600">Gérer les médecins &rarr;</h2>
          <p className="text-sm text-slate-500 mt-2">Validez les inscriptions à l'Ordre et gérez les accès.</p>
        </Link>
        <Link href="/admin/audit" className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 transition-colors group">
          <h2 className="text-lg font-bold text-slate-800 group-hover:text-blue-600">Consulter les logs &rarr;</h2>
          <p className="text-sm text-slate-500 mt-2">Assurez la traçabilité des accès aux données de santé.</p>
        </Link>
      </div>
    </div>
  )
}