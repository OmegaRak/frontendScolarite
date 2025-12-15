import { useState, useEffect, useCallback } from 'react';
import { concoursApi, Concours } from '@/lib/api/inscription';

export function useConcours() {
  const [concours, setConcours] = useState<Concours[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConcours = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await concoursApi.list();
      setConcours(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConcours();
  }, [fetchConcours]);

  const createConcours = async (data: Omit<Concours, 'id' | 'created_at'>) => {
    const newConcours = await concoursApi.create(data);
    setConcours(prev => [newConcours, ...prev]);
    return newConcours;
  };

  const updateConcours = async (id: number, data: Partial<Concours>) => {
    const updated = await concoursApi.update(id, data);
    setConcours(prev => prev.map(c => c.id === id ? updated : c));
    return updated;
  };

  const deleteConcours = async (id: number) => {
    await concoursApi.delete(id);
    setConcours(prev => prev.filter(c => c.id !== id));
  };

  return {
    concours,
    loading,
    error,
    refetch: fetchConcours,
    createConcours,
    updateConcours,
    deleteConcours,
  };
}
