import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { decrypt } from "@/lib/crypto"
import { redirect } from "next/navigation"
import VerifyButton from "./verify-button"

export default async function AdminMedecins() {
  const session = await getServerSession(authOptions)
  
  // Sécurité : Seul l'ADMIN peut voir cette page
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/dashboard")
  }

  const doctors = await prisma.doctorProfile.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Vérification des Médecins</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-sm font-semibold text-slate-600">Médecin</th>
              <th className="px-6 py-3 text-sm font-semibold text-slate-600">Email</th>
              <th className="px-6 py-3 text-sm font-semibold text-slate-600">Statut</th>
              <th className="px-6 py-3 text-sm font-semibold text-slate-600">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {doctors.map((doc) => (
              <tr key={doc.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-800">
                  Dr. {decrypt(doc.firstNameEnc)} {decrypt(doc.lastNameEnc)}
                </td>
                <td className="px-6 py-4 text-slate-600">{doc.user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    doc.status === 'VERIFIED' ? 'bg-green-100 text-green-700' : 
                    doc.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {doc.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {doc.status === 'PENDING' && <VerifyButton doctorId={doc.id} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}