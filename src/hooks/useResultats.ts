import { useState, useEffect, useCallback } from "react";
import { reinscriptionApi, ResultatsMesResultatsResponse, ResultatConcours, ResultatNiveau } from "@/lib/api/reinscription";

export function useResultats() {
  const [concours, setConcours] = useState<ResultatConcours | null>(null);
  const [niveaux, setNiveaux] = useState<ResultatNiveau[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResultats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data: ResultatsMesResultatsResponse = await reinscriptionApi.mesResultats();

      if (data.concours) setConcours(data.concours);
      if (data.niveaux) setNiveaux(data.niveaux);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement des résultats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResultats();
  }, [fetchResultats]);

  return {
    concours,
    niveaux,
    loading,
    error,
    refetch: fetchResultats,
  };
}
