import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { decrypt } from "@/lib/crypto"
import { redirect } from "next/navigation"
import PaymentButton from "./payment-button"
import ChangePasswordModal from "./change-password-modal" // ✨ Nouveau composant

export default async function ComptePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  const doctor = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: true }
  })

  if (!doctor) return <div>Erreur de profil</div>

  const prenom = decrypt(doctor.firstNameEnc)
  const nom = decrypt(doctor.lastNameEnc)
  const smsRestants = doctor.smsQuotaMonthly - doctor.smsUsedThisMonth
  const pourcentageSms = (doctor.smsUsedThisMonth / doctor.smsQuotaMonthly) * 100

  const dateFin = doctor.subscriptionEndsAt 
    ? new Date(doctor.subscriptionEndsAt).toLocaleDateString('fr-FR') 
    : "Non défini"
  
  const estExpire = doctor.subscriptionEndsAt && new Date(doctor.subscriptionEndsAt) < new Date()

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Mon Compte</h1>
        <p className="text-slate-500 mt-1">Gérez vos informations professionnelles et vos quotas.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CARTE 1 : PROFIL */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Profil Médecin</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-slate-500">Nom complet</p>
              <p className="text-sm font-semibold text-slate-800">Dr. {prenom} {nom}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Email professionnel</p>
              <p className="text-sm font-semibold text-slate-800">{doctor.user.email}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Statut du compte</p>
              <span className={`inline-block mt-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                doctor.status === 'VERIFIED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {doctor.status === 'VERIFIED' ? "Validé par l'administration" : "En attente de validation"}
              </span>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Membre depuis</p>
              <p className="text-sm text-slate-700">{new Date(doctor.createdAt).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
        </div>

        {/* CARTE 2 : QUOTA SMS */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Forfait SMS Push</h2>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-end mb-2">
                <p className="text-sm font-medium text-slate-700">SMS restants ce mois-ci</p>
                <p className="text-2xl font-bold text-blue-900">{smsRestants} <span className="text-sm font-normal text-slate-500">/ {doctor.smsQuotaMonthly}</span></p>
              </div>
              
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full ${smsRestants > 5 ? 'bg-blue-500' : 'bg-red-500'}`} 
                  style={{ width: `${Math.max(0, 100 - pourcentageSms)}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Les SMS sont réinitialisés le 1er de chaque mois. Utilisez WhatsApp en priorité pour économiser votre forfait.
              </p>
            </div>
          </div>
        </div>

        {/* CARTE 3 : ABONNEMENT */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 md:col-span-2">
          <h2 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Mon Abonnement</h2>
          
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-slate-800">
                Forfait actuel : <span className="font-bold text-blue-600">{doctor.plan}</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {estExpire ? (
                  <span className="text-red-500 font-semibold">Votre abonnement a expiré le {dateFin}.</span>
                ) : (
                  <>Valide jusqu'au : <span className="font-semibold">{dateFin}</span></>
                )}
              </p>
            </div>
            <PaymentButton doctorId={doctor.id} currentPlan={doctor.plan} />
          </div>
        </div>

        {/* CARTE 4 : SÉCURITÉ */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 md:col-span-2">
          <h2 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Sécurité</h2>
          
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-slate-800">Mot de passe</p>
              <p className="text-xs text-slate-500 mt-1">Il est recommandé de changer votre mot de passe tous les 3 mois.</p>
            </div>
            <ChangePasswordModal /> {/* ✨ Le bouton d'ouverture de la modale */}
          </div>
        </div>

      </div>
    </div>
  )
}