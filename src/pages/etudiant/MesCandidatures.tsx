import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, CreditCard, Loader2, FileCheck, FileText } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useInscriptions } from '@/hooks/useInscriptions';
import { useConcours } from '@/hooks/useConcours';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { InscriptionConcours } from '@/lib/api/inscription';

// ⭐ IMPORT SÉPARÉ DU FICHIER DE CONVOCATION
import { generateAndDownloadConvocation } from '@/utils/generateConvocation';

const MesCandidatures = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const { inscriptions, loading: inscriptionsLoading } = useInscriptions();
  const { concours, loading: concoursLoading } = useConcours();

  const [selectedCandidature, setSelectedCandidature] = useState<InscriptionConcours | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [generatingConvocation, setGeneratingConvocation] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const loading = inscriptionsLoading || concoursLoading;

  // Enrichir les inscriptions avec le nom du concours et le numéro d'inscription
  const enrichedInscriptions = inscriptions.map((inscription) => {
    const concoursInfo = concours.find((c) => c.id === inscription.concours);
    return {
      ...inscription,
      concoursNom: concoursInfo?.nom || 'Concours inconnu',
      concoursPrix: concoursInfo?.prix || 0,
      numeroInscription: inscription.numero_inscription || 'N/A',
    };
  });

  const handleVoirDetails = (candidature: InscriptionConcours) => {
    setSelectedCandidature(candidature);
    setDetailsOpen(true);
  };

  const handlePayer = (candidature: InscriptionConcours) => {
    navigate('/etudiant/paiements', { state: { candidatureId: candidature.id } });
  };

  const handleTelechargerConvocation = async (candidature: InscriptionConcours) => {
    try {
      setGeneratingConvocation(true);
      await generateAndDownloadConvocation(candidature, concours, user);
      toast({
        title: 'Convocation générée',
        description: 'Votre convocation a été téléchargée.',
      });
    } catch (err: any) {
      toast({
        title: 'Erreur',
        description: err.message || 'Impossible de générer la convocation.',
        variant: 'destructive',
      });
    } finally {
      setGeneratingConvocation(false);
    }
  };

  const mapStatus = (statut: string) => {
    switch (statut) {
      case 'EN_ATTENTE': return 'en_attente_paiement';
      case 'VALIDÉ': return 'validee';
      case 'ANNULÉ': return 'rejetee';
      default: return 'en_attente';
    }
  };

  if (loading) {
    return (
      <DashboardLayout userType="student">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Mes Candidatures</h1>
          <p className="text-muted-foreground">Suivez l’état de vos candidatures</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Liste des candidatures
            </CardTitle>
          </CardHeader>

          <CardContent>
            {enrichedInscriptions.length === 0 ? (
              <EmptyState
                title="Aucune candidature"
                description="Vous n'avez pas encore postulé"
                actionLabel="Voir les concours"
                onAction={() => navigate('/etudiant/concours')}
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Concours</TableHead>
                      <TableHead>Numéro</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {enrichedInscriptions.map((candidature) => (
                      <TableRow key={candidature.id}>
                        <TableCell>{candidature.concoursNom}</TableCell>
                        <TableCell>{candidature.numeroInscription}</TableCell>
                        <TableCell>
                          {new Date(candidature.date_inscription).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          {candidature.concoursPrix.toLocaleString('fr-MG')} Ar
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={mapStatus(candidature.statut)} />
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleVoirDetails(candidature)}>
                              <Eye className="w-4 h-4" />
                            </Button>

                            {candidature.statut === 'EN_ATTENTE' && (
                              <Button variant="ghost" size="icon" onClick={() => handlePayer(candidature)}>
                                <CreditCard className="w-4 h-4" />
                              </Button>
                            )}

                            {candidature.statut === 'VALIDÉ' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={generatingConvocation}
                                onClick={() => handleTelechargerConvocation(candidature)}
                                className="text-green-600"
                              >
                                {generatingConvocation ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <FileCheck className="w-4 h-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog détails */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails</DialogTitle>
          </DialogHeader>

          {selectedCandidature && (
            <div className="space-y-4">
              <p><strong>Concours :</strong> {selectedCandidature.concoursNom}</p>
              <p><strong>Numéro d'inscription :</strong> {selectedCandidature.numeroInscription}</p>
              <p><strong>Date :</strong> {new Date(selectedCandidature.date_inscription).toLocaleDateString('fr-FR')}</p>
              <p><strong>Montant :</strong> {selectedCandidature.concoursPrix.toLocaleString('fr-MG')} Ar</p>
              <p><strong>Statut :</strong> {selectedCandidature.statut}</p>

              {/* Visualisation justificatif */}
              {selectedCandidature.justificatif_paiement_url && (
                <div className="mt-4">
                  <p><strong>Justificatif de paiement :</strong></p>
                  <img
                    src={selectedCandidature.justificatif_paiement_url}
                    className="mt-2 w-48 h-48 object-contain cursor-zoom-in border rounded"
                    onClick={() => setZoomImage(selectedCandidature.justificatif_paiement_url)}
                    alt="Justificatif de paiement"
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Zoom image */}
      {zoomImage && (
        <div
          className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center"
          onClick={() => setZoomImage(null)}
        >
          <img
            src={zoomImage}
            className="max-w-[95%] max-h-[95%] rounded shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

    </DashboardLayout>
  );
};

export default MesCandidatures;
