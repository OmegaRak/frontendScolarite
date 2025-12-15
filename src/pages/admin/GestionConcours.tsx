import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ConcoursCard } from "@/components/dashboard/ConcoursCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, Loader2, Edit, Trash } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useConcours } from "@/hooks/useConcours";

export default function GestionConcours() {
  const { concours, loading, error, createConcours, updateConcours, deleteConcours } =
    useConcours();

  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingConcours, setEditingConcours] = useState<any>(null);

  const [newConcours, setNewConcours] = useState({
    nom: "",
    description: "",
    date_debut: "",
    date_fin: "",
    prix: "",
    note_deliberation: "12",
    statut: "DISPONIBLE",
  });

  const filteredConcours = concours.filter((c) =>
    c.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateConcours = async () => {
    if (!newConcours.nom || !newConcours.date_debut || !newConcours.date_fin || !newConcours.prix) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createConcours({
        nom: newConcours.nom,
        description: newConcours.description,
        date_debut: newConcours.date_debut,
        date_fin: newConcours.date_fin,
        prix: parseFloat(newConcours.prix),
        note_deliberation: parseFloat(newConcours.note_deliberation) || 12,
        statut: "DISPONIBLE",
      });

      setIsDialogOpen(false);
      setNewConcours({ nom: "", description: "", date_debut: "", date_fin: "", prix: "", note_deliberation: "12", statut: "DISPONIBLE" });

      toast({
        title: "Concours créé",
        description: `Le concours "${newConcours.nom}" a été créé avec succès.`,
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Erreur lors de la création",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateConcours = async () => {
    if (!editingConcours) return;

    if (!editingConcours.nom || !editingConcours.date_debut || !editingConcours.date_fin || !editingConcours.prix) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await updateConcours(editingConcours.id, {
        nom: editingConcours.nom,
        description: editingConcours.description,
        date_debut: editingConcours.date_debut,
        date_fin: editingConcours.date_fin,
        prix: parseFloat(editingConcours.prix),
        note_deliberation: parseFloat(editingConcours.note_deliberation) || 12,
        statut: editingConcours.statut,
      });

      setEditingConcours(null);

      toast({
        title: "Concours modifié",
        description: `Le concours "${editingConcours.nom}" a été mis à jour.`,
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Erreur lors de la modification",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const mapStatus = (statut: string) => (statut === "DISPONIBLE" ? "ouvert" : "fermé");

  if (loading) {
    return (
      <DashboardLayout userType="admin">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout userType="admin">
        <div className="text-center py-12">
          <p className="text-destructive">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Gestion des Concours</h1>
            <p className="text-muted-foreground mt-1">Créez et gérez les concours d'entrée</p>
          </div>

          {/* Dialog Création */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="hero">
                <Plus className="h-4 w-4" />
                Nouveau Concours
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Créer un Concours</DialogTitle>
                <DialogDescription>Définissez les paramètres du nouveau concours</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Formulaire */}
                <div className="space-y-2">
                  <Label htmlFor="nom">Titre du concours *</Label>
                  <Input
                    id="nom"
                    placeholder="Ex: Concours L1 - Informatique"
                    value={newConcours.nom}
                    onChange={(e) => setNewConcours({ ...newConcours, nom: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Description du concours..."
                    value={newConcours.description}
                    onChange={(e) => setNewConcours({ ...newConcours, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date_debut">Date de début *</Label>
                    <Input
                      id="date_debut"
                      type="date"
                      value={newConcours.date_debut}
                      onChange={(e) => setNewConcours({ ...newConcours, date_debut: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date_fin">Date de fin *</Label>
                    <Input
                      id="date_fin"
                      type="date"
                      value={newConcours.date_fin}
                      onChange={(e) => setNewConcours({ ...newConcours, date_fin: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prix">Frais de concours (Ar) *</Label>
                    <Input
                      id="prix"
                      type="number"
                      placeholder="Ex: 25000"
                      value={newConcours.prix}
                      onChange={(e) => setNewConcours({ ...newConcours, prix: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="note_deliberation">Note d'admission (/20)</Label>
                    <Input
                      id="note_deliberation"
                      type="number"
                      step="0.5"
                      min="0"
                      max="20"
                      value={newConcours.note_deliberation}
                      onChange={(e) =>
                        setNewConcours({ ...newConcours, note_deliberation: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button variant="hero" onClick={handleCreateConcours} disabled={isSubmitting}>
                  {isSubmitting ? "Création..." : "Créer le Concours"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Dialog Modification */}
        <Dialog open={!!editingConcours} onOpenChange={() => setEditingConcours(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Modifier le Concours</DialogTitle>
              <DialogDescription>Changez les paramètres du concours</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nom *</Label>
                <Input
                  value={editingConcours?.nom || ""}
                  onChange={(e) =>
                    setEditingConcours((prev: any) =>
                      prev ? { ...prev, nom: e.target.value } : prev
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingConcours?.description || ""}
                  onChange={(e) =>
                    setEditingConcours((prev: any) =>
                      prev ? { ...prev, description: e.target.value } : prev
                    )
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date de début *</Label>
                  <Input
                    type="date"
                    value={editingConcours?.date_debut || ""}
                    onChange={(e) =>
                      setEditingConcours((prev: any) =>
                        prev ? { ...prev, date_debut: e.target.value } : prev
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date de fin *</Label>
                  <Input
                    type="date"
                    value={editingConcours?.date_fin || ""}
                    onChange={(e) =>
                      setEditingConcours((prev: any) =>
                        prev ? { ...prev, date_fin: e.target.value } : prev
                      )
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Frais de concours (Ar) *</Label>
                  <Input
                    type="number"
                    value={editingConcours?.prix || ""}
                    onChange={(e) =>
                      setEditingConcours((prev: any) =>
                        prev ? { ...prev, prix: e.target.value } : prev
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Note d'admission (/20)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    max="20"
                    value={editingConcours?.note_deliberation || ""}
                    onChange={(e) =>
                      setEditingConcours((prev: any) =>
                        prev ? { ...prev, note_deliberation: e.target.value } : prev
                      )
                    }
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setEditingConcours(null)}>
                Annuler
              </Button>
              <Button variant="hero" onClick={handleUpdateConcours} disabled={isSubmitting}>
                {isSubmitting ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Search */}
        <div className="relative max-w-md animate-slide-up">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un concours..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Concours Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConcours.map((c, index) => (
            <div key={c.id} style={{ animationDelay: `${index * 0.05}s` }}>
              <ConcoursCard
                title={c.nom}
                parcours={[]}
                dateDebut={new Date(c.date_debut).toLocaleDateString("fr-FR")}
                dateFin={new Date(c.date_fin).toLocaleDateString("fr-FR")}
                frais={c.prix}
                inscrits={0}
                status={mapStatus(c.statut)}
                onAction={() => setEditingConcours(c)}
                actionLabel="Modifier"
              />
            </div>
          ))}
        </div>

        {filteredConcours.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucun concours trouvé</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
