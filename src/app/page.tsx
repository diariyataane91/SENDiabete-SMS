import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      
      {/* Contenu principal */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-5xl font-extrabold text-blue-900 tracking-tight mb-4">
            MediSuivi
          </h1>
          <p className="text-xl font-medium text-blue-600 mb-8">
            par SEN'Diabète
          </p>
          
          <p className="text-lg text-slate-600 mb-10">
            La plateforme de télésurveillance des constantes (glycémie et tension) pour les professionnels de santé au Sénégal. Suivez vos patients entre deux consultations grâce au SMS et à l'USSD.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/login" 
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-colors"
            >
              Espace Médecin
            </Link>
            <Link 
              href="/register" 
              className="w-full sm:w-auto px-8 py-4 bg-white text-blue-600 border border-blue-200 text-lg font-bold rounded-xl shadow-sm hover:bg-blue-50 transition-colors"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </main>

      {/* Footer (Il s'affichera maintenant à coup sûr) */}
      <footer className="w-full bg-white border-t border-slate-200 py-6">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} SEN'Diabète. Tous droits réservés.</p>
          <div className="flex gap-6 mt-4 sm:mt-0">
            <Link href="/mentions-legales" className="hover:text-blue-600 underline-offset-4 hover:underline">
              Mentions légales
            </Link>
            <Link href="/confidentialite" className="hover:text-blue-600 underline-offset-4 hover:underline">
              Politique de confidentialité
            </Link>
          </div>
        </div>
      </footer>

    </div>
  )
}