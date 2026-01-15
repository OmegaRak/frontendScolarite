import { useState, useCallback } from 'react';
import { utilisateurApi, Utilisateur, AdminAssignment } from '@/lib/api/auth';

export function useUtilisateurs() {
  const [admins, setAdmins] = useState<Utilisateur[]>([]);
  const [searchResults, setSearchResults] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await utilisateurApi.listAdmins();
      setAdmins(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  const searchUsers = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await utilisateurApi.search(query);
      setSearchResults(results);
    } catch (err) {
      console.error('Erreur recherche:', err);
      setSearchResults([]);
    }
  }, []);

  const assignAdmin = useCallback(async (data: AdminAssignment) => {
    setLoading(true);
    setError(null);
    try {
      const result = await utilisateurApi.assignAdmin(data);
      // Rafraîchir la liste des admins
      await fetchAdmins();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'assignation';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchAdmins]);

  const revokeAdmin = useCallback(async (utilisateurId: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await utilisateurApi.revokeAdmin(utilisateurId);
      // Retirer de la liste locale
      setAdmins(prev => prev.filter(a => a.id !== utilisateurId));
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la révocation';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    admins,
    searchResults,
    loading,
    error,
    fetchAdmins,
    searchUsers,
    assignAdmin,
    revokeAdmin,
  };
}
