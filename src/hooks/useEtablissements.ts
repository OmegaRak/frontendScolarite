import { useState, useCallback } from 'react';
import { etablissementApi, Etablissement, EtablissementCreate } from '@/lib/api/auth';

export function useEtablissements() {
  const [etablissements, setEtablissements] = useState<Etablissement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEtablissements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await etablissementApi.list();
      setEtablissements(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  const createEtablissement = useCallback(async (data: EtablissementCreate) => {
    setLoading(true);
    setError(null);
    try {
      const newEtab = await etablissementApi.create(data);
      setEtablissements(prev => [...prev, newEtab]);
      return newEtab;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la création';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateEtablissement = useCallback(async (id: number, data: Partial<EtablissementCreate>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await etablissementApi.update(id, data);
      setEtablissements(prev => prev.map(e => e.id === id ? updated : e));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteEtablissement = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await etablissementApi.delete(id);
      setEtablissements(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleActif = useCallback(async (id: number, actif: boolean) => {
    return updateEtablissement(id, { actif });
  }, [updateEtablissement]);

  return {
    etablissements,
    loading,
    error,
    fetchEtablissements,
    createEtablissement,
    updateEtablissement,
    deleteEtablissement,
    toggleActif,
  };
}
