// API Service pour l'authentification et gestion utilisateurs/établissements Django
import { authFetch, tokenStorage } from '../api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

// Types basés sur les modèles Django
export interface Etablissement {
  id: number;
  code: string;
  nom: string;
  ville: string;
  adresse: string;
  email_contact: string;
  telephone: string;
  logo?: string;
  actif: boolean;
  date_creation: string;
  nombre_utilisateurs?: number;
  nombre_admins?: number;
}

export interface EtablissementCreate {
  code: string;
  nom: string;
  ville?: string;
  adresse?: string;
  email_contact?: string;
  telephone?: string;
  actif?: boolean;
}

export interface Utilisateur {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'CANDIDAT' | 'ETUDIANT';
  is_active: boolean;
  etablissement?: number;
  etablissement_details?: Etablissement;
}

export interface AdminAssignment {
  utilisateur_id: number;
  etablissement_id: number;
}

// API Établissements
export const etablissementApi = {
  // Lister tous les établissements (public pour consultation)
  list: async (): Promise<Etablissement[]> => {
    try {
      const response = await authFetch('/auth/etablissements/');
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Erreur lors de la récupération des établissements');
    } catch (error) {
      console.error('Erreur API établissements:', error);
      throw error;
    }
  },

  // Obtenir un établissement par ID
  get: async (id: number): Promise<Etablissement> => {
    const response = await authFetch(`/auth/etablissements/${id}/`);
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Établissement non trouvé');
  },

  // Créer un établissement (SuperAdmin)
  create: async (data: EtablissementCreate): Promise<Etablissement> => {
    const response = await authFetch('/auth/etablissements/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (response.ok) {
      return await response.json();
    }
    const error = await response.json();
    throw new Error(error.detail || 'Erreur lors de la création de l\'établissement');
  },

  // Modifier un établissement (SuperAdmin)
  update: async (id: number, data: Partial<EtablissementCreate>): Promise<Etablissement> => {
    const response = await authFetch(`/auth/etablissements/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Erreur lors de la mise à jour de l\'établissement');
  },

  // Supprimer un établissement (SuperAdmin)
  delete: async (id: number): Promise<void> => {
    const response = await authFetch(`/auth/etablissements/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Erreur lors de la suppression de l\'établissement');
    }
  },
};

// API Utilisateurs (SuperAdmin)
export const utilisateurApi = {
  // Lister tous les admins
  listAdmins: async (): Promise<Utilisateur[]> => {
    const response = await authFetch('/auth/admins/');
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Erreur lors de la récupération des admins');
  },

  // Assigner un utilisateur comme admin d'un établissement
  assignAdmin: async (data: AdminAssignment): Promise<{ message: string; utilisateur: Utilisateur }> => {
    const response = await authFetch('/auth/assign-admin/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (response.ok) {
      return await response.json();
    }
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de l\'assignation');
  },

  // Révoquer le rôle admin d'un utilisateur
  revokeAdmin: async (utilisateurId: number): Promise<{ message: string; utilisateur: Utilisateur }> => {
    const response = await authFetch('/auth/revoke-admin/', {
      method: 'POST',
      body: JSON.stringify({ utilisateur_id: utilisateurId }),
    });
    if (response.ok) {
      return await response.json();
    }
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la révocation');
  },

  // Rechercher des utilisateurs (pour assignation)
  search: async (query: string): Promise<Utilisateur[]> => {
    const response = await authFetch(`/auth/users/search/?q=${encodeURIComponent(query)}`);
    if (response.ok) {
      return await response.json();
    }
    return [];
  },
};
