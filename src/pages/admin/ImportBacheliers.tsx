import { useState, useEffect } from 'react';
import { Upload, Users, Search, Trash2, Eye } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog,  DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileUpload } from '@/components/shared/FileUpload';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useToast } from '@/hooks/use-toast';
import { bacheliersApi, Bachelier } from '@/lib/api/inscription';

const ImportBacheliers = () => {
  const { toast } = useToast();
  const [bacheliers, setBacheliers] = useState<Bachelier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<Bachelier[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedBachelier, setSelectedBachelier] = useState<Bachelier | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bachelierToDelete, setBachelierToDelete] = useState<string | null>(null);

  // Charger la liste des bacheliers au montage
  useEffect(() => {
    const fetchBacheliers = async () => {
      try {
        const list = await bacheliersApi.list();
        setBacheliers(list);
      } catch (err: any) {
        toast({ title: 'Erreur', description: err.message });
      }
    };
    fetchBacheliers();
  }, []);

  const filteredBacheliers = bacheliers.filter(b =>
    b.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.numero_inscription.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);

    // Prévisualisation fictive avant import (on peut remplacer par lecture réelle si besoin)
    const preview: Bachelier[] = [
      { id: 0, numero_inscription: 'A-2025-001', nom: 'Nouveau', prenom: 'Bachelier1', admis: false, annee_scolaire: '2025' },
      { id: 1, numero_inscription: 'A-2025-002', nom: 'Nouveau', prenom: 'Bachelier2', admis: false, annee_scolaire: '2025' },
    ];
    setPreviewData(preview);
    setShowPreview(true);
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    try {
      const result = await bacheliersApi.import(selectedFile);
      setBacheliers(prev => [...result.resultats, ...prev]);
      toast({
        title: 'Import réussi',
        description: `${result.importes} bacheliers ont été importés`
      });
      setShowPreview(false);
      setSelectedFile(null);
      setPreviewData([]);
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message });
    }
  };

  const handleCancelImport = () => {
    setShowPreview(false);
    setSelectedFile(null);
    setPreviewData([]);
  };

  const handleDelete = (id: string) => {
    setBachelierToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (bachelierToDelete) {
      setBacheliers(prev => prev.filter(b => String(b.id) !== bachelierToDelete));
      toast({ title: 'Supprimé', description: 'Le bachelier a été supprimé de la liste' });
    }
    setDeleteDialogOpen(false);
    setBachelierToDelete(null);
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Import des Bacheliers</h1>
          <p className="text-muted-foreground">Importez la liste des bacheliers depuis un fichier CSV ou Excel</p>
        </div>

        {!showPreview && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Upload className="w-5 h-5" /> Importer un fichier</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload
                accept=".csv,.xlsx,.xls"
                onFileSelect={handleFileSelect}
                label="Glissez-déposez votre fichier de bacheliers ici"
                description="Format attendu: Nom, Prénom, N° d'inscription, Année scolaire, Admis"
              />
            </CardContent>
          </Card>
        )}

        {showPreview && (
          <Card>
            <CardHeader><CardTitle>Prévisualisation de l'import</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-3 mt-4">
                <Button variant="outline" onClick={handleCancelImport}>Annuler</Button>
                <Button onClick={handleImport}>Importer bacheliers</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" /> Bacheliers importés ({bacheliers.length})</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Prénom</TableHead>
                    <TableHead>N° Inscription</TableHead>
                    <TableHead>Année</TableHead>
                    <TableHead>Admis</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBacheliers.map(b => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{b.nom}</TableCell>
                      <TableCell>{b.prenom}</TableCell>
                      <TableCell>{b.numero_inscription}</TableCell>
                      <TableCell>{b.annee_scolaire}</TableCell>
                      <TableCell>{b.admis ? 'Oui' : 'Non'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog détails */}
      <Dialog open={!!selectedBachelier} onOpenChange={() => setSelectedBachelier(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Détails du bachelier</DialogTitle></DialogHeader>
          {selectedBachelier && (
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-muted-foreground">Nom complet</p><p className="font-medium">{selectedBachelier.nom} {selectedBachelier.prenom}</p></div>
              <div><p className="text-sm text-muted-foreground">Numéro Inscription</p><p className="font-medium">{selectedBachelier.numero_inscription}</p></div>
              <div><p className="text-sm text-muted-foreground">Année</p><p className="font-medium">{selectedBachelier.annee_scolaire}</p></div>
              <div><p className="text-sm text-muted-foreground">Admis</p><p className="font-medium">{selectedBachelier.admis ? 'Oui' : 'Non'}</p></div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Supprimer le bachelier"
        description="Êtes-vous sûr de vouloir supprimer ce bachelier de la liste ?"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </DashboardLayout>
  );
};

export default ImportBacheliers;
