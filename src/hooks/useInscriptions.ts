import { useState, useEffect, useCallback } from 'react';
import { inscriptionApi, InscriptionConcours } from '@/lib/api/inscription';

export function useInscriptions() {
  const [inscriptions, setInscriptions] = useState<InscriptionConcours[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInscriptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await inscriptionApi.list();
      setInscriptions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInscriptions();
  }, [fetchInscriptions]);

  const createInscription = async (
    concoursId: number,
    justificatif?: File,
    numeroInscription?: string  // ➕ numéro ajouté
  ) => {
    const newInscription = await inscriptionApi.create(
      concoursId,
      justificatif,
      numeroInscription
    );
    setInscriptions(prev => [newInscription, ...prev]);
    return newInscription;
  };

  const updateStatus = async (id: number, statut: 'EN_ATTENTE' | 'VALIDÉ' | 'ANNULÉ') => {
    const updated = await inscriptionApi.updateStatus(id, statut);
    setInscriptions(prev => prev.map(i => i.id === id ? updated : i));
    return updated;
  };

  return { inscriptions, loading, error, refetch: fetchInscriptions, createInscription, updateStatus };
}
