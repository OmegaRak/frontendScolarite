// lib/api/inscription.ts
import { authFetch, tokenStorage } from '../api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

// ==================== TYPES ====================

export interface Bachelier {
  id: number;
  numero_inscription: string;
  nom: string;
  prenom: string;
  admis: boolean;
  annee_scolaire: string;
}

export interface Concours {
  id: number;
  nom: string;
  description: string;
  date_debut: string;
  date_fin: string;
  prix: number;
  note_deliberation: number;
  statut: 'DISPONIBLE' | 'INDISPONIBLE';
  created_at: string;
}

export interface InscriptionConcours {
  id: number;
  utilisateur: number;
  utilisateur_id?: number;
  utilisateur_username?: string;
  utilisateur_nom?: string;
  utilisateur_prenom?: string;
  utilisateur_email?: string;
  utilisateur_role?: string;
  concours: number;
  date_inscription: string;
  statut: 'EN_ATTENTE' | 'VALIDÉ' | 'ANNULÉ';
  justificatif_paiement?: string;
  justificatif_paiement_url?: string;
  numero_inscription?: string;
}

export interface ResultatConcours {
  id: number;
  concours: number;
  concours_id?: number;
  concours_nom?: string;
  utilisateur: number;
  utilisateur_id?: number;
  utilisateur_first_name?: string;
  utilisateur_last_name?: string;
  utilisateur_email?: string;
  note: number;
  classement?: number;
  date_publication: string;
  admis: boolean;
}

export interface Candidat {
  id: number;
  utilisateur: number;
  statut_candidature: string;
  date_candidature: string;
}

export interface Etudiant {
  id: number;
  candidat: number;
  matricule: string;
  statut_reinscription: string;
}


export const bacheliersApi = {
  list: async (): Promise<Bachelier[]> => {
    const response = await authFetch('/inscription/bacheliers/');
    if (response.ok) return response.json();
    throw new Error('Erreur lors de la récupération des bacheliers');
  },

  import: async (fichier: File): Promise<{status: string, importes: number, erreurs: string[], resultats: Bachelier[]}> => {
    const formData = new FormData();
    formData.append('fichier', fichier);

    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) throw new Error('Non authentifié');

    const response = await fetch(`${API_BASE_URL}/inscription/resultats-bac/import/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}` },
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Erreur lors de l\'import');
    }

    return response.json();
  }
};

// ==================== API CONCOURS ====================

export const concoursApi = {
  /**
   * Lister tous les concours
   * Accessible à tous (public)
   */
  list: async (): Promise<Concours[]> => {
    try {
      const response = await authFetch('/inscription/concours/');
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Erreur lors de la récupération des concours');
    } catch (error) {
      console.error('Erreur API concours:', error);
      throw error;
    }
  },

  /**
   * Obtenir un concours par ID
   */
  get: async (id: number): Promise<Concours> => {
    const response = await authFetch(`/inscription/concours/${id}/`);
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Concours non trouvé');
  },

  /**
   * Créer un concours (Admin uniquement)
   */
  create: async (data: Omit<Concours, 'id' | 'created_at'>): Promise<Concours> => {
    const response = await authFetch('/inscription/concours/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (response.ok) {
      return await response.json();
    }
    const error = await response.json();
    throw new Error(error.detail || 'Erreur lors de la création du concours');
  },

  /**
   * Modifier un concours (Admin uniquement)
   */
  update: async (id: number, data: Partial<Concours>): Promise<Concours> => {
    const response = await authFetch(`/inscription/concours/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Erreur lors de la mise à jour du concours');
  },

  /**
   * Supprimer un concours (Admin uniquement)
   */
  delete: async (id: number): Promise<void> => {
    const response = await authFetch(`/inscription/concours/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Erreur lors de la suppression du concours');
    }
  },
};

// ==================== API INSCRIPTIONS ====================

export const inscriptionApi = {
  /**
   * Créer une inscription à un concours
   * @param concoursId - ID du concours
   * @param numeroInscription - Numéro d'inscription de l'étudiant
   * @param justificatifPaiement - Fichier justificatif de paiement (optionnel)
   */
  create: async (
    concoursId: number,
    numeroInscription: string,
    justificatifPaiement?: File
  ): Promise<InscriptionConcours> => {
    const formData = new FormData();
    
    // Ajouter les champs dans l'ordre
    formData.append('concours', String(concoursId));
    formData.append('numero_inscription', numeroInscription);
    
    // Ajouter le fichier seulement s'il existe
    if (justificatifPaiement) {
      formData.append('justificatif_paiement', justificatifPaiement);
    }

    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new Error('Non authentifié');
    }

    const response = await fetch(`${API_BASE_URL}/inscription/inscriptions/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (response.ok) {
      return await response.json();
    }
    
    const error = await response.json();
    throw new Error(error.error || error.detail || 'Erreur lors de l\'inscription');
  },

  /**
   * Lister les inscriptions de l'utilisateur connecté
   * Si admin, liste toutes les inscriptions
   */
  list: async (): Promise<InscriptionConcours[]> => {
    const response = await authFetch('/inscription/inscriptions/list/');
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Erreur lors de la récupération des inscriptions');
  },

  /**
   * Mettre à jour le statut d'une inscription (Admin uniquement)
   */
  updateStatus: async (
    id: number,
    statut: 'EN_ATTENTE' | 'VALIDÉ' | 'ANNULÉ'
  ): Promise<InscriptionConcours> => {
    const response = await authFetch(`/inscription/inscriptions/${id}/status/`, {
      method: 'PATCH',
      body: JSON.stringify({ statut }),
    });
    if (response.ok) {
      return await response.json();
    }
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la mise à jour du statut');
  },

  /**
   * Obtenir une inscription par ID
   */
  get: async (id: number): Promise<InscriptionConcours> => {
    const response = await authFetch(`/inscription/inscriptions/${id}/`);
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Inscription non trouvée');
  },
};

// ==================== API RÉSULTATS ====================

export const resultatsApi = {
  /**
   * Lister les résultats de l'utilisateur connecté
   * Si admin, liste tous les résultats
   */
  list: async (): Promise<ResultatConcours[]> => {
    const response = await authFetch('/inscription/resultats/');
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Erreur lors de la récupération des résultats');
  },

  /**
   * Importer les résultats via fichier Excel/CSV (Admin uniquement)
   * @param fichier - Fichier Excel ou CSV avec les colonnes: concours, nom, prenom, note, classement(optionnel)
   */
  import: async (fichier: File): Promise<{
    status: string;
    importes: number;
    erreurs: string[];
    resultats: ResultatConcours[];
  }> => {
    const formData = new FormData();
    formData.append('fichier', fichier);

    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      throw new Error('Non authentifié');
    }

    const response = await fetch(`${API_BASE_URL}/inscription/resultats/import/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (response.ok) {
      return await response.json();
    }
    
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de l\'import des résultats');
  },

  /**
   * Obtenir un résultat par ID
   */
  get: async (id: number): Promise<ResultatConcours> => {
    const response = await authFetch(`/inscription/resultats/${id}/`);
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Résultat non trouvé');
  },
};

// ==================== API CANDIDATS (Admin) ====================

export const candidatApi = {
  /**
   * Lister tous les candidats
   */
  list: async (): Promise<Candidat[]> => {
    const response = await authFetch('/inscription/candidats/');
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Erreur lors de la récupération des candidats');
  },

  /**
   * Créer un candidat
   */
  create: async (data: Partial<Candidat>): Promise<Candidat> => {
    const response = await authFetch('/inscription/candidats/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (response.ok) {
      return await response.json();
    }
    const error = await response.json();
    throw new Error(error.detail || 'Erreur lors de la création du candidat');
  },

  /**
   * Obtenir un candidat par ID
   */
  get: async (id: number): Promise<Candidat> => {
    const response = await authFetch(`/inscription/candidats/${id}/`);
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Candidat non trouvé');
  },
};

// ==================== API ÉTUDIANTS (Admin) ====================

export const etudiantApi = {
  /**
   * Lister tous les étudiants
   */
  list: async (): Promise<Etudiant[]> => {
    const response = await authFetch('/inscription/etudiants/');
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Erreur lors de la récupération des étudiants');
  },

  /**
   * Créer un étudiant
   */
  create: async (data: Partial<Etudiant>): Promise<Etudiant> => {
    const response = await authFetch('/inscription/etudiants/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (response.ok) {
      return await response.json();
    }
    const error = await response.json();
    throw new Error(error.detail || 'Erreur lors de la création de l\'étudiant');
  },

  /**
   * Obtenir un étudiant par ID
   */
  get: async (id: number): Promise<Etudiant> => {
    const response = await authFetch(`/inscription/etudiants/${id}/`);
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Étudiant non trouvé');
  },
};

// ==================== HELPERS ====================

/**
 * Helper pour vérifier si une inscription est validée
 */
export const isInscriptionValidee = (inscription: InscriptionConcours): boolean => {
  return inscription.statut === 'VALIDÉ';
};

/**
 * Helper pour vérifier si un résultat est admis
 */
export const isResultatAdmis = (resultat: ResultatConcours): boolean => {
  return resultat.admis === true;
};

/**
 * Helper pour formater une date d'inscription
 */
export const formatDateInscription = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Helper pour vérifier si un concours est disponible
 */
export const isConcoursDisponible = (concours: Concours): boolean => {
  const now = new Date();
  const dateDebut = new Date(concours.date_debut);
  const dateFin = new Date(concours.date_fin);
  
  return concours.statut === 'DISPONIBLE' && now >= dateDebut && now <= dateFin;
};

/**
 * Helper pour calculer les jours restants avant la fin d'un concours
 */
export const getJoursRestants = (dateFin: string): number => {
  const now = new Date();
  const fin = new Date(dateFin);
  const diff = fin.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};