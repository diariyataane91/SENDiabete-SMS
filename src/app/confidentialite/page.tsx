import Link from "next/link"

export default function Confidentialite() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <Link href="/" className="text-blue-600 hover:underline text-sm mb-8 inline-block">← Retour à l'accueil</Link>
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Politique de Confidentialité (Données de Santé)</h1>
      
      <div className="prose prose-slate max-w-none text-sm text-slate-600 space-y-6">
        <section className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-8">
          <p className="font-semibold text-blue-900">Conformité CDP :</p>
          <p className="text-blue-800">SEN'Diabète s'engage à protéger la vie privée des patients conformément à la loi sénégalaise sur la protection des données personnelles. Un dossier de déclaration est en cours d'instruction auprès de la Commission de Protection des Données (CDP).</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-2">1. Quelles données collectons-nous ?</h2>
          <p>Nous collectons uniquement les données nécessaires au suivi médical : identité du patient (nom, prénom), numéro de téléphone, et les constantes de santé (glycémie, tension artérielle).</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-2">2. Comment vos données sont-elles protégées ?</h2>
          <p>Toutes les données identifiantes (noms, prénoms) et les notes médicales sont <strong>chiffrées (AES-256-GCM)</strong> avant d'être enregistrées dans notre base de données. Elles sont illisibles par un administrateur système.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-2">3. Qui a accès à vos données ?</h2>
          <p>Seul le médecin référent du patient a accès à son dossier. Un contrôle d'accès strict (RBAC) empêche tout autre médecin de consulter le dossier. En cas d'absence, une délégation temporaire tracée peut être accordée.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-2">4. Vos droits</h2>
          <p>Conformément à la réglementation, vous disposez d'un droit d'accès, de rectification et d'effacement de vos données. Pour exercer ces droits, veuillez contacter le médecin qui vous a inscrit ou nous écrire à l'adresse indiquée dans les mentions légales.</p>
        </section>
      </div>
    </div>
  )
}