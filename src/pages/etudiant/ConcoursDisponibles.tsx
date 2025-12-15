import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ConcoursCard } from "@/components/dashboard/ConcoursCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Loader2, Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useConcours } from "@/hooks/useConcours";
import { useInscriptions } from "@/hooks/useInscriptions";

export default function ConcoursDisponibles() {
  const { concours, loading, error } = useConcours();
  const { createInscription } = useInscriptions();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedConcours, setSelectedConcours] = useState<typeof concours[0] | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [justificatif, setJustificatif] = useState<File | null>(null);
  const [numeroInscription, setNumeroInscription] = useState("");

  const filteredConcours = concours.filter(c =>
    c.nom.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (statusFilter === "all" || c.statut === statusFilter)
  );

  const handleCandidature = (concoursItem: typeof concours[0]) => {
    if (concoursItem.statut !== "DISPONIBLE") {
      toast({ title: "Inscriptions fermées", description: "Les inscriptions sont terminées.", variant: "destructive" });
      return;
    }
    setSelectedConcours(concoursItem);
    setJustificatif(null);
    setNumeroInscription("");
    setIsSubmitted(false);
    setIsDialogOpen(true);
  };

  const submitCandidature = async () => {
    if (!selectedConcours) return;
    if (!numeroInscription.trim()) {
      toast({ title: "Numéro requis", description: "Veuillez entrer votre numéro d'inscription.", variant: "destructive" });
      return;
    }
    if (!justificatif) {
      toast({ title: "Fichier requis", description: "Veuillez importer le reçu de versement.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      await createInscription(selectedConcours.id, numeroInscription, justificatif);
      setIsSubmitted(true);
      toast({ title: "Candidature envoyée", description: "Votre reçu et votre numéro ont été transmis." });
    } catch (err) {
      toast({ title: "Erreur", description: err instanceof Error ? err.message : "Erreur lors de l'inscription", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <DashboardLayout userType="student"><Loader2 className="animate-spin" /></DashboardLayout>;
  if (error) return <DashboardLayout userType="student"><p className="text-destructive">{error}</p></DashboardLayout>;

  return (
    <DashboardLayout userType="student">
      <h1 className="text-3xl font-bold">Concours Disponibles</h1>
      <div className="flex gap-4 mb-4">
        <Input placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-52"><SelectValue placeholder="Filtrer" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="DISPONIBLE">Ouvert</SelectItem>
            <SelectItem value="INDISPONIBLE">Fermé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredConcours.map(c => (
          <ConcoursCard
            key={c.id}
            title={c.nom}
            parcours={[]}
            dateDebut={c.date_debut}
            dateFin={c.date_fin}
            frais={c.prix}
            inscrits={0}
            status={c.statut === "DISPONIBLE" ? "ouvert" : "ferme"}
            onAction={() => handleCandidature(c)}
            actionLabel="Postuler"
          />
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          {!isSubmitted ? (
            <>
              <DialogHeader>
                <DialogTitle>Soumettre la candidature</DialogTitle>
                <DialogDescription>{selectedConcours?.nom}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label>Numéro d'inscription</Label>
                  <Input type="text" placeholder="Entrez votre numéro d'inscription" value={numeroInscription} onChange={e => setNumeroInscription(e.target.value)} />
                </div>
                <div>
                  <Label>Importer le reçu</Label>
                  <Input type="file" accept="image/*,.pdf" onChange={e => setJustificatif(e.target.files?.[0] || null)} />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                <Button onClick={submitCandidature} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                  Envoyer
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto text-green-600" />
              <h3 className="text-xl font-bold mt-3">Candidature validée</h3>
              <Button className="mt-4" onClick={() => setIsDialogOpen(false)}>Fermer</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
