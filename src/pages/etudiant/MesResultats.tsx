import { useNavigate } from 'react-router-dom';
import { Trophy, Download, ArrowRight, Award, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { useResultats } from '@/hooks/useResultats';
import { useToast } from '@/hooks/use-toast';

const MesResultats = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { resultats, loading, error } = useResultats();

  const handleReinscription = () => {
    navigate('/etudiant/reinscription');
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

  return (
    <DashboardLayout userType="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mes Résultats</h1>
          <p className="text-muted-foreground">Consultez vos résultats de concours</p>
        </div>

        {resultats.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <EmptyState
                icon={Trophy}
                title="Aucun résultat disponible"
                description="Les résultats de vos concours n'ont pas encore été publiés"
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {resultats.map((resultat) => (
              <Card 
                key={resultat.id} 
                className={`overflow-hidden ${
                  resultat.admis 
                    ? 'border-green-200 bg-green-50/50' 
                    : 'border-red-200 bg-red-50/50'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{resultat.concours}</CardTitle>
                    <StatusBadge status={resultat.admis ? 'admis' : 'non admis'} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-background rounded-lg">
                      <p className="text-sm text-muted-foreground">Note</p>
                      <p className="text-2xl font-bold text-foreground">{resultat.note}/20</p>
                    </div>
                    {resultat.classement && (
                      <div className="p-3 bg-background rounded-lg">
                        <p className="text-sm text-muted-foreground">Rang</p>
                        <p className="text-2xl font-bold text-foreground">{resultat.classement}ème</p>
                      </div>
                    )}
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Publié le {new Date(resultat.date_publication).toLocaleDateString('fr-FR')}
                  </div>

                  <div className="flex flex-col gap-2">
                    {resultat.admis && (
                      <>
                        <Button onClick={handleReinscription} className="w-full">
                          <Award className="w-4 h-4 mr-2" />
                          Procéder à la réinscription
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </>
                    )}
                    {!resultat.admis && (
                      <div className="p-3 bg-background rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">
                          Nous vous encourageons à retenter votre chance l'année prochaine
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MesResultats;
