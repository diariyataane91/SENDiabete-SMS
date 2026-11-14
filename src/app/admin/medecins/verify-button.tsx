"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function VerifyButton({ doctorId }: { doctorId: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleVerify = async () => {
    setIsLoading(true)
    await fetch(`/api/admin/medecins/${doctorId}/verify`, { method: "POST" })
    router.refresh()
    setIsLoading(false)
  }

  return (
    <button onClick={handleVerify} disabled={isLoading} className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
      {isLoading ? "..." : "Valider le compte"}
    </button>
  )
}