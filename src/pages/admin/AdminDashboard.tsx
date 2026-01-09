import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { ConcoursCard } from "@/components/dashboard/ConcoursCard";
import { Users, Trophy, FileText, CreditCard, TrendingUp, Clock, Loader2, AlertCircle } from "lucide-react";
import { bacheliersApi, concoursApi, inscriptionApi, resultatsApi } from "@/lib/api/inscription";
import { reinscriptionApi } from "@/lib/api/reinscription";
import type { Concours, InscriptionConcours, Bachelier } from "@/lib/api/inscription";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [bacheliers, setBacheliers] = useState<Bachelier[]>([]);
  const [concours, setConcours] = useState<Concours[]>([]);
  const [inscriptions, setInscriptions] = useState<InscriptionConcours[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger toutes les données en parallèle
      const [bacheliersData, concoursData, inscriptionsData] = await Promise.all([
        bacheliersApi.list().catch(() => []),
        concoursApi.list().catch(() => []),
        inscriptionApi.list().catch(() => []),
      ]);

      setBacheliers(bacheliersData);
      setConcours(concoursData);
      setInscriptions(inscriptionsData);
    } catch (err) {
      console.error("Erreur chargement dashboard:", err);
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  // Calcul des statistiques dynamiques
  const stats = [
    {
      title: "Total Bacheliers Importés",
      value: bacheliers.length.toLocaleString(),
      subtitle: bacheliers.length > 0 ? `Session ${bacheliers[0].annee_scolaire}` : "Aucune donnée",
      icon: Users,
      variant: "default" as const,
    },
    {
      title: "Concours Actifs",
      value: concours.filter(c => c.statut === 'DISPONIBLE').length.toString(),
      subtitle: `${concours.length} au total`,
      icon: Trophy,
      variant: "primary" as const,
    },
    {
      title: "Candidatures Reçues",
      value: inscriptions.length.toLocaleString(),
      subtitle: `+${getInscriptionsSemaine()} cette semaine`,
      icon: FileText,
      trend: { value: calculateTrend(), isPositive: calculateTrend() > 0 },
      variant: "default" as const,
    },
    {
      title: "Paiements Validés",
      subtitle: `${inscriptions.filter(i => i.statut === 'VALIDÉ').length} validés`,
      icon: CreditCard,
      variant: "success" as const,
    },
  ];

  // Calculer inscriptions de la semaine
  function getInscriptionsSemaine(): number {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return inscriptions.filter(i => new Date(i.date_inscription) >= weekAgo).length;
  }

  // Calculer le total des paiements
  function getTotalPaiements(): number {
    return inscriptions
      .filter(i => i.statut === 'VALIDÉ')
      .reduce((sum, inscription) => {
        const concoursInfo = concours.find(c => c.id === inscription.concours);
        return sum + (concoursInfo?.prix || 0);
      }, 0);
  }

  // Calculer la tendance (simple: comparaison semaine dernière vs semaine actuelle)
  function calculateTrend(): number {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const thisWeek = inscriptions.filter(i => new Date(i.date_inscription) >= weekAgo).length;
    const lastWeek = inscriptions.filter(i => {
      const date = new Date(i.date_inscription);
      return date >= twoWeeksAgo && date < weekAgo;
    }).length;

    if (lastWeek === 0) return thisWeek > 0 ? 100 : 0;
    return Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
  }

  // Préparer les données pour ConcoursCard
  const recentConcours = concours
    .sort((a, b) => new Date(b.date_debut).getTime() - new Date(a.date_debut).getTime())
    .slice(0, 4)
    .map(c => ({
      title: c.nom,
      parcours: [c.description.substring(0, 30)],
      dateDebut: new Date(c.date_debut).toLocaleDateString('fr-FR'),
      dateFin: new Date(c.date_fin).toLocaleDateString('fr-FR'),
      frais: c.prix,
      inscrits: inscriptions.filter(i => i.concours === c.id).length,
      status: c.statut === 'DISPONIBLE' ? 'ouvert' as const : 'ferme' as const,
    }));

  // Activités récentes
  const recentActivities = [
    {
      action: "Bacheliers importés",
      count: bacheliers.length,
      time: "Base de données",
    },
    {
      action: "Nouvelles candidatures",
      count: getInscriptionsSemaine(),
      time: "Cette semaine",
    },
    {
      action: "Paiements validés",
      count: inscriptions.filter(i => i.statut === 'VALIDÉ').length,
      time: "Total",
    },
    {
      action: "En attente",
      count: inscriptions.filter(i => i.statut === 'EN_ATTENTE').length,
      time: "À traiter",
    },
  ];

  if (loading) {
    return (
      <DashboardLayout userType="admin">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Chargement des données...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout userType="admin">
        <div className="flex items-center justify-center h-96">
          <div className="text-center max-w-md">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Erreur de chargement</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={loadDashboardData}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Réessayer
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="font-display text-3xl font-bold text-foreground">
            Tableau de bord
          </h1>
          <p className="text-muted-foreground mt-1">
            Vue d'ensemble des inscriptions et concours
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={stat.title} style={{ animationDelay: `${index * 0.1}s` }}>
              <StatCard {...stat} />
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Concours */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Concours Récents
              </h2>
              <a href="/admin/concours" className="text-sm text-primary hover:underline">
                Voir tout
              </a>
            </div>

            {recentConcours.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-12 text-center">
                <Trophy className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">Aucun concours disponible</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {recentConcours.slice(0, 2).map((concoursItem, index) => (
                  <div
                    key={concoursItem.title}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <ConcoursCard
                      {...concoursItem}
                      onAction={() => {}}
                      actionLabel="Gérer"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activities */}
          <div className="space-y-6">
            <h2 className="font-display text-xl font-semibold text-foreground">
              Activité Récente
            </h2>

            <div className="bg-card border border-border rounded-xl p-6 space-y-4 animate-slide-up">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-card-foreground">
                        {activity.action}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {activity.time}
                      </p>
                    </div>
                  </div>

                  <span className="text-lg font-semibold text-primary">
                    {activity.count > 0 ? '+' : ''}{activity.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}