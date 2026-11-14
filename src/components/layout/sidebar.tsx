"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Sidebar() {
  const pathname = usePathname()

  const links = [
  { name: "Tableau de bord", href: "/dashboard", icon: "📊" },
  { name: "Patients", href: "/dashboard/patients", icon: "👥" },
  { name: "Alertes", href: "/dashboard/alertes", icon: "🚨" },
  { name: "Délégations", href: "/dashboard/delegations", icon: "🤝" },
  { name: "Mon Compte", href: "/dashboard/compte", icon: "⚙️" },
]

  return (
    <aside className="w-64 bg-blue-900 text-white min-h-screen flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-extrabold tracking-tight">MediSuivi</h1>
        <p className="text-blue-300 text-xs mt-1">par SEN'Diabète</p>
      </div>

      <nav className="flex-1 mt-4 space-y-1 px-3">
        {links.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-blue-800 text-white" 
                  : "text-blue-100 hover:bg-blue-800 hover:text-white"
              }`}
            >
              <span>{link.icon}</span>
              {link.name}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}