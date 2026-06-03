import { useQuery } from "@tanstack/react-query";
import { X, FileDown } from "lucide-react";
import api from "../../services/api";
import { fcfa, pct, MOIS } from "../../utils/format";

interface Props {
  bulletinId: string;
  onClose: () => void;
}

function Ligne({ label, montant, highlight = false, debit = false, subline = false }: any) {
  return (
    <tr className={`${highlight ? "bg-blue-50 font-semibold" : ""} ${subline ? "text-gray-400 text-xs" : ""}`}>
      <td className={`py-1.5 pl-3 pr-4 ${subline ? "pl-6" : ""}`}>{label}</td>
      <td className={`py-1.5 pr-3 text-right font-mono ${debit ? "text-red-600" : highlight ? "text-blue-800" : "text-gray-800"}`}>
        {debit && montant > 0 ? `- ${new Intl.NumberFormat("fr-FR").format(Math.round(montant))}` : new Intl.NumberFormat("fr-FR").format(Math.round(montant))}
      </td>
    </tr>
  );
}

export default function BulletinDetailModal({ bulletinId, onClose }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ["bulletin", bulletinId],
    queryFn: () => api.get(`/bulletins/${bulletinId}`).then((r) => r.data.bulletin),
  });

  const b = data;
  const moisLabel = b ? `${MOIS[(b.periode?.mois || 1) - 1]} ${b.periode?.annee}` : "";

  const handleDownloadPDF = () => {
    window.open(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api"}/export/bulletin/${bulletinId}/pdf`, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-blue-900 text-white rounded-t-2xl">
          <div>
            <h2 className="font-semibold">Bulletin de paie</h2>
            {b && <p className="text-blue-200 text-sm">{b.employe?.nom} {b.employe?.prenom} — {moisLabel}</p>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleDownloadPDF} className="flex items-center gap-1.5 text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors">
              <FileDown size={15} /> PDF
            </button>
            <button onClick={onClose} className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/20">
              <X size={20} />
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="p-12 text-center text-gray-400">Chargement du bulletin…</div>
        )}

        {b && (
          <div className="p-6 max-h-[75vh] overflow-y-auto">
            {/* Infos employé */}
            <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-4 mb-5 text-sm">
              <div><span className="text-gray-500">Matricule :</span> <strong>{b.employe?.matricule}</strong></div>
              <div><span className="text-gray-500">Poste :</span> <strong>{b.employe?.poste}</strong></div>
              <div><span className="text-gray-500">Contrat :</span> <strong>{b.employe?.type_contrat}</strong></div>
              <div><span className="text-gray-500">N° CNSS :</span> <strong>{b.employe?.numero_cnss || "—"}</strong></div>
              <div><span className="text-gray-500">Situation :</span> <strong>{b.employe?.situation_familiale}</strong></div>
              <div><span className="text-gray-500">Enfants :</span> <strong>{b.employe?.nb_enfants_charge}</strong></div>
            </div>

            {/* Tableau de calcul */}
            <table className="w-full text-sm border rounded-xl overflow-hidden">
              <thead><tr className="bg-gray-100">
                <th className="text-left py-2 pl-3 font-medium text-gray-600">Désignation</th>
                <th className="text-right py-2 pr-3 font-medium text-gray-600">Montant (FCFA)</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="bg-blue-900 text-white text-xs">
                  <td colSpan={2} className="py-1.5 pl-3 font-semibold tracking-wide">GAINS</td>
                </tr>
                <Ligne label="Salaire de base" montant={parseFloat(b.employe?.salaire_base)} />
                {parseFloat(b.heures_supp_25) > 0 && <Ligne label={`Heures sup. 25% (${b.heures_supp_25}h)`} montant={parseFloat(b.detail_hs25 || 0)} subline />}
                {parseFloat(b.heures_supp_50) > 0 && <Ligne label={`Heures sup. 50% (${b.heures_supp_50}h)`} montant={parseFloat(b.detail_hs50 || 0)} subline />}
                {(b.lignes || []).filter((l: any) => l.type_rubrique === "GAIN").map((l: any) => (
                  <Ligne key={l.id} label={l.libelle_snapshot} montant={parseFloat(l.montant)} subline />
                ))}
                {parseFloat(b.detail_absence || 0) > 0 && (
                  <Ligne label={`Absences (${b.jours_absence}j)`} montant={parseFloat(b.detail_absence)} debit />
                )}
                <Ligne label="SALAIRE BRUT" montant={parseFloat(b.salaire_brut)} highlight />

                <tr className="bg-blue-900 text-white text-xs">
                  <td colSpan={2} className="py-1.5 pl-3 font-semibold tracking-wide">COTISATIONS & RETENUES</td>
                </tr>
                <Ligne label="CNSS salariale (5,5%)" montant={parseFloat(b.montant_cnss_salarial)} debit />
                <Ligne label="Salaire Net Fiscal" montant={parseFloat(b.salaire_net_fiscal)} highlight />
                <Ligne label={`Abattement IUTS (${b.employe?.nb_enfants_charge} enfant(s)${b.employe?.conjoint_a_charge ? " + conjoint" : ""})`}
                  montant={parseFloat(b.abattement_iuts_total)} subline />
                <Ligne label={`Base imposable IUTS`} montant={parseFloat(b.base_imposable_iuts)} subline />
                <Ligne label="IUTS (progressif)" montant={parseFloat(b.montant_iuts)} debit />
                <Ligne label="Salaire Net Intermédiaire" montant={parseFloat(b.salaire_net_intermediaire)} highlight />

                {parseFloat(b.montant_fsp) > 0 && (
                  <>
                    <tr className="bg-amber-50">
                      <td className="py-1.5 pl-3 text-amber-800 font-medium">
                        Retenue FSP — {(parseFloat(b.fsp_taux_applique) * 100).toFixed(1)}%
                        <span className="ml-2 text-xs font-normal text-amber-600">(sur Net Intermédiaire)</span>
                      </td>
                      <td className="py-1.5 pr-3 text-right font-mono text-red-600">
                        - {new Intl.NumberFormat("fr-FR").format(Math.round(parseFloat(b.montant_fsp)))}
                      </td>
                    </tr>
                  </>
                )}
                {(b.lignes || []).filter((l: any) => l.type_rubrique === "RETENUE").map((l: any) => (
                  <Ligne key={l.id} label={l.libelle_snapshot} montant={parseFloat(l.montant)} debit subline />
                ))}
                {parseFloat(b.acompte) > 0 && <Ligne label="Acompte sur salaire" montant={parseFloat(b.acompte)} debit />}
              </tbody>
              <tfoot>
                <tr className="bg-blue-900 text-white">
                  <td className="py-3 pl-3 font-bold text-base">NET À PAYER</td>
                  <td className="py-3 pr-3 text-right font-bold text-base font-mono">
                    {new Intl.NumberFormat("fr-FR").format(Math.round(parseFloat(b.salaire_net_a_payer)))} FCFA
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* CNSS patronale */}
            <div className="mt-4 bg-gray-50 rounded-lg p-3 text-xs text-gray-500 flex justify-between">
              <span>CNSS patronale (charge employeur — 16%) :</span>
              <strong className="text-gray-700">{fcfa(b.montant_cnss_patronal)}</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
