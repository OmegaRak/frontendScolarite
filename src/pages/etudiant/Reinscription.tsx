import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GraduationCap, CheckCircle } from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useReinscription } from "@/hooks/useReinscription";
import { ReinscriptionCreate } from "@/lib/api/reinscription";

/* =====================================================
   TYPES
===================================================== */
interface LocationState {
  niveauActuel?: string;
  niveauVise?: string;
  concoursId?: number | null;
}


/* =====================================================
   COMPONENT
===================================================== */
const Reinscription = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { create, loading, annees } = useReinscription();

  const state = location.state as LocationState | null;

  /* =======================
     FORM STATE
  ======================= */

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    niveau_actuel: state?.niveauActuel || "",
    niveau_vise: state?.niveauVise || "",
    concours: state?.concoursId ?? 0, // ✅ ICI
    annee_scolaire: 0,
  });
  
  const [dossier, setDossier] = useState<File | null>(null);
  const [bordereau, setBordereau] = useState<File | null>(null);

  /* =======================
     INIT USER DATA
  ======================= */
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        nom: user.nom || "",
        prenom: user.prenom || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  /* =======================
     AUTO-SELECT ACTIVE YEAR
  ======================= */
  useEffect(() => {
    if (annees?.length) {
      const active = annees.find((a) => a.actif);
      if (active) {
        setFormData((prev) => ({
          ...prev,
          annee_scolaire: active.id,
        }));
      }
    }
  }, [annees]);

  /* =======================
     FILE VALIDATION
  ======================= */
  const handlePdfCheck = (
    file: File | null,
    setter: (file: File | null) => void
  ) => {
    if (file && file.type !== "application/pdf") {
      toast({
        title: "Erreur",
        description: "Le fichier doit être au format PDF",
        variant: "destructive",
      });
      return;
    }
    setter(file);
  };

  /* =======================
     SUBMIT
  ======================= */
  const handleSubmit = async () => {
    // Vérification des champs obligatoires
    console.log("📋 Form data before submit:", formData);
    console.log("📋 Concours value:", formData.concours, "Type:", typeof formData.concours);
    
    if (
      !formData.nom ||
      !formData.prenom ||
      !formData.niveau_actuel ||
      !formData.niveau_vise ||
      !formData.annee_scolaire ||
      formData.annee_scolaire === 0 ||
      !dossier
    ) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    // Création du payload - laisser l'API gérer la conversion en FormData
    const payload: ReinscriptionCreate = {
      annee_scolaire: formData.annee_scolaire,
      concours: formData.concours || 0,
      niveau_actuel: formData.niveau_actuel,
      niveau_vise: formData.niveau_vise,
      dossier_pdf: dossier,
    };
    
    if (bordereau) {
      payload.bordereau = bordereau;
    }

    console.log("📤 Payload to send:", payload);
    console.log("📤 Concours dans payload:", payload.concours);

    try {
      const success = await create(payload);
      if (success) {
        toast({
          title: "Succès",
          description: "Réinscription envoyée avec succès ✅",
        });
        navigate("/etudiant");
      }
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err?.message || "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  /* =======================
     RENDER
  ======================= */
  return (
    <DashboardLayout userType="student">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GraduationCap />
          Réinscription
        </h1>

        <Card>
          <CardHeader>
            <CardTitle>Formulaire de réinscription</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* NOM / PRENOM */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nom</Label>
                <Input value={formData.nom} disabled />
              </div>
              <div>
                <Label>Prénom</Label>
                <Input value={formData.prenom} disabled />
              </div>
            </div>

            {/* EMAIL */}
            <div>
              <Label>Email</Label>
              <Input value={formData.email} disabled />
            </div>

            {/* ANNEE SCOLAIRE */}
            <div>
              <Label>Année scolaire *</Label>
              <Select
                value={String(formData.annee_scolaire)}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    annee_scolaire: Number(value),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner l'année scolaire" />
                </SelectTrigger>

                <SelectContent>
                  {annees?.map((annee) => (
                    <SelectItem key={annee.id} value={String(annee.id)}>
                      {annee.libelle}
                      {annee.actif ? " (active)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* NIVEAUX */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Niveau actuel *</Label>
                <Input
                  value={formData.niveau_actuel}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      niveau_actuel: e.target.value,
                    }))
                  }
                  placeholder="Ex: L2"
                />
              </div>

              <div>
                <Label>Niveau visé *</Label>
                <Input
                  value={formData.niveau_vise}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      niveau_vise: e.target.value,
                    }))
                  }
                  placeholder="Ex: L3"
                />
              </div>
            </div>

            {/* DOSSIER */}
            <div>
              <Label>Dossier complet (PDF obligatoire) *</Label>
              <Input
                type="file"
                accept="application/pdf"
                onChange={(e) =>
                  handlePdfCheck(e.target.files?.[0] || null, setDossier)
                }
              />
            </div>

            {/* BORDEREAU */}
            <div>
              <Label>Bordereau de versement (facultatif)</Label>
              <Input
                type="file"
                accept="application/pdf"
                onChange={(e) =>
                  handlePdfCheck(e.target.files?.[0] || null, setBordereau)
                }
              />
            </div>

            {/* SUBMIT */}
            <Button onClick={handleSubmit} disabled={loading} className="w-full">
              {loading ? "Envoi en cours..." : "Envoyer la réinscription"}
              <CheckCircle className="ml-2 w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Reinscription;
