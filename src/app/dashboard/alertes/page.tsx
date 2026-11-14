import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { decrypt } from "@/lib/crypto"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function AlertesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id }
  })

  if (!doctorProfile) return <div>Erreur de profil</div>

  // Récupère toutes les mesures en alerte pour les patients de ce médecin
  const alertes = await prisma.mesure.findMany({
    where: {
      patient: { referentDoctorId: doctorProfile.id },
      alertRaised: true
    },
    include: { patient: true },
    orderBy: { measuredAt: "desc" }
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Alertes des patients</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {alertes.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            Aucune alerte pour le moment. Tout va bien !
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {alertes.map((a) => (
              <li key={a.id} className="p-4 hover:bg-slate-50 flex justify-between items-center">
                <div>
                  <p className="font-medium text-slate-800">
                    {decrypt(a.patient.firstNameEnc)} {decrypt(a.patient.lastNameEnc)}
                  </p>
                  <p className="text-sm text-red-600 font-medium mt-1">{a.alertReason}</p>
                </div>
                <div className="flex gap-3 items-center">
                  <span className="text-sm text-slate-500">
                    {new Date(a.measuredAt).toLocaleDateString('fr-FR')}
                  </span>
                  <Link href={`/dashboard/patients/${a.patientId}`} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded text-sm font-medium hover:bg-slate-200 transition-colors">
                    Voir la fiche
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}