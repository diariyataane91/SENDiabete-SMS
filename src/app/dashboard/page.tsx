import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { decrypt } from "@/lib/crypto"

export default async function Dashboard() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id }
  })

  if (!doctorProfile) return <div>Erreur de profil</div>

  // 1. Total de patients (mes patients + ceux délégués)
  const totalPatients = await prisma.patient.count({
    where: {
      OR: [
        { referentDoctorId: doctorProfile.id },
        {
          delegations: {
            some: {
              delegateeId: doctorProfile.id,
              status: "ACCEPTED",
              endsAt: { gte: new Date() },
              revokedAt: null
            }
          }
        }
      ]
    }
  })

  // 2. Mesures de la semaine (7 derniers jours)
  const ilYAUneSemaine = new Date()
  ilYAUneSemaine.setDate(ilYAUneSemaine.getDate() - 7)

  const totalMesuresSemaine = await prisma.mesure.count({
    where: {
      patient: { referentDoctorId: doctorProfile.id },
      measuredAt: { gte: ilYAUneSemaine }
    }
  })

  // 3. Alertes actives
  const totalAlertes = await prisma.mesure.count({
    where: {
      patient: { referentDoctorId: doctorProfile.id },
      alertRaised: true
    }
  })

  // 4. Dernières alertes (Top 5)
  const dernieresAlertes = await prisma.mesure.findMany({
    where: {
      patient: { referentDoctorId: doctorProfile.id },
      alertRaised: true
    },
    include: { patient: true },
    orderBy: { measuredAt: "desc" },
    take: 5
  })

  // 5. Derniers patients ajoutés (Top 3)
  const derniersPatients = await prisma.patient.findMany({
    where: { referentDoctorId: doctorProfile.id },
    orderBy: { createdAt: "desc" },
    take: 3
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Tableau de bord</h1>
      
      {/* CARTES DE STATISTIQUES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Total Patients</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">{totalPatients}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Mesures cette semaine</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">{totalMesuresSemaine}</p>
        </div>
        <Link href="/dashboard/alertes" className="bg-white p-6 rounded-xl shadow-sm border border-red-200 bg-red-50/30 hover:bg-red-50 transition-colors block">
          <p className="text-sm font-medium text-red-600">Alertes actives</p>
          <p className="text-3xl font-bold text-red-700 mt-2">{totalAlertes}</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DERNIÈRES ALERTES */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-800">Dernières alertes</h2>
            <Link href="/dashboard/alertes" className="text-sm text-blue-600 hover:underline">Tout voir</Link>
          </div>
          
          {dernieresAlertes.length === 0 ? (
            <p className="text-slate-500 text-sm">Aucune alerte récente. Tout va bien !</p>
          ) : (
            <ul className="space-y-3">
              {dernieresAlertes.map((alerte) => (
                <li key={alerte.id} className="p-3 bg-red-50 rounded-lg border border-red-100 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-slate-800 text-sm">
                      {decrypt(alerte.patient.firstNameEnc)} {decrypt(alerte.patient.lastNameEnc)}
                    </p>
                    <p className="text-xs text-red-600 mt-0.5">{alerte.alertReason}</p>
                  </div>
                  <Link href={`/dashboard/patients/${alerte.patientId}`} className="text-xs font-semibold text-blue-600 hover:underline">
                    Voir
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* DERNIERS PATIENTS */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-800">Derniers patients ajoutés</h2>
            <Link href="/dashboard/patients" className="text-sm text-blue-600 hover:underline">Tout voir</Link>
          </div>
          
          {derniersPatients.length === 0 ? (
            <p className="text-slate-500 text-sm">Aucun patient pour le moment.</p>
          ) : (
            <ul className="space-y-3">
              {derniersPatients.map((patient) => (
                <li key={patient.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-slate-800 text-sm">
                      {decrypt(patient.firstNameEnc)} {decrypt(patient.lastNameEnc)}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{patient.phoneE164}</p>
                  </div>
                  <Link href={`/dashboard/patients/${patient.id}`} className="text-xs font-semibold text-blue-600 hover:underline">
                    Fiche
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}