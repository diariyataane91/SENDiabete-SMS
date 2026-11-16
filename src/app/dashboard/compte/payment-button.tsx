"use client"

import { useState } from "react"

export default function PaymentButton({ doctorId, currentPlan }: { doctorId: string, currentPlan: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handlePayment = async () => {
    setIsLoading(true)
    setError("")

    try {
      const res = await fetch("/api/payments/cinetpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId, plan: "PRO" }) // On force le plan PRO pour l'exemple
      })

      const data = await res.json()

      if (res.ok && data.paymentUrl) {
        // Redirection vers la page de paiement sécurisée CinetPay
        window.location.href = data.paymentUrl
      } else {
        setError(data.error || "Erreur lors de l'initialisation du paiement.")
      }
    } catch (err) {
      setError("Impossible de contacter le serveur de paiement.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="text-right">
      <button 
        onClick={handlePayment} 
        disabled={isLoading}
        className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
      >
        {isLoading ? "Initialisation..." : currentPlan === "PRO" ? "Renouveler l'abonnement" : "Passer au forfait PRO"}
      </button>
      {error && <p className="text-xs text-red-600 mt-2 font-medium">{error}</p>}
    </div>
  )
}