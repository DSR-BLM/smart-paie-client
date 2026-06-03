import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import api from "../../services/api";

interface Props {
  employe: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EmployeModal({ employe, onClose, onSuccess }: Props) {
  const isEdit = !!employe;

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: employe || {
      type_contrat: "CDI", situation_familiale: "CELIBATAIRE",
      nb_enfants_charge: 0, conjoint_a_charge: false, nationalite: "Burkinabè",
    },
  });

  useEffect(() => { if (employe) reset(employe); }, [employe]);

  const mutation = useMutation({
    mutationFn: (data: any) =>
      isEdit ? api.put(`/employes/${employe.id}`, data) : api.post("/employes", data),
    onSuccess: () => {
      toast.success(isEdit ? "Employé mis à jour." : "Employé créé avec succès.");
      onSuccess();
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Erreur lors de l'enregistrement."),
  });

  const sf = watch("situation_familiale");

  const Input = ({ label, name, type = "text", required = false, ...rest }: any) => (
    <div>
      <label className="label">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      <input type={type} className={`input ${errors[name] ? "border-red-500" : ""}`}
        {...register(name, required ? { required: `${label} requis` } : {})} {...rest} />
      {errors[name] && <p className="text-red-500 text-xs mt-1">{(errors[name] as any).message}</p>}
    </div>
  );

  const Select = ({ label, name, options, required = false }: any) => (
    <div>
      <label className="label">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      <select className={`input ${errors[name] ? "border-red-500" : ""}`}
        {...register(name, required ? { required: `${label} requis` } : {})}>
        {options.map(([v, l]: string[]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">{isEdit ? "Modifier l'employé" : "Nouvel employé"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))}>
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Identité */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Identité</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="Matricule" name="matricule" required />
                <Input label="Nom" name="nom" required />
                <Input label="Prénom" name="prenom" required />
                <Input label="Date de naissance" name="date_naissance" type="date" />
                <Select label="Sexe" name="sexe" options={[["M","Masculin"],["F","Féminin"]]} />
                <Input label="Nationalité" name="nationalite" />
              </div>
            </div>

            {/* Situation familiale */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Situation familiale <span className="text-blue-600 font-normal normal-case">(impact sur abattements IUTS)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select label="Situation" name="situation_familiale" required
                  options={[["CELIBATAIRE","Célibataire"],["MARIE","Marié(e)"],["DIVORCE","Divorcé(e)"],["VEUF","Veuf/Veuve"]]} />
                <Input label="Nombre d'enfants à charge" name="nb_enfants_charge" type="number" />
                <div>
                  <label className="label">Conjoint(e) à charge</label>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded" {...register("conjoint_a_charge")}
                      disabled={sf !== "MARIE"} />
                    <span className={`text-sm ${sf !== "MARIE" ? "text-gray-400" : ""}`}>Oui (si marié)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Emploi */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Emploi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Poste occupé" name="poste" required />
                <Input label="Catégorie professionnelle" name="categorie" />
                <Input label="Date d'embauche" name="date_embauche" type="date" required />
                <Select label="Type de contrat" name="type_contrat" required
                  options={[["CDI","CDI"],["CDD","CDD"],["STAGE","Stage"],["CONSULTANT","Consultant"]]} />
                <div>
                  <label className="label">Salaire de base (FCFA)<span className="text-red-500 ml-0.5">*</span></label>
                  <input type="number" min="0" step="100" className={`input ${errors.salaire_base ? "border-red-500" : ""}`}
                    {...register("salaire_base", { required: "Salaire requis", min: { value: 1, message: "Doit être > 0" } })} />
                  {errors.salaire_base && <p className="text-red-500 text-xs mt-1">{(errors.salaire_base as any).message}</p>}
                </div>
              </div>
            </div>

            {/* CNSS / IFU */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">CNSS & Fiscal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Numéro CNSS" name="numero_cnss" />
                <Input label="IFU (Identifiant Fiscal)" name="numero_ifu" />
              </div>
            </div>

            {/* Banque */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Coordonnées bancaires</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Banque" name="banque" />
                <Input label="Numéro de compte" name="numero_compte_bancaire" />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
            <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary">
              {mutation.isPending ? "Enregistrement…" : isEdit ? "Mettre à jour" : "Créer l'employé"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
