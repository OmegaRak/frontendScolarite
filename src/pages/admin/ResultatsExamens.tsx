import { useState, useEffect } from 'react';
import { Upload, Send } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileUpload } from '@/components/shared/FileUpload';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useToast } from '@/hooks/use-toast';
import { reinscriptionApi, AnneeScolaire } from '@/lib/api/reinscription';

interface ResultatExamen {
  id: number;
  utilisateur_nom: string;
  niveau_nom: string;
  annee_id: number;
  annee_libelle: string;
  moyenne: number;
  admis: boolean;
  publie?: boolean;
}

const ResultatsExamens = () => {
  const { toast } = useToast();
  const [resultats, setResultats] = useState<ResultatExamen[]>([]);
  const [selectedNiveau, setSelectedNiveau] = useState('');
  const [selectedAnnee, setSelectedAnnee] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [publishConfirm, setPublishConfirm] = useState(false);
  const [niveaux, setNiveaux] = useState<string[]>([]);
  const [annees, setAnnees] = useState<AnneeScolaire[]>([]);

  // Charger niveaux et années
  useEffect(() => {
    reinscriptionApi.getNiveaux().then(setNiveaux).catch(console.error);
    reinscriptionApi.getAnnees().then(setAnnees).catch(console.error);
  }, []);

  // Charger résultats quand le niveau ou l'année change
  useEffect(() => {
    if (!selectedNiveau || !selectedAnnee) return;

    reinscriptionApi.listAdmin({
      niveau_vise: selectedNiveau,
      annee_scolaire: String(selectedAnnee) // envoyer ID, pas libellé
    })
      .then(data => {
        const mapped = data.map(r => ({
          id: r.id,
          utilisateur_nom: r.utilisateur_nom || r.utilisateur_email?.split('@')[0] || '',
          niveau_nom: r.niveau_vise,
          annee_id: r.annee_scolaire,
          annee_libelle: r.annee_libelle || '',
          moyenne: r.statut === 'VALIDEE' ? 15 : 10,
          admis: r.statut === 'VALIDEE',
          publie: r.statut === 'VALIDEE',
        }));
        setResultats(mapped);
      })
      .catch(err => toast({ title: 'Erreur', description: err.message || 'Erreur lors du chargement des résultats' }));
  }, [selectedNiveau, selectedAnnee]);

  const handleFileSelect = async (file: File) => {
    try {
      toast({ title: 'Import en cours', description: 'Traitement des résultats...' });
      const response = await reinscriptionApi.importResultatsExcel(file);

      const mapped = response.resultats.map(r => ({
        id: r.id,
        utilisateur_nom: r.utilisateur_nom || r.utilisateur_email?.split('@')[0] || '',
        niveau_nom: r.niveau_vise,
        annee_id: r.annee_scolaire,
        annee_libelle: r.annee_libelle || '',
        moyenne: r.statut === 'VALIDEE' ? 15 : 10,
        admis: r.statut === 'VALIDEE',
        publie: r.statut === 'VALIDEE',
      }));

      setResultats(mapped);
      setShowImportDialog(false);
      toast({ title: 'Import terminé', description: `${response.importes} résultats importés` });
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message || 'Erreur lors de l\'import' });
    }
  };

  const handlePublish = async () => {
    if (!selectedNiveau || !selectedAnnee) return;
    try {
      await reinscriptionApi.publishResultats(selectedNiveau, String(selectedAnnee));
      setResultats(prev => prev.map(r => ({ ...r, publie: true })));
      toast({ title: 'Résultats publiés', description: 'Les étudiants peuvent maintenant consulter leurs résultats.' });
      setPublishConfirm(false);
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message || 'Erreur lors de la publication' });
    }
  };

  const filteredResults = resultats.filter(r => r.utilisateur_nom.toLowerCase().includes(searchTerm.toLowerCase()));
  const isPublished = resultats.some(r => r.publie);

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Résultats des Examens</h1>

        {/* Filtres */}
        <Card>
          <CardHeader><CardTitle>Sélectionner le niveau et l'année</CardTitle></CardHeader>
          <CardContent className="flex gap-4">
            <Select value={selectedNiveau} onValueChange={setSelectedNiveau}>
              <SelectTrigger><SelectValue placeholder="Niveau" /></SelectTrigger>
              <SelectContent>{niveaux.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={selectedAnnee ?? ''} onValueChange={(val) => setSelectedAnnee(Number(val))}>
              <SelectTrigger><SelectValue placeholder="Année" /></SelectTrigger>
              <SelectContent>
                {annees.map(a => <SelectItem key={a.id} value={String(a.id)}>{a.libelle}</SelectItem>)}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Input placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          <Button onClick={() => setShowImportDialog(true)}><Upload className="w-4 h-4 mr-2" />Importer Excel</Button>
          {!isPublished && resultats.length > 0 && <Button onClick={() => setPublishConfirm(true)}><Send className="w-4 h-4 mr-2" />Publier</Button>}
        </div>

        {/* Table */}
        <Card>
          <CardHeader><CardTitle>Liste des résultats</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Étudiant</TableHead>
                  <TableHead>Niveau</TableHead>
                  <TableHead>Année</TableHead>
                  <TableHead>Moyenne</TableHead>
                  <TableHead>Résultat</TableHead>
                  <TableHead>Publié</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map(r => (
                  <TableRow key={r.id}>
                    <TableCell>{r.utilisateur_nom}</TableCell>
                    <TableCell>{r.niveau_nom}</TableCell>
                    <TableCell>{r.annee_libelle}</TableCell>
                    <TableCell>{r.moyenne}</TableCell>
                    <TableCell><StatusBadge status={r.admis ? 'admis' : 'redouble'} /></TableCell>
                    <TableCell>{r.publie ? 'Oui' : 'Non'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Dialog Import */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Importer les résultats d'examens</DialogTitle></DialogHeader>
          <FileUpload accept=".xls,.xlsx" onFileSelect={handleFileSelect} label="Fichier Excel" description="Format: Nom, Prénom, Niveau, Année, Moyenne" />
        </DialogContent>
      </Dialog>

      {/* Confirmation Publication */}
      <ConfirmDialog open={publishConfirm} onOpenChange={setPublishConfirm} title="Publier les résultats" description="Cette action rendra les résultats visibles par tous les étudiants." confirmLabel="Publier" onConfirm={handlePublish} />
    </DashboardLayout>
  );
};

export default ResultatsExamens;
