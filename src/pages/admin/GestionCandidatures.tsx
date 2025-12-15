import { useState } from 'react';
import { Eye, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useInscriptions } from '@/hooks/useInscriptions';
import { useConcours } from '@/hooks/useConcours';
import { useToast } from '@/hooks/use-toast';
import { InscriptionConcours } from '@/lib/api/inscription';

const GestionCandidatures = () => {
  const { toast } = useToast();
  const { inscriptions, loading: inscriptionsLoading, updateStatus } = useInscriptions();
  const { concours, loading: concoursLoading } = useConcours();

  const [selectedCandidature, setSelectedCandidature] = useState<InscriptionConcours | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: 'valider' | 'rejeter'; id: number } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const loading = inscriptionsLoading || concoursLoading;

  const enrichedInscriptions = inscriptions.map(inscription => {
    const concoursInfo = concours.find(c => c.id === inscription.concours);
    return {
      ...inscription,
      concoursNom: concoursInfo?.nom || 'Concours inconnu',
      concoursPrix: concoursInfo?.prix || 0,
    };
  });

  const handleValider = async (id: number) => {
    setIsUpdating(true);
    try {
      await updateStatus(id, 'VALIDÉ');
      toast({ title: 'Candidature validée' });
    } finally {
      setIsUpdating(false);
      setConfirmAction(null);
      setSelectedCandidature(null);
    }
  };

  const handleRejeter = async (id: number) => {
    setIsUpdating(true);
    try {
      await updateStatus(id, 'ANNULÉ');
      toast({ title: 'Candidature rejetée' });
    } finally {
      setIsUpdating(false);
      setConfirmAction(null);
      setSelectedCandidature(null);
    }
  };

  const mapStatus = (statut: string) => {
    switch (statut) {
      case 'EN_ATTENTE': return 'paiement_en_validation';
      case 'VALIDÉ': return 'validee';
      case 'ANNULÉ': return 'rejetee';
      default: return 'en_attente';
    }
  };

  if (loading) {
    return (
      <DashboardLayout userType="admin">
        <div className="flex justify-center h-64 items-center">
          <Loader2 className="animate-spin w-8 h-8" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">

        {/* TABLE */}
        <Card>
          <CardHeader>
            <CardTitle>Gestion des Candidatures</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidat</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Concours</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {enrichedInscriptions.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      {c.utilisateur_prenom} {c.utilisateur_nom}
                    </TableCell>
                    <TableCell>{c.utilisateur_email}</TableCell>
                    <TableCell>{c.concoursNom}</TableCell>
                    <TableCell>
                      {new Date(c.date_inscription).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{c.concoursPrix} Ar</TableCell>
                    <TableCell>
                      <StatusBadge status={mapStatus(c.statut)} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => setSelectedCandidature(c)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>

            </Table>
          </CardContent>
        </Card>

        {/* MODAL DETAILS */}
        <Dialog open={!!selectedCandidature} onOpenChange={() => setSelectedCandidature(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Détails candidature</DialogTitle>
            </DialogHeader>

            {selectedCandidature && (
              <>
                <p><b>Nom :</b> {selectedCandidature.utilisateur_nom}</p>
                <p><b>Prénom :</b> {selectedCandidature.utilisateur_prenom}</p>
                <p><b>Email :</b> {selectedCandidature.utilisateur_email}</p>
                <p><b>Rôle :</b> {selectedCandidature.utilisateur_role}</p>

                {selectedCandidature.justificatif_paiement_url && (
                  <img
                    src={selectedCandidature.justificatif_paiement_url}
                    className="mt-4 cursor-zoom-in rounded border"
                    onClick={() => setZoomImage(selectedCandidature.justificatif_paiement_url)}
                  />
                )}

                {selectedCandidature.statut === 'EN_ATTENTE' && (
                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      variant="destructive"
                      onClick={() => setConfirmAction({ type: 'rejeter', id: selectedCandidature.id })}
                      disabled={isUpdating}
                    >
                      Rejeter
                    </Button>

                    <Button
                      onClick={() => setConfirmAction({ type: 'valider', id: selectedCandidature.id })}
                      disabled={isUpdating}
                    >
                      Valider
                    </Button>
                  </div>
                )}
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* CONFIRMATION */}
        <ConfirmDialog
          open={!!confirmAction}
          onOpenChange={() => setConfirmAction(null)}
          title="Confirmation"
          description="Confirmer l’action"
          onConfirm={() => {
            if (confirmAction?.type === 'valider') handleValider(confirmAction.id);
            else handleRejeter(confirmAction.id);
          }}
        />

        {/* ZOOM IMAGE */}
        {zoomImage && (
        <div
          className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center"
          onClick={() => setZoomImage(null)}
        >
          <img
            src={zoomImage}
            className="max-w-[95%] max-h-[95%] rounded shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      </div>
    </DashboardLayout>
  );
};

export default GestionCandidatures;
