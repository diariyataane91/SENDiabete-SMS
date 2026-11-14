import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-slate-50">
      <h1 className="text-6xl font-extrabold text-blue-900 tracking-tight">
        MediSuivi
      </h1>
      <p className="mt-2 text-2xl font-medium text-blue-600">
        par SEN'Diabète
      </p>
      <p className="mt-8 text-xl text-slate-600 text-center max-w-2xl">
        La plateforme de télésurveillance des constantes (glycémie et tension) pour les professionnels de santé.
      </p>
      
      <Link 
        href="/login" 
        className="mt-10 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
      >
        Espace Médecin
      </Link>
    </main>
  );
}