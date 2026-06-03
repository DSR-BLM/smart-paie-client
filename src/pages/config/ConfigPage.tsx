import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Save, ToggleLeft, ToggleRight, Shield, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { pct } from "../../utils/format";

export default function ConfigPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<"fiscal" | "cnss" | "iuts">("fiscal");

  const { data, isLoading } = useQuery({
    queryKey: ["config"],
    queryFn: () => api.get("/config").then((r) => r.data.configuration),
  });

  const { register, handleSubmit, watch, setValue } = useForm({ values: data });
  const fspActif = watch("fsp_actif");

  const updateMut = useMutation({
    mutationFn: (body: any) => api.put(`/config/${data?.id}`, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["config"] }); toast.success("Configuration mise à jour."); },
    onError: (e: any) => toast.error(e.response?.data?.message || "Erreur"),
  });

  const tabs = [
    { id: "fiscal", label: "FSP & Taxes" },
    { id: "cnss", label: "CNSS" },
    { id: "iuts", label: "Barème IUTS" },
  ];

  if (isLoading) return <div className="text-center py-12 text-gray-400">Chargement…</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Shield size={22} className="text-blue-600" /> Configuration légale
        </h1>
        <p className="text-gray-500 text-sm mt-1">Paramètres fiscaux et sociaux — Burkina Faso</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
        <p className="text-sm text-amber-800">
          Toute modification de ces paramètres est auditée et horodatée. Les taux en vigueur au moment de la clôture d'une période sont figés définitivement dans les bulletins.
        </p>
      </div>

      {/* Onglets */}
      <div className="flex gap-2 mb-5">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t.id ? "bg-blue-700 text-white" : "bg-white border text-gray-600 hover:bg-gray-50"}`}>
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit((d) => updateMut.mutate(d))}>

        {/* ── Onglet FSP ── */}
        {activeTab === "fiscal" && (
          <div className="card space-y-6">
            <div>
              <h2 className="text-base font-semibold mb-1">Fonds de Soutien Patriotique (FSP)</h2>
              <p className="text-sm text-gray-500 mb-4">La retenue FSP se calcule sur le Salaire Net Intermédiaire (après IUTS), jamais sur le brut.</p>

              {/* Toggle FSP */}
              <div className="flex items-center justify-between p-4 border rounded-xl mb-4">
                <div>
                  <p className="font-medium">Activer la retenue FSP</p>
                  <p className="text-sm text-gray-500">Appliqué à tous les bulletins de la période en cours</p>
                </div>
                <button type="button" onClick={() => setValue("fsp_actif", !fspActif)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${fspActif ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-600"}`}>
                  {fspActif ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  {fspActif ? "Actif" : "Inactif"}
                </button>
              </div>

              {/* Taux FSP */}
              <div className={`transition-opacity ${fspActif ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
                <label className="label">Taux FSP (%)<span className="text-red-500 ml-0.5">*</span></label>
                <div className="flex items-center gap-3">
                  <input type="number" step="0.01" min="0" max="100" className="input w-36"
                    {...register("fsp_taux_pct", {
                      setValueAs: (v) => parseFloat(v) / 100,
                      value: parseFloat(data?.fsp_taux || 0) * 100,
                    })} />
                  <span className="text-gray-500 text-sm">% du Salaire Net Intermédiaire</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Valeur actuelle en base : {pct(data?.fsp_taux)}</p>
              </div>

              {/* Libellé FSP */}
              <div className="mt-4">
                <label className="label">Libellé sur le bulletin</label>
                <input className="input max-w-sm" {...register("fsp_libelle")} />
              </div>
            </div>

            {/* Abattements IUTS */}
            <div className="border-t pt-5">
              <h2 className="text-base font-semibold mb-1">Abattements IUTS (situation familiale)</h2>
              <p className="text-sm text-gray-500 mb-4">Déduits du Salaire Net Fiscal avant le calcul de l'IUTS progressif.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Abattement de base (FCFA)</label>
                  <input type="number" className="input" {...register("iuts_abattement_base")} />
                </div>
                <div>
                  <label className="label">Par enfant à charge (FCFA)</label>
                  <input type="number" className="input" {...register("iuts_abattement_par_enfant")} />
                </div>
                <div>
                  <label className="label">Conjoint(e) à charge (FCFA)</label>
                  <input type="number" className="input" {...register("iuts_abattement_conjoint")} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Onglet CNSS ── */}
        {activeTab === "cnss" && (
          <div className="card space-y-5">
            <h2 className="text-base font-semibold">Paramètres CNSS</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="label">Taux salarial (%)</label>
                <input type="number" step="0.01" min="0" max="100" className="input"
                  {...register("cnss_taux_salarial_pct", {
                    setValueAs: (v) => parseFloat(v) / 100,
                    value: parseFloat(data?.cnss_taux_salarial || 0) * 100,
                  })} />
                <p className="text-xs text-gray-400 mt-1">Actuel : {pct(data?.cnss_taux_salarial)}</p>
              </div>
              <div>
                <label className="label">Taux patronal (%)</label>
                <input type="number" step="0.01" min="0" max="100" className="input"
                  {...register("cnss_taux_patronal_pct", {
                    setValueAs: (v) => parseFloat(v) / 100,
                    value: parseFloat(data?.cnss_taux_patronal || 0) * 100,
                  })} />
                <p className="text-xs text-gray-400 mt-1">Actuel : {pct(data?.cnss_taux_patronal)}</p>
              </div>
              <div>
                <label className="label">Plafond mensuel (FCFA)</label>
                <input type="number" className="input" {...register("cnss_plafond_mensuel")} />
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded" {...register("cnss_actif")} />
                <span className="text-sm font-medium">CNSS active</span>
              </label>
            </div>
          </div>
        )}

        {/* ── Onglet Barème IUTS ── */}
        {activeTab === "iuts" && (
          <div className="card">
            <h2 className="text-base font-semibold mb-4">Barème IUTS progressif (base annuelle)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium text-gray-500">Tranche</th>
                    <th className="text-right px-4 py-2 font-medium text-gray-500">De (FCFA)</th>
                    <th className="text-right px-4 py-2 font-medium text-gray-500">À (FCFA)</th>
                    <th className="text-right px-4 py-2 font-medium text-gray-500">Taux</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data?.baremes?.map((b: any, i: number) => (
                    <tr key={b.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-2 font-medium">Tranche {b.ordre}</td>
                      <td className="px-4 py-2 text-right font-mono">
                        {new Intl.NumberFormat("fr-FR").format(parseFloat(b.tranche_min))}
                      </td>
                      <td className="px-4 py-2 text-right font-mono">
                        {b.tranche_max ? new Intl.NumberFormat("fr-FR").format(parseFloat(b.tranche_max)) : "∞"}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <span className={`badge ${parseFloat(b.taux) === 0 ? "badge-gray" : "badge-blue"}`}>
                          {pct(b.taux)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Le barème IUTS est basé sur le revenu annualisé. Les tranches officielles sont conformes au Code Général des Impôts du Burkina Faso.
            </p>
          </div>
        )}

        <div className="flex justify-end mt-5">
          <button type="submit" disabled={updateMut.isPending} className="btn-primary">
            <Save size={16} />
            {updateMut.isPending ? "Enregistrement…" : "Sauvegarder la configuration"}
          </button>
        </div>
      </form>
    </div>
  );
}
