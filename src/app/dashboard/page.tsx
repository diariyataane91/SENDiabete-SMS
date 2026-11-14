import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function Dashboard() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id }
  })

  if (!doctorProfile) return <div>Erreur de profil</div>

  // On compte les patients dans la base
  const totalPatients = await prisma.patient.count({
    where: { referentDoctorId: doctorProfile.id }
  })

  // On compte les alertes actives
  const totalAlertes = await prisma.mesure.count({
    where: {
      patient: { referentDoctorId: doctorProfile.id },
      alertRaised: true
    }
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Tableau de bord</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Total Patients</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">{totalPatients}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Mesures cette semaine</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">-</p> {/* À calculer plus tard */}
        </div>
        <Link href="/dashboard/alertes" className="bg-white p-6 rounded-xl shadow-sm border border-red-200 bg-red-50/30 hover:bg-red-50 transition-colors block">
          <p className="text-sm font-medium text-red-600">Alertes actives</p>
          <p className="text-3xl font-bold text-red-700 mt-2">{totalAlertes}</p>
        </Link>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Dernières activités</h2>
        <p className="text-slate-500 text-sm">Les alertes récentes apparaîtront ici.</p>
      </div>
    </div>
  )
}