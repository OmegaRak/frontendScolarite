import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useEtablissements } from "@/hooks/useEtablissements";
import { EtablissementCreate } from "@/lib/api/auth";
import { 
  Building2, 
  Plus, 
  Pencil, 
  Trash2, 
  Users,
  MapPin,
  Mail,
  Phone,
  Loader2,
  Search,
} from "lucide-react";

export default function GestionEtablissements() {
  const { toast } = useToast();
  const {
    etablissements,
    loading,
    error,
    fetchEtablissements,
    createEtablissement,
    updateEtablissement,
    deleteEtablissement,
    toggleActif,
  } = useEtablissements();

  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<EtablissementCreate>({
    code: "",
    nom: "",
    ville: "Fianarantsoa",
    adresse: "",
    email_contact: "",
    telephone: "",
    actif: true,
  });

  useEffect(() => {
    fetchEtablissements();
  }, [fetchEtablissements]);

  const resetForm = () => {
    setFormData({
      code: "",
      nom: "",
      ville: "Fianarantsoa",
      adresse: "",
      email_contact: "",
      telephone: "",
      actif: true,
    });
    setEditingId(null);
  };

  const handleOpenDialog = (etablissement?: typeof etablissements[0]) => {
    if (etablissement) {
      setEditingId(etablissement.id);
      setFormData({
        code: etablissement.code,
        nom: etablissement.nom,
        ville: etablissement.ville,
        adresse: etablissement.adresse,
        email_contact: etablissement.email_contact,
        telephone: etablissement.telephone,
        actif: etablissement.actif,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await updateEtablissement(editingId, formData);
        toast({
          title: "Établissement modifié",
          description: `${formData.nom} a été mis à jour avec succès.`,
        });
      } else {
        await createEtablissement(formData);
        toast({
          title: "Établissement créé",
          description: `${formData.nom} a été ajouté avec succès.`,
        });
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number, nom: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'établissement "${nom}" ?`)) {
      return;
    }

    try {
      await deleteEtablissement(id);
      toast({
        title: "Établissement supprimé",
        description: `${nom} a été supprimé avec succès.`,
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  const handleToggleActif = async (id: number, actif: boolean) => {
    try {
      await toggleActif(id, actif);
      toast({
        title: actif ? "Établissement activé" : "Établissement désactivé",
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  const filteredEtablissements = etablissements.filter(
    (e) =>
      e.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.ville.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display text-foreground">
              Gestion des Établissements
            </h1>
            <p className="text-muted-foreground mt-1">
              Gérez les établissements universitaires du système
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvel Établissement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Modifier l'établissement" : "Nouvel établissement"}
                </DialogTitle>
                <DialogDescription>
                  {editingId
                    ? "Modifiez les informations de l'établissement"
                    : "Ajoutez un nouvel établissement au système"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Code *</Label>
                    <Input
                      id="code"
                      placeholder="ENI"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value.toUpperCase() })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ville">Ville</Label>
                    <Input
                      id="ville"
                      placeholder="Fianarantsoa"
                      value={formData.ville}
                      onChange={(e) =>
                        setFormData({ ...formData, ville: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom complet *</Label>
                  <Input
                    id="nom"
                    placeholder="École Nationale d'Informatique"
                    value={formData.nom}
                    onChange={(e) =>
                      setFormData({ ...formData, nom: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adresse">Adresse</Label>
                  <Textarea
                    id="adresse"
                    placeholder="Adresse complète..."
                    value={formData.adresse}
                    onChange={(e) =>
                      setFormData({ ...formData, adresse: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email de contact</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contact@eni.mg"
                      value={formData.email_contact}
                      onChange={(e) =>
                        setFormData({ ...formData, email_contact: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telephone">Téléphone</Label>
                    <Input
                      id="telephone"
                      placeholder="+261 34 00 000 00"
                      value={formData.telephone}
                      onChange={(e) =>
                        setFormData({ ...formData, telephone: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="actif"
                    checked={formData.actif}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, actif: checked })
                    }
                  />
                  <Label htmlFor="actif">Établissement actif</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSubmit} disabled={loading || !formData.code || !formData.nom}>
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingId ? "Enregistrer" : "Créer"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total établissements</p>
                  <p className="text-2xl font-bold">{etablissements.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <Building2 className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Actifs</p>
                  <p className="text-2xl font-bold">
                    {etablissements.filter((e) => e.actif).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total utilisateurs</p>
                  <p className="text-2xl font-bold">
                    {etablissements.reduce((acc, e) => acc + (e.nombre_utilisateurs || 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>Liste des établissements</CardTitle>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
            {loading && etablissements.length === 0 ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">{error}</div>
            ) : filteredEtablissements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucun établissement trouvé
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Ville</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Utilisateurs</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEtablissements.map((etab) => (
                    <TableRow key={etab.id}>
                      <TableCell className="font-mono font-medium">
                        {etab.code}
                      </TableCell>
                      <TableCell className="font-medium">{etab.nom}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {etab.ville}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          {etab.email_contact && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {etab.email_contact}
                            </div>
                          )}
                          {etab.telephone && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {etab.telephone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{etab.nombre_utilisateurs || 0}</span>
                          <span className="text-muted-foreground text-xs">
                            ({etab.nombre_admins || 0} admins)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={etab.actif}
                          onCheckedChange={(checked) =>
                            handleToggleActif(etab.id, checked)
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(etab)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(etab.id, etab.nom)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
