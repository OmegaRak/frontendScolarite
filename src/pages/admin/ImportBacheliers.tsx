import { useState } from 'react';
import { Upload, Users, Search, Trash2, Eye } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { FileUpload } from '@/components/shared/FileUpload';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { mockBacheliers, Bachelier } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

const ImportBacheliers = () => {
  const { toast } = useToast();
  const [bacheliers, setBacheliers] = useState<Bachelier[]>(mockBacheliers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<Bachelier[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedBachelier, setSelectedBachelier] = useState<Bachelier | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bachelierToDelete, setBachelierToDelete] = useState<string | null>(null);

  const filteredBacheliers = bacheliers.filter(b =>
    b.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.numeroBac.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    // Simulation de prévisualisation des données
    const mockPreview: Bachelier[] = [
      { id: 'new-1', nom: 'Nouveau', prenom: 'Bachelier1', numeroBac: 'A-2024-001', serie: 'C', annee: '2024', etablissement: 'Lycée Test', moyenne: 14.0, dateImport: new Date().toISOString().split('T')[0] },
      { id: 'new-2', nom: 'Nouveau', prenom: 'Bachelier2', numeroBac: 'A-2024-002', serie: 'D', annee: '2024', etablissement: 'Lycée Test', moyenne: 15.5, dateImport: new Date().toISOString().split('T')[0] },
      { id: 'new-3', nom: 'Nouveau', prenom: 'Bachelier3', numeroBac: 'A-2024-003', serie: 'C', annee: '2024', etablissement: 'Lycée Test', moyenne: 12.8, dateImport: new Date().toISOString().split('T')[0] },
    ];
    setPreviewData(mockPreview);
    setShowPreview(true);
  };

  const handleImport = () => {
    setBacheliers([...previewData, ...bacheliers]);
    toast({
      title: 'Import réussi',
      description: `${previewData.length} bacheliers ont été importés`,
    });
    setShowPreview(false);
    setSelectedFile(null);
    setPreviewData([]);
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
      setBacheliers(bacheliers.filter(b => b.id !== bachelierToDelete));
      toast({
        title: 'Supprimé',
        description: 'Le bachelier a été supprimé de la liste',
      });
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

        {/* Zone d'upload */}
        {!showPreview && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Importer un fichier
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload
                accept=".csv,.xlsx,.xls"
                onFileSelect={handleFileSelect}
                label="Glissez-déposez votre fichier de bacheliers ici"
                description="Format attendu: Nom, Prénom, N° Bac, Série, Année, Établissement, Moyenne"
              />
            </CardContent>
          </Card>
        )}

        {/* Prévisualisation */}
        {showPreview && (
          <Card>
            <CardHeader>
              <CardTitle>Prévisualisation de l'import</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm">
                  <strong>{previewData.length}</strong> bacheliers détectés dans le fichier{' '}
                  <strong>{selectedFile?.name}</strong>
                </p>
              </div>
              <div className="overflow-x-auto max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Prénom</TableHead>
                      <TableHead>N° Bac</TableHead>
                      <TableHead>Série</TableHead>
                      <TableHead>Moyenne</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell>{b.nom}</TableCell>
                        <TableCell>{b.prenom}</TableCell>
                        <TableCell>{b.numeroBac}</TableCell>
                        <TableCell>{b.serie}</TableCell>
                        <TableCell>{b.moyenne}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex gap-3 mt-4">
                <Button variant="outline" onClick={handleCancelImport}>
                  Annuler
                </Button>
                <Button onClick={handleImport}>
                  Importer {previewData.length} bacheliers
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Liste des bacheliers */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Bacheliers importés ({bacheliers.length})
              </CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                    <TableHead>N° Bac</TableHead>
                    <TableHead>Série</TableHead>
                    <TableHead>Année</TableHead>
                    <TableHead>Établissement</TableHead>
                    <TableHead>Moyenne</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBacheliers.map((bachelier) => (
                    <TableRow key={bachelier.id}>
                      <TableCell className="font-medium">{bachelier.nom}</TableCell>
                      <TableCell>{bachelier.prenom}</TableCell>
                      <TableCell>{bachelier.numeroBac}</TableCell>
                      <TableCell>{bachelier.serie}</TableCell>
                      <TableCell>{bachelier.annee}</TableCell>
                      <TableCell>{bachelier.etablissement}</TableCell>
                      <TableCell>{bachelier.moyenne}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedBachelier(bachelier)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(bachelier.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
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
          <DialogHeader>
            <DialogTitle>Détails du bachelier</DialogTitle>
          </DialogHeader>
          {selectedBachelier && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nom complet</p>
                <p className="font-medium">{selectedBachelier.nom} {selectedBachelier.prenom}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Numéro Bac</p>
                <p className="font-medium">{selectedBachelier.numeroBac}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Série</p>
                <p className="font-medium">{selectedBachelier.serie}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Année</p>
                <p className="font-medium">{selectedBachelier.annee}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Établissement</p>
                <p className="font-medium">{selectedBachelier.etablissement}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Moyenne</p>
                <p className="font-medium">{selectedBachelier.moyenne}/20</p>
              </div>
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
