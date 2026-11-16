import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { decrypt } from "@/lib/crypto"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function PatientsList() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id }
  })

  if (!doctorProfile) return <div>Erreur : Profil médecin introuvable</div>

  const patients = await prisma.patient.findMany({
    where: {
      OR: [
        { referentDoctorId: doctorProfile.id },
        {
          delegations: {
            some: {
              delegateeId: doctorProfile.id,
              startsAt: { lte: new Date() },
              endsAt: { gte: new Date() },
              revokedAt: null,
              status: "ACCEPTED"
            }
          }
        }
      ]
    },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Mes Patients ({patients.length})</h1>
        <Link href="/dashboard/patients/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
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
                  <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-2">
                    {decrypt(patient.firstNameEnc)} {decrypt(patient.lastNameEnc)}
                    {patient.referentDoctorId !== doctorProfile.id && (
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                        Délégation
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{patient.phoneE164}</td>
                  <td className="px-6 py-4 text-slate-600">
                    {new Date(patient.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/dashboard/patients/${patient.id}`} className="text-blue-600 hover:underline text-sm font-medium">
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