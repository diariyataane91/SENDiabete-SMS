import { prisma } from "@/lib/prisma"
import { decrypt } from "@/lib/crypto"
import AdminActions from "./verify-button"

export default async function AdminMedecins() {
  const doctors = await prisma.doctorProfile.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" }
  })

  const pendingCount = doctors.filter(d => d.status === 'PENDING').length
  const verifiedCount = doctors.filter(d => d.status === 'VERIFIED').length

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Gestion des Médecins</h1>
        <p className="text-slate-500 mt-1">Validez ou rejetez les inscriptions à l'Ordre.</p>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">En attente de validation</p>
          <p className="text-2xl font-bold text-orange-500 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">Médecins validés</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{verifiedCount}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Médecin</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Email</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Statut</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {doctors.map((doc) => (
              <tr key={doc.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <p className="font-medium text-slate-800">
                    Dr. {decrypt(doc.firstNameEnc)} {decrypt(doc.lastNameEnc)}
                  </p>
                </td>
                <td className="px-6 py-4 text-slate-600">{doc.user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    doc.status === 'VERIFIED' ? 'bg-green-100 text-green-700' : 
                    doc.status === 'PENDING' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {doc.status === 'VERIFIED' ? 'Validé' : doc.status === 'PENDING' ? 'En attente' : 'Rejeté'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <AdminActions doctorId={doc.id} currentStatus={doc.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}