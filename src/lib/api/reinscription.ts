import { authFetch, tokenStorage } from "../api";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

// ================= TYPES =================
export interface AnneeScolaire {
  id: number;
  libelle: string;
  actif: boolean;
}

export interface Reinscription {
  id: number;
  utilisateur: number;
  utilisateur_nom?: string;
  utilisateur_email?: string;
  annee_scolaire: number;
  annee_libelle?: string;
  concours: number | null;
  concours_nom?: string;
  niveau_actuel: string;
  niveau_vise: string;
  dossier_pdf: string;
  bordereau?: string;
  statut: "EN_ATTENTE" | "VALIDEE" | "REFUSEE";
  date_soumission: string;
  date_modification?: string;
}

export interface ReinscriptionCreate {
  annee_scolaire: number;
  concours: number;
  niveau_actuel: string;
  niveau_vise: string;
  dossier_pdf: File;
  bordereau?: File;
}

export interface ReinscriptionFilters {
  statut?: string;
  niveau_vise?: string;
  annee_scolaire?: string;
  concours?: string;
  search?: string;
}

export interface ResultatNiveau {
  id: number;
  utilisateur: number;
  utilisateur_nom: string;
  niveau: number;
  niveau_nom: string;
  annee_scolaire: number;
  annee_libelle: string;
  moyenne: number;
  admis: boolean;
  remarque: string;
  created_at: string;
}

export interface ResultatConcours {
  id: number;
  concours: number;
  concours_id: number;
  concours_nom: string;
  utilisateur: number;
  utilisateur_id: number;
  utilisateur_first_name: string;
  utilisateur_last_name: string;
  utilisateur_email: string;
  note: number;
  classement?: number;
  admis: boolean;
  date_publication: string;
}

export interface ResultatsMesResultatsResponse {
  concours?: ResultatConcours;
  niveaux?: ResultatNiveau[];
}

export interface ResultatsImportResponse {
  status: string;
  importes: number;
  erreurs: string[];
  resultats: Reinscription[];
}

// ================= API =================
export const reinscriptionApi = {
  // Création ou mise à jour d'une réinscription
// Création ou mise à jour d'une réinscription
create: async (data: ReinscriptionCreate): Promise<Reinscription> => {
  const formData = new FormData();
  formData.append("annee_scolaire", String(data.annee_scolaire));
  formData.append("concours", String(data.concours));
  formData.append("niveau_actuel", data.niveau_actuel);
  formData.append("niveau_vise", data.niveau_vise);
  formData.append("dossier_pdf", data.dossier_pdf);
  if (data.bordereau) formData.append("bordereau", data.bordereau);

  const token = tokenStorage.getAccessToken();
  console.log("🔑 Token présent:", !!token);
  console.log("🔑 Token value:", token?.substring(0, 20) + "...");
  
  if (!token) throw new Error("Non authentifié");

  const res = await fetch(`${API_URL}/reinscription/create/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  console.log("📡 Response status:", res.status);
  console.log("📡 Response headers:", Object.fromEntries(res.headers.entries()));

  if (!res.ok) {
    const err = await res.json();
    console.error("❌ Erreur backend:", err);
    throw new Error(err.error || "Erreur lors de la création/mise à jour");
  }

  return res.json();
},

  // Liste admin avec filtres
  listAdmin: async (filters?: ReinscriptionFilters): Promise<Reinscription[]> => {
    const params = new URLSearchParams();
    if (filters?.statut) params.append("statut", filters.statut);
    if (filters?.niveau_vise) params.append("niveau_vise", filters.niveau_vise);
    if (filters?.annee_scolaire) params.append("annee_scolaire", filters.annee_scolaire);
    if (filters?.concours) params.append("concours", filters.concours);
    if (filters?.search) params.append("search", filters.search);

    const url = `/reinscription/admin/list/${params.toString() ? `?${params.toString()}` : ""}`;
    const res = await authFetch(url);
    if (!res.ok) throw new Error("Erreur lors du chargement des réinscriptions");
    return res.json();
  },

  // Validation admin
  updateStatut: async (id: number, statut: "EN_ATTENTE" | "VALIDEE" | "REFUSEE"): Promise<Reinscription> => {
    const res = await authFetch(`/reinscription/admin/valider/${id}/`, {
      method: "PUT",
      body: JSON.stringify({ statut }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Erreur lors de la validation");
    }
    return res.json();
  },

  getAnnees: async (): Promise<AnneeScolaire[]> => {
    const res = await authFetch("/reinscription/annees/");
    if (!res.ok) throw new Error("Erreur lors du chargement des années scolaires");
    return res.json();
  },

  getNiveaux: async (): Promise<string[]> => {
    const res = await authFetch("/reinscription/niveaux/");
    if (!res.ok) throw new Error("Erreur lors du chargement des niveaux");
    const data = await res.json();
    return data.niveaux || [];
  },

  // Récupérer les résultats de l'utilisateur connecté
  mesResultats: async (): Promise<ResultatsMesResultatsResponse> => {
    const res = await authFetch("/reinscription/mes-resultats/");
    if (!res.ok) throw new Error("Erreur lors du chargement des résultats");
    return res.json();
  },

  // Importer les résultats Excel
  importResultatsExcel: async (file: File): Promise<ResultatsImportResponse> => {
    if (!file.name.match(/\.(xls|xlsx)$/)) {
      throw new Error("Veuillez sélectionner un fichier Excel (.xls ou .xlsx)");
    }

    const formData = new FormData();
    formData.append("fichier", file);

    const token = tokenStorage.getAccessToken();
    if (!token) throw new Error("Non authentifié");

    const res = await fetch(`${API_URL}/reinscription/resultats-niveau/import/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Erreur lors de l'import des résultats");
    }
    return res.json();
  },

  // Publier les résultats
  publishResultats: async (niveau: string, annee: string) => {
    const token = tokenStorage.getAccessToken();
    if (!token) throw new Error("Non authentifié");

    const res = await fetch(`${API_URL}/reinscription/resultats/publish/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ niveau, annee }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Erreur lors de la publication des résultats");
    }
    return res.json();
  },
};
