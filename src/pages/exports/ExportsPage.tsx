import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileDown, Sheet, FileText } from "lucide-react";
import api from "../../services/api";
import { moisLabel } from "../../utils/format";
import { useAuthStore } from "../../store/auth.store";

export default function ExportsPage() {
  const { utilisateur } = useAuthStore();
  const [periodeId, setPeriodeId] = useState("");

  const { data: periodes } = useQuery({
    queryKey: ["periodes"],
    queryFn: () => api.get("/periodes").then((r) => r.data.periodes),
  });

  const { data: bulletins } = useQuery({
    queryKey: ["bulletins-export", periodeId],
    queryFn: () => api.get(`/bulletins/periode/${periodeId}`).then((r) => r.data.bulletins),
    enabled: !!periodeId,
  });

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";
  const token = localStorage.getItem("smart_paie_token");

  const downloadWithAuth = (url: string, filename: string) => {
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
      })
      .catch(() => window.open(url, "_blank"));
  };

  const periode = periodes?.find((p: any) => p.id === periodeId);
  const mois = periode ? moisLabel(periode.mois, periode.annee) : "";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileDown size={22} className="text-blue-600" /> Exports & Documents
        </h1>
        <p className="text-gray-500 text-sm mt-1">Téléchargement des bulletins PDF et du journal de paie Excel</p>
      </div>

      {/* Sélecteur période (pour non-employés) */}
      {utilisateur?.role !== "EMPLOYE" && (
        <div className="card mb-6">
          <label className="label">Sélectionner une période</label>
          <select className="input w-auto" value={periodeId} onChange={(e) => setPeriodeId(e.target.value)}>
            <option value="">— Choisir une période —</option>
            {periodes?.map((p: any) => (
              <option key={p.id} value={p.id}>{moisLabel(p.mois, p.annee)} — {p.statut}</option>
            ))}
          </select>
        </div>
      )}

      {/* Export Excel journal */}
      {periodeId && utilisateur?.role !== "EMPLOYE" && (
        <div className="card mb-5">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <Sheet size={24} className="text-green-700" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold">Journal de Paie — {mois}</h2>
              <p className="text-sm text-gray-500 mt-1">
                Fichier Excel complet avec toutes les colonnes obligatoires : Brut, CNSS, IUTS, Net Intermédiaire, <strong>Retenue_FSP</strong>, Net à Payer.
                Compatible avec les logiciels comptables.
              </p>
              <button
                onClick={() => downloadWithAuth(`${baseUrl}/export/periode/${periodeId}/excel`, `journal_paie_${mois}.xlsx`)}
                className="btn-success mt-3"
              >
                <Sheet size={16} /> Télécharger le Journal Excel (.xlsx)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulletins PDF individuels */}
      {periodeId && bulletins?.length > 0 && (
        <div className="card">
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
            <FileText size={18} className="text-blue-600" />
            Bulletins individuels — {mois} ({bulletins.length} bulletins)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-gray-500">Employé</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-500">Poste</th>
                  <th className="text-right px-4 py-2 font-medium text-gray-500">Net à payer</th>
                  <th className="text-center px-4 py-2 font-medium text-gray-500">Statut</th>
                  <th className="text-center px-4 py-2 font-medium text-gray-500">PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {bulletins.map((b: any) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5">
                      <div className="font-medium">{b.employe?.nom} {b.employe?.prenom}</div>
                      <div className="text-xs text-gray-400 font-mono">{b.employe?.matricule}</div>
                    </td>
                    <td className="px-4 py-2.5 text-gray-500">{b.employe?.poste}</td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold text-green-700">
                      {new Intl.NumberFormat("fr-FR").format(Math.round(parseFloat(b.salaire_net_a_payer)))} FCFA
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`badge ${b.statut === "CLOTURE" ? "badge-gray" : b.statut === "VALIDE" ? "badge-green" : "badge-yellow"}`}>
                        {b.statut}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <button
                        onClick={() => downloadWithAuth(
                          `${baseUrl}/export/bulletin/${b.id}/pdf`,
                          `bulletin_${b.employe?.matricule}_${mois}.pdf`
                        )}
                        className="btn-secondary text-xs px-2 py-1"
                      >
                        <FileDown size={13} /> PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!periodeId && utilisateur?.role !== "EMPLOYE" && (
        <div className="card text-center py-12 text-gray-400">
          <FileDown size={40} className="mx-auto mb-3 opacity-30" />
          <p>Sélectionnez une période pour voir les exports disponibles</p>
        </div>
      )}

      {utilisateur?.role === "EMPLOYE" && (
        <div className="card">
          <h2 className="font-semibold mb-3">Mes bulletins de paie</h2>
          <p className="text-sm text-gray-500">Fonctionnalité espace employé — vos bulletins personnels apparaîtront ici.</p>
        </div>
      )}
    </div>
  );
}
