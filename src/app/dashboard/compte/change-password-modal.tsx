"use client"

import { useState } from "react"

export default function ChangePasswordModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (newPassword !== confirmPassword) {
      setError("Les nouveaux mots de passe ne correspondent pas.")
      return
    }

    setIsLoading(true)

    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldPassword, newPassword })
    })

    const data = await res.json()

    if (res.ok) {
      setSuccess("Mot de passe modifié avec succès !")
      setOldPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setTimeout(() => {
        setIsOpen(false)
        setSuccess("")
      }, 2000)
    } else {
      setError(data.error)
    }
    
    setIsLoading(false)
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors"
      >
        Modifier le mot de passe
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Changer de mot de passe</h3>
            
            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
            {success && <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ancien mot de passe</label>
                <input required type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nouveau mot de passe</label>
                <input required type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500" placeholder="Min. 6 caractères" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirmer le nouveau mot de passe</label>
                <input required type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500" />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsOpen(false)} className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-lg text-sm font-medium hover:bg-slate-200">
                  Annuler
                </button>
                <button type="submit" disabled={isLoading} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                  {isLoading ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}