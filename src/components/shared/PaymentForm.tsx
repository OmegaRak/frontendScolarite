import { useState } from 'react';
import { CreditCard, Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from '@/components/shared/FileUpload';
import { useToast } from '@/hooks/use-toast';

interface PaymentFormProps {
  montant: number;
  onSubmit: (data: PaymentData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  showDossierUpload?: boolean;
}

export interface PaymentData {
  justificatifPaiement: File | null;
  dossierPdf: File | null;
}

export const PaymentForm = ({ 
  montant, 
  onSubmit, 
  onCancel, 
  isLoading,
  showDossierUpload = false 
}: PaymentFormProps) => {
  const { toast } = useToast();
  const [justificatifPaiement, setJustificatifPaiement] = useState<File | null>(null);
  const [dossierPdf, setDossierPdf] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!justificatifPaiement) {
      toast({
        title: 'Erreur',
        description: 'Veuillez importer le reçu de versement',
        variant: 'destructive',
      });
      return;
    }

    if (showDossierUpload && !dossierPdf) {
      toast({
        title: 'Erreur',
        description: 'Veuillez importer votre dossier en PDF',
        variant: 'destructive',
      });
      return;
    }

    onSubmit({
      justificatifPaiement,
      dossierPdf,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Paiement et Documents
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm text-muted-foreground">Montant à payer</p>
            <p className="text-2xl font-bold text-primary">
              {montant.toLocaleString('fr-MG')} Ar
            </p>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Instructions de paiement
            </h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Effectuez le paiement via MVola, Orange Money ou Airtel Money</li>
              <li>Prenez une capture d'écran ou photo du reçu de versement</li>
              <li>Importez le reçu ci-dessous</li>
            </ol>
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Reçu de versement *
            </Label>
            <FileUpload
              accept=".jpg,.jpeg,.png,.pdf"
              maxSize={5}
              label="Importer le reçu de versement"
              description="Format: JPG, PNG ou PDF (max 5MB)"
              onFileSelect={(file) => setJustificatifPaiement(file)}
              onFileRemove={() => setJustificatifPaiement(null)}
            />
          </div>

          {showDossierUpload && (
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Dossier d'inscription (PDF) *
              </Label>
              <FileUpload
                accept=".pdf"
                maxSize={10}
                label="Importer votre dossier"
                description="Format: PDF uniquement (max 10MB)"
                onFileSelect={(file) => setDossierPdf(file)}
                onFileRemove={() => setDossierPdf(null)}
              />
            </div>
          )}

          <div className="flex gap-3">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Annuler
              </Button>
            )}
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Envoi en cours...' : 'Soumettre le paiement'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
