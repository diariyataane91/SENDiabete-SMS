"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ActionsAlerte({ phone, message, quotaRestant }: { phone: string, message: string, quotaRestant: number }) {
  const router = useRouter()
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState("")

  const handleSendSms = async () => {
    if (quotaRestant <= 0) return
    setIsSending(true)
    setError("")

    const res = await fetch("/api/sms/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, message: decodeURIComponent(message) })
    })

    if (res.ok) {
      alert("SMS Push envoyé avec succès au patient !")
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error)
    }
    setIsSending(false)
  }

  return (
    <div className="mt-3 pt-3 border-t border-red-200">
      <div className="flex gap-2">
        <a 
          href={`https://wa.me/${phone.replace('+', '')}?text=${message}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex-1 bg-green-600 text-white text-center py-1.5 rounded text-xs font-semibold hover:bg-green-700 transition-colors"
        >
          WhatsApp
        </a>
        <button 
          onClick={handleSendSms} 
          disabled={isSending || quotaRestant <= 0} 
          className="flex-1 bg-slate-800 text-white py-1.5 rounded text-xs font-semibold hover:bg-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? "Envoi..." : quotaRestant > 0 ? `SMS Push (${quotaRestant})` : "Quota atteint"}
        </button>
      </div>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}