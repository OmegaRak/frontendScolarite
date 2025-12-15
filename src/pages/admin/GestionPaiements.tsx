import { useState } from 'react';
import { CreditCard, Search, Check, X, Download, Eye } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { mockPaiements, Paiement, getModePaiementLabel } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

const GestionPaiements = () => {
  const { toast } = useToast();
  const [paiements, setPaiements] = useState<Paiement[]>(mockPaiements);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPaiement, setSelectedPaiement] = useState<Paiement | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: 'valider' | 'rejeter'; id: string } | null>(null);

  const paiementsEnAttente = paiements.filter(p => p.statut === 'en_attente');
  const paiementsHistorique = paiements.filter(p => p.statut !== 'en_attente');

  const filteredPaiementsEnAttente = paiementsEnAttente.filter(p =>
    p.candidatNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.candidatPrenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPaiementsHistorique = paiementsHistorique.filter(p =>
    p.candidatNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.candidatPrenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleValider = (id: string) => {
    setPaiements(paiements.map(p => 
      p.id === id ? { ...p, statut: 'valide' as const, recu: `REC-${Date.now()}` } : p
    ));
    toast({
      title: 'Paiement validé',
      description: 'Le reçu a été généré et envoyé au candidat',
    });
    setConfirmAction(null);
  };

  const handleRejeter = (id: string) => {
    setPaiements(paiements.map(p => 
      p.id === id ? { ...p, statut: 'rejete' as const } : p
    ));
    toast({
      title: 'Paiement rejeté',
      description: 'Le candidat a été notifié',
    });
    setConfirmAction(null);
  };

  const handleExportCSV = () => {
    toast({
      title: 'Export en cours',
      description: 'Le fichier CSV sera téléchargé',
    });
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestion des Paiements</h1>
          <p className="text-muted-foreground">Validez les paiements et générez les reçus</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-4">
              <p className="text-2xl font-bold text-yellow-700">{paiementsEnAttente.length}</p>
              <p className="text-sm text-yellow-600">En attente de validation</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-4">
              <p className="text-2xl font-bold text-green-700">
                {paiements.filter(p => p.statut === 'valide').length}
              </p>
              <p className="text-sm text-green-600">Validés</p>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-4">
              <p className="text-2xl font-bold text-primary">
                {paiements
                  .filter(p => p.statut === 'valide')
                  .reduce((sum, p) => sum + p.montant, 0)
                  .toLocaleString('fr-MG')} Ar
              </p>
              <p className="text-sm text-primary/80">Total perçu</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Paiements
              </CardTitle>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-full sm:w-64"
                  />
                </div>
                <Button variant="outline" onClick={handleExportCSV}>
                  <Download className="w-4 h-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="en_attente">
              <TabsList>
                <TabsTrigger value="en_attente">
                  En attente ({paiementsEnAttente.length})
                </TabsTrigger>
                <TabsTrigger value="historique">
                  Historique ({paiementsHistorique.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="en_attente" className="mt-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Candidat</TableHead>
                        <TableHead>Concours</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Mode</TableHead>
                        <TableHead>Référence</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPaiementsEnAttente.map((paiement) => (
                        <TableRow key={paiement.id}>
                          <TableCell className="font-medium">
                            {paiement.candidatNom} {paiement.candidatPrenom}
                          </TableCell>
                          <TableCell>{paiement.concours}</TableCell>
                          <TableCell>{paiement.montant.toLocaleString('fr-MG')} Ar</TableCell>
                          <TableCell>{getModePaiementLabel(paiement.modePaiement)}</TableCell>
                          <TableCell className="font-mono text-sm">{paiement.reference}</TableCell>
                          <TableCell>
                            {new Date(paiement.datePaiement).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedPaiement(paiement)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setConfirmAction({ type: 'valider', id: paiement.id })}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setConfirmAction({ type: 'rejeter', id: paiement.id })}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="historique" className="mt-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Candidat</TableHead>
                        <TableHead>Concours</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Mode</TableHead>
                        <TableHead>Référence</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Reçu</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPaiementsHistorique.map((paiement) => (
                        <TableRow key={paiement.id}>
                          <TableCell className="font-medium">
                            {paiement.candidatNom} {paiement.candidatPrenom}
                          </TableCell>
                          <TableCell>{paiement.concours}</TableCell>
                          <TableCell>{paiement.montant.toLocaleString('fr-MG')} Ar</TableCell>
                          <TableCell>{getModePaiementLabel(paiement.modePaiement)}</TableCell>
                          <TableCell className="font-mono text-sm">{paiement.reference}</TableCell>
                          <TableCell>
                            {new Date(paiement.datePaiement).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={paiement.statut} />
                          </TableCell>
                          <TableCell className="text-right">
                            {paiement.recu && (
                              <Button variant="ghost" size="sm">
                                <Download className="w-4 h-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Dialog détails */}
      <Dialog open={!!selectedPaiement} onOpenChange={() => setSelectedPaiement(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails du paiement</DialogTitle>
          </DialogHeader>
          {selectedPaiement && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Candidat</p>
                  <p className="font-medium">{selectedPaiement.candidatNom} {selectedPaiement.candidatPrenom}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Concours</p>
                  <p className="font-medium">{selectedPaiement.concours}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Montant</p>
                  <p className="font-medium">{selectedPaiement.montant.toLocaleString('fr-MG')} Ar</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mode de paiement</p>
                  <p className="font-medium">{getModePaiementLabel(selectedPaiement.modePaiement)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Référence</p>
                  <p className="font-medium font-mono">{selectedPaiement.reference}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {new Date(selectedPaiement.datePaiement).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={() => setConfirmAction(null)}
        title={confirmAction?.type === 'valider' ? 'Valider le paiement' : 'Rejeter le paiement'}
        description={
          confirmAction?.type === 'valider'
            ? 'Cette action validera le paiement et générera un reçu pour le candidat.'
            : 'Cette action rejettera le paiement. Le candidat sera notifié.'
        }
        variant={confirmAction?.type === 'rejeter' ? 'destructive' : 'default'}
        confirmLabel={confirmAction?.type === 'valider' ? 'Valider' : 'Rejeter'}
        onConfirm={() => {
          if (confirmAction?.type === 'valider') {
            handleValider(confirmAction.id);
          } else if (confirmAction?.type === 'rejeter') {
            handleRejeter(confirmAction.id);
          }
        }}
      />
    </DashboardLayout>
  );
};

export default GestionPaiements;
