import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { LogIn, Eye, EyeOff } from "lucide-react";
import api from "../../services/api";
import { useAuthStore } from "../../store/auth.store";

interface LoginForm {
  email: string;
  mot_de_passe: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", data);
      setAuth(res.data.token, res.data.utilisateur);
      toast.success(`Bienvenue, ${res.data.utilisateur.prenom} !`);
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Connexion impossible. Vérifiez vos identifiants.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <span className="text-2xl font-black text-blue-800">SP</span>
          </div>
          <h1 className="text-3xl font-bold text-white">SMART-PAIE</h1>
          <p className="text-blue-200 mt-1 text-sm">Gestion de la Paie — Burkina Faso 🇧🇫</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Connexion</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label">Adresse e-mail</label>
              <input
                type="email"
                className={`input ${errors.email ? "border-red-500" : ""}`}
                placeholder="admin@entreprise.bf"
                {...register("email", {
                  required: "E-mail requis",
                  pattern: { value: /^\S+@\S+\.\S+$/, message: "E-mail invalide" },
                })}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  className={`input pr-10 ${errors.mot_de_passe ? "border-red-500" : ""}`}
                  placeholder="••••••••"
                  {...register("mot_de_passe", { required: "Mot de passe requis" })}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.mot_de_passe && (
                <p className="text-red-500 text-xs mt-1">{errors.mot_de_passe.message}</p>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              <LogIn size={16} />
              {loading ? "Connexion en cours..." : "Se connecter"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            SMART-PAIE v1.0 — Conforme à la législation du Burkina Faso
          </p>
        </div>
      </div>
    </div>
  );
}
