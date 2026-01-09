import { useEffect, useState, useCallback } from "react";
import {
  reinscriptionApi,
  Reinscription,
  ReinscriptionCreate,
  AnneeScolaire,
  ReinscriptionFilters,
} from "@/lib/api/reinscription";
import { useToast } from "@/hooks/use-toast";

export const useReinscription = () => {
  const [reinscriptions, setReinscriptions] = useState<Reinscription[]>([]);
  const [annees, setAnnees] = useState<AnneeScolaire[]>([]);
  const [niveaux, setNiveaux] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // ✅ Charger les années scolaires
  const fetchAnnees = useCallback(async () => {
    try {
      const data = await reinscriptionApi.getAnnees();
      setAnnees(data);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de charger les années scolaires",
        variant: "destructive",
      });
    }
  }, [toast]);

  // ✅ Charger les niveaux disponibles
  const fetchNiveaux = useCallback(async () => {
    try {
      const data = await reinscriptionApi.getNiveaux();
      setNiveaux(data);
    } catch (error: any) {
      console.error("Erreur chargement niveaux:", error);
    }
  }, []);

  // ✅ Admin: charger toutes les réinscriptions AVEC FILTRES
  const fetchAdminWithFilters = useCallback(async (filters?: ReinscriptionFilters) => {
    try {
      setLoading(true);
      const data = await reinscriptionApi.listAdmin(filters);
      setReinscriptions(data);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de charger les réinscriptions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // ✅ Admin: charger toutes (sans filtres) - pour compatibilité
  const fetchAdmin = useCallback(async () => {
    await fetchAdminWithFilters();
  }, [fetchAdminWithFilters]);

  // ✅ Création par l'étudiant
 const create = useCallback(async (data: ReinscriptionCreate): Promise<boolean> => {
  try {
    setLoading(true);
    const result = await reinscriptionApi.create(data);
    
    // Le backend retourne un objet avec message, data, et updated
    const isUpdate = (result as any).updated;
    
    toast({
      title: isUpdate ? "Mise à jour réussie" : "Succès",
      description: isUpdate 
        ? "Votre réinscription a été mise à jour ✅"
        : "Réinscription envoyée avec succès ✅",
    });
    return true;
  } catch (error: any) {
    console.error("Erreur création réinscription:", error);
    toast({
      title: "Erreur",
      description: error.message || "Erreur lors de l'envoi de la réinscription",
      variant: "destructive",
    });
    return false;
  } finally {
    setLoading(false);
  }
}, [toast]);
  // ✅ Validation par l'admin
  const updateStatut = useCallback(async (
    id: number,
    statut: "EN_ATTENTE" | "VALIDEE" | "REFUSEE"
  ): Promise<boolean> => {
    try {
      await reinscriptionApi.updateStatut(id, statut);
      
      // Mettre à jour localement
      setReinscriptions(prev => 
        prev.map(r => r.id === id ? { ...r, statut } : r)
      );
      
      return true;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la mise à jour",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  // Charger les données au montage
  useEffect(() => {
    fetchAnnees();
    fetchNiveaux();
  }, [fetchAnnees, fetchNiveaux]);

  return {
    // State
    reinscriptions,
    annees,
    niveaux,
    loading,
    isLoading: loading, // Alias pour compatibilité
    
    // Actions
    create,
    fetchAdmin,
    fetchAdminWithFilters,
    fetchReinscriptions: fetchAdmin, // Alias pour compatibilité
    updateStatut,
    updateStatus: updateStatut, // Alias pour compatibilité
  };
};