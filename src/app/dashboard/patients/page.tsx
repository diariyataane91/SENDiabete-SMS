import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { decrypt } from "@/lib/crypto"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function PatientsList() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  // On récupère le profil du médecin connecté
  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id }
  })

  if (!doctorProfile) return <div>Erreur : Profil médecin introuvable</div>

  // On récupère uniquement les patients de ce médecin
  const patients = await prisma.patient.findMany({
    where: { referentDoctorId: doctorProfile.id },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Mes Patients ({patients.length})</h1>
        <Link 
          href="/dashboard/patients/new" 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Nouveau Patient
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {patients.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            Aucun patient enregistré pour le moment.
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-sm font-semibold text-slate-600">Patient</th>
                <th className="px-6 py-3 text-sm font-semibold text-slate-600">Téléphone</th>
                <th className="px-6 py-3 text-sm font-semibold text-slate-600">Date d'ajout</th>
                <th className="px-6 py-3 text-sm font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {patients.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {/* ✨ DÉCHIFFREMENT À LA VOLÉE POUR L'AFFICHAGE */}
                    {decrypt(patient.firstNameEnc)} {decrypt(patient.lastNameEnc)}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{patient.phoneE164}</td>
                  <td className="px-6 py-4 text-slate-600">
                    {new Date(patient.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4">
                    <Link 
                      href={`/dashboard/patients/${patient.id}`} 
                      className="text-blue-600 hover:underline text-sm font-medium"
                    >
                      Voir la fiche
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}