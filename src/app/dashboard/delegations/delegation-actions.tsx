"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function DelegationActions({ id, type }: { id: string, type: "received" | "given" }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleAction = async (action: "accept" | "reject" | "revoke") => {
    setIsLoading(true)
    await fetch(`/api/delegations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action })
    })
    router.refresh()
    setIsLoading(false)
  }

  if (type === "received") {
    return (
      <div className="flex gap-2">
        <button onClick={() => handleAction("accept")} disabled={isLoading} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-700 disabled:opacity-50">
          Accepter
        </button>
        <button onClick={() => handleAction("reject")} disabled={isLoading} className="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-100 disabled:opacity-50">
          Refuser
        </button>
      </div>
    )
  }

  return (
    <button onClick={() => handleAction("revoke")} disabled={isLoading} className="bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-200 disabled:opacity-50">
      Révoquer
    </button>
  )
}