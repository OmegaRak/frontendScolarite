import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, CheckCircle } from 'lucide-react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useReinscription } from '@/hooks/useReinscription';
import { resultatsApi } from '@/lib/api/inscription';

interface ResultatConcours {
  id: number;
  concours: string;
  utilisateur: string;
  note: number;
  date_publication: string;
  admis: boolean;
}

const Reinscription = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { create, loading, annees } = useReinscription();

  const [parcoursAdmis, setParcoursAdmis] = useState<ResultatConcours[]>([]);
  const [concoursMap, setConcoursMap] = useState<Map<string, number>>(new Map());

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    niveauActuel: '',
    niveauVise: '',
    concoursId: 0,
    anneeScolaireId: 0,
  });

  const [dossier, setDossier] = useState<File | null>(null);
  const [bordereau, setBordereau] = useState<File | null>(null);

  // ✅ Charger infos utilisateur
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        nom: user.nom || '',
        prenom: user.prenom || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  // ✅ Charger les concours où l'utilisateur est admis
  useEffect(() => {
    const loadResultats = async () => {
      try {
        const resultats = await resultatsApi.list();
        const admis = resultats.filter(r => r.admis === true);
        setParcoursAdmis(admis);

        // Créer une map nom -> ID du concours
        // Note: nous devons récupérer les IDs des concours depuis l'API
        // Pour l'instant, on utilise l'ID du résultat comme proxy
        const map = new Map<string, number>();
        admis.forEach(r => {
          map.set(r.concours, r.id); // Vous devrez adapter selon votre structure
        });
        setConcoursMap(map);
      } catch (err) {
        console.error(err);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les parcours admis',
          variant: 'destructive',
        });
      }
    };

    loadResultats();
  }, [toast]);

  // ✅ Validation PDF
  const handleDossierChange = (file: File | null) => {
    if (file && file.type !== 'application/pdf') {
      toast({
        title: 'Erreur',
        description: 'Le dossier doit être en PDF uniquement',
        variant: 'destructive',
      });
      return;
    }
    setDossier(file);
  };

  const handleBordereauChange = (file: File | null) => {
    if (file && file.type !== 'application/pdf') {
      toast({
        title: 'Erreur',
        description: 'Le bordereau doit être en PDF uniquement',
        variant: 'destructive',
      });
      return;
    }
    setBordereau(file);
  };

  // ✅ Soumission vers backend
  const handleSubmit = async () => {
    // Validation
    if (
      !formData.nom ||
      !formData.prenom ||
      !formData.niveauActuel ||
      !formData.niveauVise ||
      !formData.concoursId ||
      !formData.anneeScolaireId ||
      !dossier
    ) {
      toast({
        title: 'Erreur',
        description: 'Tous les champs obligatoires doivent être remplis',
        variant: 'destructive',
      });
      return;
    }

    const success = await create({
      annee_scolaire: formData.anneeScolaireId,
      niveau_actuel: formData.niveauActuel,
      niveau_vise: formData.niveauVise,
      concours: formData.concoursId,
      dossier_pdf: dossier,
      bordereau: bordereau || undefined,
    });

    if (success) {
      toast({
        title: 'Succès',
        description: 'Réinscription envoyée avec succès ✅',
      });
      navigate('/etudiant');
    }
  };

  return (
    <DashboardLayout userType="student">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GraduationCap /> Réinscription
        </h1>

        <Card>
          <CardHeader>
            <CardTitle>Formulaire de réinscription</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* ✅ Informations personnelles */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nom</Label>
                <Input
                  value={formData.nom}
                  onChange={e => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Votre nom"
                />
              </div>

              <div>
                <Label>Prénom</Label>
                <Input
                  value={formData.prenom}
                  onChange={e => setFormData({ ...formData, prenom: e.target.value })}
                  placeholder="Votre prénom"
                />
              </div>
            </div>

            <div>
              <Label>Email</Label>
              <Input type="email" value={formData.email} disabled className="bg-gray-50" />
            </div>

            {/* ✅ Année scolaire */}
            <div>
              <Label>Année scolaire *</Label>
              <Select
                onValueChange={value => setFormData({ ...formData, anneeScolaireId: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez l'année scolaire" />
                </SelectTrigger>
                <SelectContent>
                  {annees.length > 0 ? (
                    annees
                      .filter(a => a.actif)
                      .map(a => (
                        <SelectItem key={a.id} value={String(a.id)}>
                          {a.libelle}
                        </SelectItem>
                      ))
                  ) : (
                    <SelectItem disabled value="none">
                      Aucune année disponible
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* ✅ Parcours admis - Affiche NOM mais envoie ID */}
            <div>
              <Label>Parcours pour lequel vous êtes admis *</Label>
              <Select
                onValueChange={value => setFormData({ ...formData, concoursId: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez votre parcours admis" />
                </SelectTrigger>
                <SelectContent>
                  {parcoursAdmis.length > 0 ? (
                    parcoursAdmis.map(p => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.concours}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem disabled value="none">
                      Aucun parcours admis trouvé
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* ✅ Niveaux */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Niveau actuel *</Label>
                <Input
                  value={formData.niveauActuel}
                  onChange={e => setFormData({ ...formData, niveauActuel: e.target.value })}
                  placeholder="Ex: L2"
                />
              </div>

              <div>
                <Label>Niveau visé *</Label>
                <Input
                  value={formData.niveauVise}
                  onChange={e => setFormData({ ...formData, niveauVise: e.target.value })}
                  placeholder="Ex: L3"
                />
              </div>
            </div>

            {/* ✅ Dossier PDF obligatoire */}
            <div>
              <Label>Dossier complet (PDF obligatoire) *</Label>
              <Input
                type="file"
                accept="application/pdf"
                onChange={e => handleDossierChange(e.target.files?.[0] || null)}
              />
              <p className="text-sm text-gray-500 mt-1">
                Regroupez tous vos documents en un seul PDF
              </p>
            </div>

            {/* ✅ Bordereau facultatif */}
            <div>
              <Label>Bordereau de versement (facultatif)</Label>
              <Input
                type="file"
                accept="application/pdf"
                onChange={e => handleBordereauChange(e.target.files?.[0] || null)}
              />
            </div>

            {/* ✅ Bouton soumission */}
            <Button onClick={handleSubmit} disabled={loading} className="w-full">
              {loading ? 'Envoi en cours...' : 'Envoyer la réinscription'}
              <CheckCircle className="ml-2 w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Reinscription;