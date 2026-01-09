import { useNavigate } from "react-router-dom";
import React from "react";
import { Trophy, ArrowRight, Award, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { useResultats } from "@/hooks/useResultats";

// Fonction pour obtenir le niveau supérieur
const getNextLevel = (niveau: string) => {
  const levels = ["L1", "L2", "L3", "M1", "M2", "D1", "D2"];
  const index = levels.indexOf(niveau.toUpperCase());
  return index >= 0 && index < levels.length - 1 ? levels[index + 1] : niveau;
};

const MesResultats = () => {
  const navigate = useNavigate();
  const { concours, niveaux, loading, error } = useResultats();

  const handleReinscriptionConcours = () => {
    console.log("🎯 Données du concours:", concours);
    console.log("🎯 concours_id:", concours?.concours_id);
    console.log("🎯 concours:", concours?.concours);
    
    // ✅ Utiliser concours.concours ou concours.concours_id selon ce qui existe
    const concoursId = concours?.concours_id || concours?.concours || null;
    console.log("🎯 ID final à envoyer:", concoursId);
    
    if (concours && concours.admis) {
      navigate("/etudiant/reinscription", {
        state: { 
          niveauActuel: "Nouveau", 
          niveauVise: "L1",
          concoursId: concoursId  // ✅ Passer l'ID du concours
        },
      });
    } else {
      const niveauActuel = niveaux.length > 0 ? niveaux[niveaux.length - 1].niveau_nom : "";
      const niveauVise = niveauActuel; // doublant ou non admis
      navigate("/etudiant/reinscription", {
        state: { 
          niveauActuel, 
          niveauVise,
          concoursId: concoursId  // ✅ Passer l'ID même si non admis
        },
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout userType="student">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout userType="student">
        <div className="text-center py-12">
          <p className="text-destructive">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const hasConcours = !!concours;
  const hasNiveaux = niveaux.length > 0;

  return (
    <DashboardLayout userType="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mes Résultats</h1>
          <p className="text-muted-foreground">Consultez vos résultats de concours et de niveaux</p>
        </div>

        {!(hasConcours || hasNiveaux) ? (
          <Card>
            <CardContent className="py-8">
              <EmptyState
                icon={Trophy}
                title="Aucun résultat disponible"
                description="Les résultats n'ont pas encore été publiés"
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {hasConcours && (
              <Card
                className={`overflow-hidden ${concours.admis ? "border-green-200 bg-green-50/50" : "border-red-200 bg-red-50/50"}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{concours.concours_nom}</CardTitle>
                    <StatusBadge status={concours.admis ? "admis" : "non admis"} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-background rounded-lg">
                      <p className="text-sm text-muted-foreground">Note</p>
                      <p className="text-2xl font-bold text-foreground">{concours.note}/20</p>
                    </div>
                    {concours.classement && (
                      <div className="p-3 bg-background rounded-lg">
                        <p className="text-sm text-muted-foreground">Rang</p>
                        <p className="text-2xl font-bold text-foreground">{concours.classement}ème</p>
                      </div>
                    )}
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Publié le {new Date(concours.date_publication).toLocaleDateString("fr-FR")}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button onClick={handleReinscriptionConcours} className="w-full">
                      <Award className="w-4 h-4 mr-2" />
                      Procéder à la réinscription
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {hasNiveaux && (
              <div className="grid gap-6 md:grid-cols-2">
                {niveaux.map((niveau) => (
                  <Card
                    key={niveau.id}
                    className={`overflow-hidden ${niveau.admis ? "border-green-200 bg-green-50/50" : "border-red-200 bg-red-50/50"}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{niveau.niveau_nom}</CardTitle>
                        <StatusBadge status={niveau.admis ? "admis" : "redoublant"} />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-3 bg-background rounded-lg">
                        <p className="text-sm text-muted-foreground">Moyenne</p>
                        <p className="text-2xl font-bold text-foreground">{niveau.moyenne}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Publié le {new Date(niveau.created_at).toLocaleDateString("fr-FR")}
                      </div>

                      {/* ✅ Bouton réinscription pour chaque niveau avec concoursId */}
                      <Button
                        onClick={() => {
                          const concoursId = concours?.concours_id || concours?.concours || null;
                          console.log("🎯 Navigation depuis niveau avec concoursId:", concoursId);
                          
                          const niveauActuel = niveau.niveau_nom;
                          const niveauVise = niveau.admis ? getNextLevel(niveau.niveau_nom) : niveau.niveau_nom;
                          navigate("/etudiant/reinscription", {
                            state: { 
                              niveauActuel, 
                              niveauVise,
                              concoursId: concoursId  // ✅ Passer l'ID du concours si disponible
                            },
                          });
                        }}
                        className="w-full mt-2"
                      >
                        <Award className="w-4 h-4 mr-2" />
                        Procéder à la réinscription
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MesResultats;