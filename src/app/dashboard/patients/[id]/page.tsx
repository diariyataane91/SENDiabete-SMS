import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { decrypt } from "@/lib/crypto"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import ObjectifForm from "./objectif-form"
import ActionsAlerte from "./actions-alerte"

export default async function PatientDetail({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id }
  })

  const patient = await prisma.patient.findUnique({
    where: { id: params.id },
    include: {
      mesures: { orderBy: { measuredAt: "desc" } },
      objectifs: { where: { active: true }, take: 1 }
    }
  })

  if (!patient || !doctorProfile) notFound()
  
  const prenom = decrypt(patient.firstNameEnc)
  const nom = decrypt(patient.lastNameEnc)
  const objectif = patient.objectifs[0]
  const quotaRestant = doctorProfile.smsQuotaMonthly - doctorProfile.smsUsedThisMonth

  const getAlertMessage = (m: any) => {
    const val = m.type === 'GLYCEMIE' ? `${m.valeurGlycemie} mg/dL` : `${m.systolique}/${m.diastolique} mmHg`
    return encodeURIComponent(`Bonjour ${prenom}, votre dernière mesure de ${m.type.toLowerCase()} est de ${val}. Elle dépasse l'objectif fixé avec votre médecin. Merci de contacter le cabinet. - MediSuivi`)
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/dashboard/patients" className="text-blue-600 hover:underline text-sm mb-2 inline-block">
          ← Retour à la liste
        </Link>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">{prenom} {nom}</h1>
            <p className="text-slate-500 mt-1">Téléphone : {patient.phoneE164}</p>
          </div>
          <Link href={`/dashboard/patients/${patient.id}/mesures/new`} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            + Ajouter une mesure
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Dernières mesures</h2>
          {patient.mesures.length === 0 ? (
            <p className="text-slate-500 text-sm">Aucune mesure enregistrée.</p>
          ) : (
            <ul className="space-y-3">
              {patient.mesures.map(m => (
                <li key={m.id} className={`text-sm p-3 rounded border ${m.alertRaised ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium block">{m.type}</span>
                      {m.alertRaised && <span className="text-xs text-red-600 font-semibold">{m.alertReason}</span>}
                    </div>
                    <span className={`font-bold ${m.alertRaised ? 'text-red-700' : 'text-slate-700'}`}>
                      {m.type === 'GLYCEMIE' ? `${m.valeurGlycemie} mg/dL` : `${m.systolique}/${m.diastolique} mmHg`}
                    </span>
                  </div>
                  {m.alertRaised && (
                    <ActionsAlerte phone={patient.phoneE164} message={getAlertMessage(m)} quotaRestant={quotaRestant} />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Objectifs thérapeutiques</h2>
          {objectif ? (
            <div className="text-sm space-y-2 text-slate-700">
              <p><span className="font-semibold">Glycémie max :</span> {objectif.glycemieMax ?? '-'} mg/dL</p>
              <p><span className="font-semibold">Tension max :</span> {objectif.systoliqueMax ?? '-'}/{objectif.diastoliqueMax ?? '-'} mmHg</p>
              <ObjectifForm patientId={patient.id} initialData={objectif} />
            </div>
          ) : (
            <ObjectifForm patientId={patient.id} />
          )}
        </div>
      </div>
    </div>
  )
}