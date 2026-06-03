import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Calculator, Lock, AlertTriangle, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { fcfa, moisLabel } from "../../utils/format";
import BulletinDetailModal from "./BulletinDetailModal";

export default function PaiePage() {
  const [periodeId, setPeriodeId] = useState<string>("");
  const [selectedBulletin, setSelectedBulletin] = useState<string | null>(null);
  const [saisies, setSaisies] = useState<Record<string, any>>({});
  const qc = useQueryClient();

  const { data: periodes } = useQuery({
    queryKey: ["periodes"],
    queryFn: () => api.get("/periodes").then((r) => r.data.periodes),
    onSuccess: (d: any[]) => { if (d?.length && !periodeId) setPeriodeId(d[0].id); },
  } as any);

  const periode = periodes?.find((p: any) => p.id === periodeId);
  const estCloturee = periode?.statut === "CLOTURE";

  const { data: employes } = useQuery({
    queryKey: ["employes", "all"],
    queryFn: () => api.get("/employes?limit=200").then((r) => r.data.employes),
  });

  const { data: bulletinsData, refetch: refetchBulletins } = useQuery({
    queryKey: ["bulletins", periodeId],
    queryFn: () => api.get(`/bulletins/periode/${periodeId}`).then((r) => r.data.bulletins),
    enabled: !!periodeId,
  });

  const bulletinMap = (bulletinsData || []).reduce((acc: any, b: any) => {
    acc[b.id_employe] = b;
    return acc;
  }, {});

  const nouvellePeriodeMut = useMutation({
    mutationFn: () => {
      const now = new Date();
      return api.post("/periodes", { annee: now.getFullYear(), mois: now.getMonth() + 1 });
    },
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["periodes"] });
      setPeriodeId(r.data.periode.id);
      toast.success("Nouvelle période créée.");
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Erreur"),
  });

  const calculerMut = useMutation({
    mutationFn: (payload: any) => api.post("/bulletins/calculer", payload),
    onSuccess: () => { refetchBulletins(); toast.success("Bulletin calculé."); },
    onError: (e: any) => toast.error(e.response?.data?.message || "Erreur de calcul"),
  });

  const cloturerMut = useMutation({
    mutationFn: () => api.post(`/bulletins/periode/${periodeId}/cloturer`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["periodes"] });
      refetchBulletins();
      toast.success("Période clôturée avec succès. Les données sont figées.");
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Erreur"),
  });

  const handleSaisie = (employeId: string, field: string, value: string) => {
    setSaisies((prev) => ({
      ...prev,
      [employeId]: { ...(prev[employeId] || {}), [field]: value },
    }));
  };

  const handleCalculer = (emp: any) => {
    const s = saisies[emp.id] || {};
    calculerMut.mutate({
      id_employe: emp.id,
      id_periode: periodeId,
      heures_supp_25: parseFloat(s.hs25 || 0),
      heures_supp_50: parseFloat(s.hs50 || 0),
      jours_absence: parseFloat(s.absences || 0),
      acompte: parseFloat(s.acompte || 0),
    });
  };

  const numInput = (empId: string, field: string, placeholder: string) => (
    <input
      type="number"
      min="0"
      step="0.5"
      className="w-20 text-center border rounded px-1 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
      placeholder={placeholder}
      disabled={estCloturee}
      value={saisies[empId]?.[field] ?? bulletinMap[empId]?.[field === "hs25" ? "heures_supp_25" : field === "hs50" ? "heures_supp_50" : field === "absences" ? "jours_absence" : "acompte"] ?? ""}
      onChange={(e) => handleSaisie(empId, field, e.target.value)}
    />
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion de la Paie</h1>
          <p className="text-gray-500 text-sm mt-0.5">Saisie mensuelle et calcul des bulletins</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => nouvellePeriodeMut.mutate()} className="btn-secondary" disabled={nouvellePeriodeMut.isPending}>
            <Plus size={16} /> Nouvelle période
          </button>
          {periodeId && !estCloturee && (
            <button
              onClick={() => { if (confirm("Clôturer cette période ? Les données seront figées définitivement.")) cloturerMut.mutate(); }}
              className="btn bg-orange-600 text-white hover:bg-orange-700"
              disabled={cloturerMut.isPending}
            >
              <Lock size={16} /> Clôturer la période
            </button>
          )}
        </div>
      </div>

      {/* Sélecteur de période */}
      <div className="card mb-5">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <label className="label text-xs">Période de paie</label>
            <select className="input w-auto" value={periodeId} onChange={(e) => setPeriodeId(e.target.value)}>
              {!periodes?.length && <option value="">— Aucune période —</option>}
              {periodes?.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {moisLabel(p.mois, p.annee)} — {p.statut}
                </option>
              ))}
            </select>
          </div>

          {periode && (
            <div className="flex items-center gap-3 mt-4">
              <span className={`badge ${periode.statut === "CLOTURE" ? "badge-gray" : periode.statut === "VALIDE" ? "badge-green" : "badge-yellow"}`}>
                {periode.statut}
              </span>
              {estCloturee && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <CheckCircle size={13} className="text-green-500" />
                  Données figées — lecture seule
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Avertissement clôture */}
      {estCloturee && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-600 mt-0.5 shrink-0" />
          <div className="text-sm">
            <strong className="text-amber-800">Période clôturée</strong>
            <p className="text-amber-700 mt-0.5">
              FSP figé : <strong>{periode?.fsp_actif_snapshot ? `${(parseFloat(periode.fsp_taux_snapshot) * 100).toFixed(1)}%` : "Non actif"}</strong>.
              Aucune modification n'est possible sur cette période.
            </p>
          </div>
        </div>
      )}

      {/* Tableau de saisie type tableur */}
      {periodeId && (
        <div className="card p-0 overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">Saisie mensuelle — {periode ? moisLabel(periode.mois, periode.annee) : ""}</h2>
            <span className="text-xs text-gray-400">{employes?.length ?? 0} employé(s)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-blue-900 text-white sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Employé</th>
                  <th className="px-3 py-3 text-center font-medium">Base (FCFA)</th>
                  <th className="px-3 py-3 text-center font-medium">H.Sup 25%</th>
                  <th className="px-3 py-3 text-center font-medium">H.Sup 50%</th>
                  <th className="px-3 py-3 text-center font-medium">Absences (j)</th>
                  <th className="px-3 py-3 text-center font-medium">Acompte</th>
                  <th className="px-3 py-3 text-center font-medium text-green-300">Net à payer</th>
                  <th className="px-3 py-3 text-center font-medium text-yellow-300">IUTS</th>
                  <th className="px-3 py-3 text-center font-medium text-orange-300">FSP</th>
                  <th className="px-3 py-3 text-center font-medium">Statut</th>
                  <th className="px-3 py-3 text-center font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {employes?.map((emp: any) => {
                  const b = bulletinMap[emp.id];
                  return (
                    <tr key={emp.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-4 py-2.5">
                        <div className="font-medium text-gray-900">{emp.nom} {emp.prenom}</div>
                        <div className="text-gray-400 font-mono">{emp.matricule}</div>
                      </td>
                      <td className="px-3 py-2.5 text-center text-gray-600 font-mono">
                        {new Intl.NumberFormat("fr-FR").format(parseFloat(emp.salaire_base))}
                      </td>
                      <td className="px-2 py-2.5 text-center">{numInput(emp.id, "hs25", "0")}</td>
                      <td className="px-2 py-2.5 text-center">{numInput(emp.id, "hs50", "0")}</td>
                      <td className="px-2 py-2.5 text-center">{numInput(emp.id, "absences", "0")}</td>
                      <td className="px-2 py-2.5 text-center">{numInput(emp.id, "acompte", "0")}</td>
                      <td className="px-3 py-2.5 text-center font-semibold text-green-700">
                        {b ? new Intl.NumberFormat("fr-FR").format(Math.round(parseFloat(b.salaire_net_a_payer))) : "—"}
                      </td>
                      <td className="px-3 py-2.5 text-center text-orange-600">
                        {b ? new Intl.NumberFormat("fr-FR").format(Math.round(parseFloat(b.montant_iuts))) : "—"}
                      </td>
                      <td className="px-3 py-2.5 text-center text-red-600">
                        {b ? (parseFloat(b.montant_fsp) > 0
                          ? new Intl.NumberFormat("fr-FR").format(Math.round(parseFloat(b.montant_fsp)))
                          : <span className="text-gray-300">0</span>) : "—"}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {b ? <span className={`badge ${b.statut === "CLOTURE" ? "badge-gray" : b.statut === "VALIDE" ? "badge-green" : "badge-yellow"}`}>{b.statut}</span> : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <div className="flex gap-1 justify-center">
                          {!estCloturee && (
                            <button
                              onClick={() => handleCalculer(emp)}
                              disabled={calculerMut.isPending}
                              className="btn bg-blue-600 text-white hover:bg-blue-700 text-xs px-2 py-1"
                              title="Calculer"
                            >
                              <Calculator size={12} />
                            </button>
                          )}
                          {b && (
                            <button
                              onClick={() => setSelectedBulletin(b.id)}
                              className="btn-secondary text-xs px-2 py-1"
                              title="Détail"
                            >
                              Détail
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!employes?.length && (
                  <tr><td colSpan={11} className="text-center py-8 text-gray-400">Aucun employé. Créez-en depuis la section Employés.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedBulletin && (
        <BulletinDetailModal bulletinId={selectedBulletin} onClose={() => setSelectedBulletin(null)} />
      )}
    </div>
  );
}
