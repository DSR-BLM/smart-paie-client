import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, FileText, Settings,
  Download, LogOut, ChevronRight, Building2, Shield,
} from "lucide-react";
import { useAuthStore } from "../../store/auth.store";
import api from "../../services/api";
import toast from "react-hot-toast";

const navItems = [
  { to: "/dashboard",  label: "Tableau de bord",  icon: LayoutDashboard, roles: ["SUPER_ADMIN","ADMIN_ENTREPRISE","COMPTABLE","EMPLOYE"] },
  { to: "/employes",   label: "Employés",          icon: Users,            roles: ["SUPER_ADMIN","ADMIN_ENTREPRISE","COMPTABLE"] },
  { to: "/paie",       label: "Gestion de la Paie",icon: FileText,         roles: ["SUPER_ADMIN","ADMIN_ENTREPRISE","COMPTABLE"] },
  { to: "/exports",    label: "Exports & PDF",     icon: Download,         roles: ["SUPER_ADMIN","ADMIN_ENTREPRISE","COMPTABLE"] },
  { to: "/config",     label: "Configuration",     icon: Settings,         roles: ["SUPER_ADMIN"] },
  { to: "/entreprises",label: "Entreprises",       icon: Building2,        roles: ["SUPER_ADMIN"] },
];

export default function Sidebar() {
  const { utilisateur, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await api.post("/auth/logout"); } catch { /* ignore */ }
    logout();
    navigate("/login");
    toast.success("Déconnecté avec succès.");
  };

  const filtered = navItems.filter((n) =>
    utilisateur?.role ? n.roles.includes(utilisateur.role) : false
  );

  const roleLabel: Record<string, string> = {
    SUPER_ADMIN: "Super Administrateur",
    ADMIN_ENTREPRISE: "Admin Entreprise",
    COMPTABLE: "Comptable",
    EMPLOYE: "Employé",
  };

  return (
    <aside className="w-64 min-h-screen bg-blue-900 text-white flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-blue-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
            <span className="text-sm font-black text-blue-800">SP</span>
          </div>
          <div>
            <p className="font-bold text-sm">SMART-PAIE</p>
            <p className="text-blue-300 text-xs">Burkina Faso 🇧🇫</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {filtered.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                isActive
                  ? "bg-white text-blue-900 shadow"
                  : "text-blue-200 hover:bg-blue-800 hover:text-white"
              }`
            }
          >
            <item.icon size={18} />
            <span className="flex-1">{item.label}</span>
            <ChevronRight size={14} className="opacity-0 group-hover:opacity-50 transition-opacity" />
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-blue-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-xs font-bold">
            {utilisateur?.prenom?.[0]}{utilisateur?.nom?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{utilisateur?.prenom} {utilisateur?.nom}</p>
            <p className="text-xs text-blue-300 truncate">{roleLabel[utilisateur?.role || ""] || utilisateur?.role}</p>
          </div>
          {utilisateur?.role === "SUPER_ADMIN" && <Shield size={14} className="text-yellow-400" />}
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-blue-300 hover:bg-blue-800 hover:text-white transition-all"
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
