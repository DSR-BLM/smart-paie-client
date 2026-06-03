import { create } from "zustand";

export interface Utilisateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN_ENTREPRISE" | "COMPTABLE" | "EMPLOYE";
  id_entreprise: string | null;
}

interface AuthStore {
  token: string | null;
  utilisateur: Utilisateur | null;
  setAuth: (token: string, utilisateur: Utilisateur) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  hasRole: (...roles: string[]) => boolean;
}

const parseUser = (): Utilisateur | null => {
  try {
    const u = localStorage.getItem("smart_paie_user");
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  token: localStorage.getItem("smart_paie_token"),
  utilisateur: parseUser(),
  setAuth: (token, utilisateur) => {
    localStorage.setItem("smart_paie_token", token);
    localStorage.setItem("smart_paie_user", JSON.stringify(utilisateur));
    set({ token, utilisateur });
  },
  logout: () => {
    localStorage.removeItem("smart_paie_token");
    localStorage.removeItem("smart_paie_user");
    set({ token: null, utilisateur: null });
  },
  isAuthenticated: () => !!get().token && !!get().utilisateur,
  hasRole: (...roles) => {
    const role = get().utilisateur?.role;
    return role ? roles.includes(role) : false;
  },
}));
