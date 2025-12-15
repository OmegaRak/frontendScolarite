import { useState, useEffect } from 'react';
import { GraduationCap, Search, Check, X, Eye, Download, Filter } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useReinscription } from '@/hooks/useReinscription';
import { useToast } from '@/hooks/use-toast';
import { Reinscription } from '@/lib/api/reinscription';

type StatusType = 'en_attente' | 'valide' | 'refuse';

const mapStatutToDisplay = (statut: string): StatusType => {
  const mapping: Record<string, StatusType> = {
    'EN_ATTENTE': 'en_attente',
    'VALIDEE': 'valide',
    'REFUSEE': 'refuse',
  };
  return mapping[statut] || 'en_attente';
};

const GestionReinscriptions = () => {
  const { toast } = useToast();
  const { reinscriptions, annees, loading, fetchAdminWithFilters, updateStatut } = useReinscription();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [filterNiveauVise, setFilterNiveauVise] = useState<string>('all');
  const [filterAnnee, setFilterAnnee] = useState<string>('all');
  const [selectedReinscription, setSelectedReinscription] = useState<Reinscription | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: 'valider' | 'refuser'; id: number } | null>(null);

  // Charger les données au montage
  useEffect(() => {
    loadData();
  }, []);

  // Recharger quand les filtres changent
  useEffect(() => {
    loadData();
  }, [filterStatut, filterNiveauVise, filterAnnee, searchTerm]);

  const loadData = () => {
    const filters: any = {};
    
    if (filterStatut !== 'all') filters.statut = filterStatut;
    if (filterNiveauVise !== 'all') filters.niveau_vise = filterNiveauVise;
    if (filterAnnee !== 'all') filters.annee_scolaire = filterAnnee;
    if (searchTerm.trim()) filters.search = searchTerm.trim();

    fetchAdminWithFilters(filters);
  };

  const handleValider = async (id: number) => {
    await updateStatut(id, 'VALIDEE');
    setConfirmAction(null);
    toast({
      title: 'Succès',
      description: 'Réinscription validée avec succès',
    });
    loadData(); // Recharger
  };

  const handleRefuser = async (id: number) => {
    await updateStatut(id, 'REFUSEE');
    setConfirmAction(null);
    toast({
      title: 'Réinscription refusée',
      description: 'L\'étudiant sera notifié',
    });
    loadData(); // Recharger
  };

  const handleDownloadFile = (url?: string, type: string = 'fichier') => {
    if (url) {
      const fullUrl = url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL?.replace('/api', '')}${url}`;
      window.open(fullUrl, '_blank');
    } else {
      toast({
        title: 'Erreur',
        description: `Aucun ${type} disponible`,
        variant: 'destructive',
      });
    }
  };

  // Extraire les niveaux uniques pour le filtre
  const niveauxUniques = Array.from(new Set(reinscriptions.map(r => r.niveau_vise))).sort();

  // Statistiques
  const enAttenteCount = reinscriptions.filter(r => r.statut === 'EN_ATTENTE').length;
  const valideeCount = reinscriptions.filter(r => r.statut === 'VALIDEE').length;
  const refuseeCount = reinscriptions.filter(r => r.statut === 'REFUSEE').length;

  if (loading) {
    return (
      <DashboardLayout userType="admin">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestion des Réinscriptions</h1>
          <p className="text-muted-foreground">Validez ou refusez les demandes de réinscription</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-2xl font-bold">{reinscriptions.length}</p>
              <p className="text-sm text-muted-foreground">Total demandes</p>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-4">
              <p className="text-2xl font-bold text-yellow-700">{enAttenteCount}</p>
              <p className="text-sm text-yellow-600">En attente</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-4">
              <p className="text-2xl font-bold text-green-700">{valideeCount}</p>
              <p className="text-sm text-green-600">Validées</p>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-4">
              <p className="text-2xl font-bold text-red-700">{refuseeCount}</p>
              <p className="text-sm text-red-600">Refusées</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4">
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Demandes de réinscription
              </CardTitle>
              
              {/* ✅ FILTRES */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Recherche */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher étudiant..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Filtre Statut */}
                <Select value={filterStatut} onValueChange={setFilterStatut}>
                  <SelectTrigger>
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="EN_ATTENTE">En attente</SelectItem>
                    <SelectItem value="VALIDEE">Validée</SelectItem>
                    <SelectItem value="REFUSEE">Refusée</SelectItem>
                  </SelectContent>
                </Select>

                {/* ✅ Filtre Niveau Visé */}
                <Select value={filterNiveauVise} onValueChange={setFilterNiveauVise}>
                  <SelectTrigger>
                    <SelectValue placeholder="Niveau visé" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les niveaux</SelectItem>
                    {niveauxUniques.map(niveau => (
                      <SelectItem key={niveau} value={niveau}>
                        {niveau}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* ✅ Filtre Année Scolaire */}
                <Select value={filterAnnee} onValueChange={setFilterAnnee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Année scolaire" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les années</SelectItem>
                    {annees.map(annee => (
                      <SelectItem key={annee.id} value={String(annee.id)}>
                        {annee.libelle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Badge nombre de résultats */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="w-4 h-4" />
                <span>{reinscriptions.length} résultat(s) trouvé(s)</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Étudiant</TableHead>
                    <TableHead>Année scolaire</TableHead>
                    <TableHead>Parcours</TableHead>
                    <TableHead>Niveau actuel</TableHead>
                    <TableHead>Niveau visé</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reinscriptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        Aucune demande de réinscription trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    reinscriptions.map((reinscription) => (
                      <TableRow key={reinscription.id}>
                        <TableCell className="font-medium">#{reinscription.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {reinscription.utilisateur_nom || `User #${reinscription.utilisateur}`}
                            </p>
                            {reinscription.utilisateur_email && (
                              <p className="text-xs text-muted-foreground">
                                {reinscription.utilisateur_email}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{reinscription.annee_libelle || '-'}</TableCell>
                        <TableCell>{reinscription.concours_nom || '-'}</TableCell>
                        <TableCell>{reinscription.niveau_actuel}</TableCell>
                        <TableCell>
                          <span className="font-medium text-primary">{reinscription.niveau_vise}</span>
                        </TableCell>
                        <TableCell>
                          {new Date(reinscription.date_soumission).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={mapStatutToDisplay(reinscription.statut)} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedReinscription(reinscription)}
                              title="Voir détails"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {reinscription.statut === 'EN_ATTENTE' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setConfirmAction({ type: 'valider', id: reinscription.id })}
                                  className="text-green-600 hover:text-green-700"
                                  title="Valider"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setConfirmAction({ type: 'refuser', id: reinscription.id })}
                                  className="text-red-600 hover:text-red-700"
                                  title="Refuser"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog détails */}
      <Dialog open={!!selectedReinscription} onOpenChange={() => setSelectedReinscription(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la réinscription #{selectedReinscription?.id}</DialogTitle>
          </DialogHeader>
          {selectedReinscription && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Étudiant</p>
                  <p className="font-medium">
                    {selectedReinscription.utilisateur_nom || `User #${selectedReinscription.utilisateur}`}
                  </p>
                  {selectedReinscription.utilisateur_email && (
                    <p className="text-xs text-muted-foreground">{selectedReinscription.utilisateur_email}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date de soumission</p>
                  <p className="font-medium">
                    {new Date(selectedReinscription.date_soumission).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Année scolaire</p>
                  <p className="font-medium">{selectedReinscription.annee_libelle || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Parcours admis</p>
                  <p className="font-medium">{selectedReinscription.concours_nom || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Niveau actuel</p>
                  <p className="font-medium">{selectedReinscription.niveau_actuel}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Niveau visé</p>
                  <p className="font-medium">{selectedReinscription.niveau_vise}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <StatusBadge status={mapStatutToDisplay(selectedReinscription.statut)} className="mt-1" />
                </div>
              </div>

              {/* Documents */}
              <div className="space-y-3 pt-4 border-t">
                <h3 className="font-semibold">Documents</h3>
                
                {selectedReinscription.dossier_pdf && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Dossier complet</p>
                      <p className="text-xs text-muted-foreground">PDF</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownloadFile(selectedReinscription.dossier_pdf, 'dossier')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Télécharger
                    </Button>
                  </div>
                )}

                {selectedReinscription.bordereau && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Bordereau de versement</p>
                      <p className="text-xs text-muted-foreground">PDF</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownloadFile(selectedReinscription.bordereau, 'bordereau')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Télécharger
                    </Button>
                  </div>
                )}

                {!selectedReinscription.dossier_pdf && !selectedReinscription.bordereau && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucun document disponible
                  </p>
                )}
              </div>

              {/* Actions rapides */}
              {selectedReinscription.statut === 'EN_ATTENTE' && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    className="flex-1" 
                    variant="outline"
                    onClick={() => {
                      setConfirmAction({ type: 'refuser', id: selectedReinscription.id });
                      setSelectedReinscription(null);
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Refuser
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      setConfirmAction({ type: 'valider', id: selectedReinscription.id });
                      setSelectedReinscription(null);
                    }}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Valider
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={() => setConfirmAction(null)}
        title={confirmAction?.type === 'valider' ? 'Valider la réinscription' : 'Refuser la réinscription'}
        description={
          confirmAction?.type === 'valider'
            ? 'Êtes-vous sûr de vouloir valider cette réinscription ? L\'étudiant sera notifié.'
            : 'Êtes-vous sûr de vouloir refuser cette réinscription ? L\'étudiant sera notifié.'
        }
        variant={confirmAction?.type === 'refuser' ? 'destructive' : 'default'}
        confirmLabel={confirmAction?.type === 'valider' ? 'Valider' : 'Refuser'}
        onConfirm={() => {
          if (confirmAction?.type === 'valider') {
            handleValider(confirmAction.id);
          } else if (confirmAction?.type === 'refuser') {
            handleRefuser(confirmAction.id);
          }
        }}
      />
    </DashboardLayout>
  );
};

export default GestionReinscriptions;