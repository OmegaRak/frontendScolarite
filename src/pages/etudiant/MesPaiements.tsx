import { useState } from 'react';
import { Download, History, CreditCard } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PaymentForm, PaymentData } from '@/components/shared/PaymentForm';
import { EmptyState } from '@/components/shared/EmptyState';
import { mockPaiements, mockCandidatures, getModePaiementLabel } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

const MesPaiements = () => {
  const { toast } = useToast();
  const [selectedCandidature, setSelectedCandidature] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Candidatures en attente de paiement
  const candidaturesEnAttente = mockCandidatures.filter(
    c => c.candidatId === '1' && c.statut === 'en_attente_paiement'
  );

  // Historique des paiements de l'utilisateur
  const mesPaiements = mockPaiements.filter(p => 
    mockCandidatures.some(c => c.id === p.candidatureId && c.candidatId === '1')
  );

  const selectedCandidatureData = mockCandidatures.find(c => c.id === selectedCandidature);

  const handleSubmitPayment = async (data: PaymentData) => {
    setIsSubmitting(true);
    
    // Simulation d'envoi
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: 'Paiement soumis',
      description: 'Votre paiement est en cours de validation',
    });
    
    setSelectedCandidature('');
    setIsSubmitting(false);
  };

  const handleDownloadRecu = (paiementId: string) => {
    toast({
      title: 'Téléchargement',
      description: 'Le reçu a été téléchargé',
    });
  };

  return (
    <DashboardLayout userType="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mes Paiements</h1>
          <p className="text-muted-foreground">Effectuez vos paiements et consultez l'historique</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Section Effectuer un paiement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Effectuer un paiement
              </CardTitle>
            </CardHeader>
            <CardContent>
              {candidaturesEnAttente.length === 0 ? (
                <EmptyState
                  icon={CreditCard}
                  title="Aucun paiement en attente"
                  description="Toutes vos candidatures sont à jour"
                />
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sélectionner la candidature</label>
                    <Select value={selectedCandidature} onValueChange={setSelectedCandidature}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir une candidature à payer" />
                      </SelectTrigger>
                      <SelectContent>
                        {candidaturesEnAttente.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.concoursTitre} - {c.montant.toLocaleString('fr-MG')} Ar
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedCandidatureData && (
                    <PaymentForm
                      montant={selectedCandidatureData.montant}
                      onSubmit={handleSubmitPayment}
                      onCancel={() => setSelectedCandidature('')}
                      isLoading={isSubmitting}
                    />
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Historique des paiements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Historique des paiements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mesPaiements.length === 0 ? (
                <EmptyState
                  icon={History}
                  title="Aucun paiement"
                  description="Vous n'avez pas encore effectué de paiement"
                />
              ) : (
                <div className="space-y-4">
                  {mesPaiements.map((paiement) => (
                    <div
                      key={paiement.id}
                      className="p-4 border rounded-lg space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{paiement.concours}</p>
                          <p className="text-sm text-muted-foreground">
                            {getModePaiementLabel(paiement.modePaiement)} • {paiement.reference}
                          </p>
                        </div>
                        <StatusBadge status={paiement.statut} />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {new Date(paiement.datePaiement).toLocaleDateString('fr-FR')}
                        </span>
                        <span className="font-semibold text-primary">
                          {paiement.montant.toLocaleString('fr-MG')} Ar
                        </span>
                      </div>
                      {paiement.statut === 'valide' && paiement.recu && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => handleDownloadRecu(paiement.id)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Télécharger le reçu
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MesPaiements;
