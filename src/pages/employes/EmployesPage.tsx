import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Edit, Archive, ChevronLeft, ChevronRight, User } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { fcfa, formatDate } from "../../utils/format";
import EmployeModal from "./EmployeModal";

export default function EmployesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["employes", page, search],
    queryFn: () =>
      api.get(`/employes?page=${page}&limit=15&search=${encodeURIComponent(search)}`).then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const archiveMut = useMutation({
    mutationFn: (id: string) => api.delete(`/employes/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employes"] });
      toast.success("Employé archivé.");
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Erreur"),
  });

  const handleEdit = (emp: any) => { setSelected(emp); setModalOpen(true); };
  const handleNew = () => { setSelected(null); setModalOpen(true); };

  const contractBadge: Record<string, string> = {
    CDI: "badge-green", CDD: "badge-blue", STAGE: "badge-yellow", CONSULTANT: "badge-gray",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employés</h1>
          <p className="text-gray-500 text-sm mt-0.5">Gestion du fichier RH — {data?.total ?? 0} employé(s)</p>
        </div>
        <button onClick={handleNew} className="btn-primary">
          <Plus size={16} /> Nouvel employé
        </button>
      </div>

      {/* Recherche */}
      <div className="card mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            className="input pl-9"
            placeholder="Rechercher par nom, prénom ou matricule…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {["Matricule","Nom & Prénom","Poste","Contrat","Salaire base","Ancienneté","Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading && (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Chargement…</td></tr>
              )}
              {!isLoading && data?.employes?.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">
                  <User size={32} className="mx-auto mb-2 opacity-30" />
                  Aucun employé trouvé
                </td></tr>
              )}
              {data?.employes?.map((emp: any) => (
                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-medium text-blue-700">{emp.matricule}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{emp.nom} {emp.prenom}</div>
                    <div className="text-xs text-gray-400">{emp.numero_cnss ? `CNSS: ${emp.numero_cnss}` : "CNSS non renseigné"}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{emp.poste}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${contractBadge[emp.type_contrat] || "badge-gray"}`}>{emp.type_contrat}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">{fcfa(emp.salaire_base)}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {emp.anciennete ? `${emp.anciennete.annees} an(s) ${emp.anciennete.mois_restants} mois` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(emp)} className="btn-secondary text-xs px-2 py-1" title="Modifier">
                        <Edit size={13} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Archiver ${emp.prenom} ${emp.nom} ?`))
                            archiveMut.mutate(emp.id);
                        }}
                        className="btn text-xs px-2 py-1 text-red-600 border border-red-200 hover:bg-red-50"
                        title="Archiver"
                      >
                        <Archive size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50 text-sm">
            <span className="text-gray-500">Page {data.page} / {data.pages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-2 py-1">
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= data.pages} className="btn-secondary px-2 py-1">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <EmployeModal
          employe={selected}
          onClose={() => setModalOpen(false)}
          onSuccess={() => { setModalOpen(false); qc.invalidateQueries({ queryKey: ["employes"] }); }}
        />
      )}
    </div>
  );
}
