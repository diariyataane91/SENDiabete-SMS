import Link from "next/link"

export default function MentionsLegales() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <Link href="/" className="text-blue-600 hover:underline text-sm mb-8 inline-block">← Retour à l'accueil</Link>
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Mentions Légales</h1>
      
      <div className="prose prose-slate max-w-none text-sm text-slate-600 space-y-6">
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-2">1. Éditeur du site</h2>
          <p>Le site MediSuivi est édité par la société <strong>SEN'Diabète</strong>.<br />
          Statut : Entreprise en cours de constitution.<br />
          Siège social : Dakar, Sénégal.<br />
          Contact : contact@sen-diabete.com</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-2">2. Hébergement</h2>
          <p>L'application et les données de santé sont hébergées de manière souveraine au Sénégal par :<br />
          <strong>Sonatel / Orange Business Sénégal</strong><br />
          Adresse : Dakar, Sénégal.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-2">3. Propriété intellectuelle</h2>
          <p>L'ensemble du code source, des interfaces et des éléments graphiques de MediSuivi sont la propriété exclusive de SEN'Diabète. Toute reproduction sans autorisation est interdite.</p>
        </section>
      </div>
    </div>
  )
}