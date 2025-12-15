import { useState } from 'react';
import { Trophy, Upload, Search, Loader2, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileUpload } from '@/components/shared/FileUpload';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useResultats } from '@/hooks/useResultats';
import { useConcours } from '@/hooks/useConcours';
import { useToast } from '@/hooks/use-toast';

const ResultatsConcours = () => {
  const { toast } = useToast();
  const { resultats, loading: resultatsLoading, importResultats, error: resultatsError } = useResultats();
  const { concours, loading: concoursLoading, error: concoursError } = useConcours();

  const [selectedConcours, setSelectedConcours] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const loading = resultatsLoading || concoursLoading;

  /* ===========================
        GESTION DES ERREURS
     =========================== */
  if (resultatsError || concoursError) {
    return (
      <DashboardLayout userType="admin">
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div className="text-center">
            <h2 className="text-xl font-bold text-foreground">Erreur de chargement</h2>
            <p className="text-muted-foreground mt-2">
              {resultatsError || concoursError}
            </p>
          </div>
          <Button onClick={() => window.location.reload()}>
            Recharger la page
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  /* ===========================
        FILTRAGE CORRIGÉ
     =========================== */
  const filteredResultats = resultats.filter(r => {
    // ✅ Filtre par concours
    if (selectedConcours !== 'all') {
      const concoursNom = concours.find(c => String(c.id) === selectedConcours)?.nom;
      if (r.concours_nom !== concoursNom) return false;
    }

    // ✅ Filtre par recherche (NOM + PRÉNOM)
    const nomComplet = `${r.utilisateur_first_name} ${r.utilisateur_last_name}`.toLowerCase();
    return nomComplet.includes(searchTerm.toLowerCase());
  });

  const admisCount = filteredResultats.filter(r => r.admis).length;
  const refuseCount = filteredResultats.filter(r => !r.admis).length;

  /* ===========================
        IMPORT DES RÉSULTATS
     =========================== */
  const handleFileSelect = async (file: File) => {
    setIsImporting(true);
    try {
      const result = await importResultats(file);

      toast({
        title: 'Import réussi',
        description: `${result.importes} résultat(s) importé(s)`
      });

      if (result.erreurs?.length > 0) {
        toast({
          title: 'Attention',
          description: `${result.erreurs.length} erreur(s) lors de l'import`,
          variant: 'destructive'
        });
      }

      setShowImportDialog(false);
    } catch (err) {
      toast({
        title: 'Erreur',
        description: err instanceof Error ? err.message : 'Erreur lors de l\'import',
        variant: 'destructive'
      });
    } finally {
      setIsImporting(false);
    }
  };

  /* ===========================
        LOADING
     =========================== */
  if (loading) {
    return (
      <DashboardLayout userType="admin">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Chargement...</span>
        </div>
      </DashboardLayout>
    );
  }

  /* ===========================
        AFFICHAGE FINAL
     =========================== */
  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">

        <div>
          <h1 className="text-2xl font-bold">Résultats des Concours</h1>
          <p className="text-muted-foreground">Gestion complète des résultats</p>
        </div>

        {/* =======================
            SÉLECTION CONCOURS
        ======================= */}
        <Card>
          <CardHeader>
            <CardTitle>Sélectionner un concours</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedConcours} onValueChange={setSelectedConcours}>
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="Choisir un concours" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les concours</SelectItem>
                {concours.map(c => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* =======================
            STATISTIQUES
        ======================= */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-4">
              <p className="text-2xl font-bold">{filteredResultats.length}</p>
              <p className="text-sm text-muted-foreground">Total candidats</p>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-4">
              <p className="text-2xl font-bold text-green-700">{admisCount}</p>
              <p className="text-sm text-green-600">Admis</p>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-4">
              <p className="text-2xl font-bold text-red-700">{refuseCount}</p>
              <p className="text-sm text-red-600">Non admis</p>
            </CardContent>
          </Card>
        </div>

        {/* =======================
            TABLEAU
        ======================= */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" /> Résultats
            </CardTitle>

            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full sm:w-48"
                />
              </div>

              <Button variant="outline" onClick={() => setShowImportDialog(true)}>
                <Upload className="w-4 h-4 mr-2" /> Importer
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidat</TableHead>
                  <TableHead>Concours</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Rang</TableHead>
                  <TableHead>Résultat</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredResultats.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Aucun résultat trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResultats.map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">
                        {r.utilisateur_first_name} {r.utilisateur_last_name}
                      </TableCell>
                      <TableCell>{r.concours_nom}</TableCell>
                      <TableCell>{r.note}/20</TableCell>
                      <TableCell>{r.classement ? `${r.classement}ème` : '-'}</TableCell>
                      <TableCell>
                        <StatusBadge status={r.admis ? 'admis' : 'refuse'} />
                      </TableCell>
                      <TableCell>
                        {new Date(r.date_publication).toLocaleDateString('fr-FR')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* =======================
            DIALOG IMPORT
      ======================= */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importer les résultats</DialogTitle>
          </DialogHeader>

          <FileUpload
            accept=".csv,.xlsx,.xls"
            onFileSelect={handleFileSelect}
            label="Importer un fichier"
          />

          {isImporting && (
            <div className="flex items-center justify-center pt-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">Import en cours...</span>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ResultatsConcours;
