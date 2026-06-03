import { useQuery } from "@tanstack/react-query";
import { Users, FileText, TrendingUp, AlertCircle, Calendar } from "lucide-react";
import api from "../../services/api";
import { useAuthStore } from "../../store/auth.store";
import { fcfa, moisLabel } from "../../utils/format";

function KpiCard({ title, value, subtitle, icon: Icon, color }: any) {
  return (
    <div className="card flex items-start gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { utilisateur } = useAuthStore();

  const { data: periodes } = useQuery({
    queryKey: ["periodes"],
    queryFn: () => api.get("/periodes").then((r) => r.data.periodes),
    enabled: utilisateur?.role !== "EMPLOYE",
  });

  const { data: employes } = useQuery({
    queryKey: ["employes-count"],
    queryFn: () => api.get("/employes?limit=1").then((r) => r.data),
    enabled: utilisateur?.role !== "EMPLOYE",
  });

  const dernierePeriode = periodes?.[0];
  const now = new Date();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Tableau de bord
        </h1>
        <p className="text-gray-500 mt-1">
          Bonjour, {utilisateur?.prenom} — {now.toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {utilisateur?.role !== "EMPLOYE" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <KpiCard
              title="Employés actifs"
              value={employes?.total ?? "—"}
              subtitle="Fichier RH à jour"
              icon={Users}
              color="bg-blue-600"
            />
            <KpiCard
              title="Périodes de paie"
              value={periodes?.length ?? "—"}
              subtitle="Historique complet"
              icon={Calendar}
              color="bg-purple-600"
            />
            <KpiCard
              title="Période en cours"
              value={dernierePeriode ? moisLabel(dernierePeriode.mois, dernierePeriode.annee) : "—"}
              subtitle={`Statut : ${dernierePeriode?.statut ?? "—"}`}
              icon={FileText}
              color="bg-green-600"
            />
            <KpiCard
              title="Module FSP"
              value={dernierePeriode?.fsp_actif_snapshot ? "Actif" : "Inactif"}
              subtitle="Fonds de Soutien Patriotique"
              icon={TrendingUp}
              color={dernierePeriode?.fsp_actif_snapshot ? "bg-orange-500" : "bg-gray-400"}
            />
          </div>

          {/* Périodes récentes */}
          <div className="card">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Périodes de paie récentes</h2>
            {periodes?.length === 0 ? (
              <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
                <AlertCircle size={16} /> Aucune période créée. Commencez par créer une période dans Gestion de la Paie.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 font-medium text-gray-500">Période</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-500">Statut</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-500">Clôturé le</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-500">FSP snapshot</th>
                    </tr>
                  </thead>
                  <tbody>
                    {periodes?.slice(0, 6).map((p: any) => (
                      <tr key={p.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-2 px-3 font-medium">{moisLabel(p.mois, p.annee)}</td>
                        <td className="py-2 px-3">
                          <span className={`badge ${p.statut === "CLOTURE" ? "badge-gray" : p.statut === "VALIDE" ? "badge-green" : "badge-yellow"}`}>
                            {p.statut}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-gray-500">
                          {p.cloture_le ? new Date(p.cloture_le).toLocaleDateString("fr-FR") : "—"}
                        </td>
                        <td className="py-2 px-3">
                          {p.fsp_actif_snapshot != null
                            ? <span className={`badge ${p.fsp_actif_snapshot ? "badge-yellow" : "badge-gray"}`}>
                                {p.fsp_actif_snapshot ? `${(parseFloat(p.fsp_taux_snapshot) * 100).toFixed(1)}%` : "Non actif"}
                              </span>
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {utilisateur?.role === "EMPLOYE" && (
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="text-blue-600" size={24} />
            <h2 className="text-base font-semibold">Mes bulletins de paie</h2>
          </div>
          <p className="text-gray-500 text-sm">
            Accédez à vos bulletins de paie depuis la section <strong>Exports &amp; PDF</strong> dans le menu de gauche.
          </p>
        </div>
      )}
    </div>
  );
}
