import { prisma } from "@/lib/prisma"

export default async function AdminAudit() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100, // On affiche les 100 derniers logs
  })

  // On récupère les infos des utilisateurs pour afficher leurs emails
  const users = await prisma.user.findMany({
    select: { id: true, email: true }
  })

  const getUserEmail = (userId: string) => {
    return users.find(u => u.id === userId)?.email || "Inconnu"
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Journal d'Audit (Logs)</h1>
        <p className="text-slate-500 mt-1">Traçabilité de toutes les actions sensibles (Conformité CDP).</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-sm font-semibold text-slate-600">Date & Heure</th>
              <th className="px-6 py-3 text-sm font-semibold text-slate-600">Utilisateur</th>
              <th className="px-6 py-3 text-sm font-semibold text-slate-600">Action</th>
              <th className="px-6 py-3 text-sm font-semibold text-slate-600">Détails</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm text-slate-600">
                  {new Date(log.createdAt).toLocaleString('fr-FR')}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-800">
                  {getUserEmail(log.actorId)}
                </td>
                <td className="px-6 py-4">
                  <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded text-xs font-bold font-mono">
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {log.metadata || `${log.action} sur ${log.targetType}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && (
          <div className="p-8 text-center text-slate-500">Aucun log pour le moment.</div>
        )}
      </div>
    </div>
  )
}