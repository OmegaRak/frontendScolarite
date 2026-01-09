import { useState, useEffect, useCallback } from 'react';
import { resultatsApi, ResultatConcours } from '@/lib/api/inscription';

export function useResultats() {
  const [resultats, setResultats] = useState<ResultatConcours[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResultats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await resultatsApi.list();
      setResultats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResultats();
  }, [fetchResultats]);

  const importResultats = async (fichier: File) => {
    const result = await resultatsApi.import(fichier);
    await fetchResultats(); // Rafraîchir après import
    return result;
  };

  return {
    resultats,
    loading,
    error,
    refetch: fetchResultats,
    importResultats,
  };
}
