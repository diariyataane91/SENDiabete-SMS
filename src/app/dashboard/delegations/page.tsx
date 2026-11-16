import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { decrypt } from "@/lib/crypto"
import { redirect } from "next/navigation"
import DelegationForm from "./delegation-form"
import DelegationActions from "./delegation-actions"

export default async function DelegationsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  const doctor = await prisma.doctorProfile.findUnique({ where: { userId: session.user.id } })
  if (!doctor) return <div>Profil introuvable</div>

  const recuesEnAttente = await prisma.delegation.findMany({
    where: { delegateeId: doctor.id, status: "PENDING", endsAt: { gte: new Date() } },
    include: { delegator: true }
  })

  const recuesAcceptees = await prisma.delegation.findMany({
    where: { delegateeId: doctor.id, status: "ACCEPTED", endsAt: { gte: new Date() }, revokedAt: null },
    include: { delegator: true }
  })

  const donnees = await prisma.delegation.findMany({
    where: { delegatorId: doctor.id },
    include: { delegatee: true },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Délégations Temporaires</h1>
      
      <DelegationForm />

      {recuesEnAttente.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-orange-600 mb-4 flex items-center gap-2">🔔 Demandes reçues en attente</h2>
          <div className="bg-orange-50 rounded-xl shadow-sm border border-orange-200 overflow-hidden">
            <ul className="divide-y divide-orange-200">
              {recuesEnAttente.map((d) => (
                <li key={d.id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-slate-800">Demande du Dr. {decrypt(d.delegator.firstNameEnc)} {decrypt(d.delegator.lastNameEnc)}</p>
                    <p className="text-sm text-slate-600 mt-1">Pour la période se terminant le {new Date(d.endsAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <DelegationActions id={d.id} type="received" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Accès actifs reçus (Confrères absents)</h2>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {recuesAcceptees.length === 0 ? (
            <div className="p-6 text-center text-slate-500">Vous n'avez aucun accès actif.</div>
          ) : (
            <ul className="divide-y divide-slate-200">
              {recuesAcceptees.map((d) => (
                <li key={d.id} className="p-4 flex justify-between items-center bg-blue-50/20">
                  <div>
                    <p className="font-medium text-slate-800">Accès accordé par le Dr. {decrypt(d.delegator.firstNameEnc)} {decrypt(d.delegator.lastNameEnc)}</p>
                    <p className="text-sm text-slate-500 mt-1">Se termine le : {new Date(d.endsAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">Actif</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Historique de mes délégations accordées</h2>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {donnees.length === 0 ? (
            <div className="p-6 text-center text-slate-500">Vous n'avez jamais accordé de délégation.</div>
          ) : (
            <ul className="divide-y divide-slate-200">
              {donnees.map((d) => (
                <li key={d.id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-slate-800">Accordée au Dr. {decrypt(d.delegatee.firstNameEnc)} {decrypt(d.delegatee.lastNameEnc)}</p>
                    <p className="text-sm text-slate-500 mt-1">Du {new Date(d.startsAt).toLocaleDateString('fr-FR')} au {new Date(d.endsAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      d.revokedAt ? 'bg-slate-100 text-slate-500' :
                      d.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' : 
                      d.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {d.revokedAt ? 'Révoquée' : d.status === 'ACCEPTED' ? 'Acceptée' : d.status === 'REJECTED' ? 'Refusée' : 'En attente'}
                    </span>
                    {d.status === "ACCEPTED" && !d.revokedAt && <DelegationActions id={d.id} type="given" />}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}