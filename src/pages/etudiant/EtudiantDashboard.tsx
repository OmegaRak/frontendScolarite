import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { CandidatureStatus } from "@/components/dashboard/CandidatureStatus";
import { Button } from "@/components/ui/button";
import { Trophy, FileText, CreditCard, BookOpen, ArrowRight, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { inscriptionApi, resultatsApi, concoursApi } from "@/lib/api/inscription";
import { reinscriptionApi } from "@/lib/api/reinscription";

interface DashboardStats {
  candidaturesCount: number;
  candidaturesEnAttente: number;
  concoursDisponibles: number;
  totalPaye: number;
  resultatsAdmis: number;
}

interface Notification {
  title: string;
  description: string;
  time: string;
  type: "success" | "info" | "warning";
}

export default function EtudiantDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    candidaturesCount: 0,
    candidaturesEnAttente: 0,
    concoursDisponibles: 0,
    totalPaye: 0,
    resultatsAdmis: 0,
  });
  const [inscriptions, setInscriptions] = useState<any[]>([]);
  const [resultats, setResultats] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Charger les inscriptions
      const inscriptionsData = await inscriptionApi.list();
      setInscriptions(inscriptionsData.slice(0, 3)); // Afficher les 3 dernières

      // Charger les résultats
      const resultatsData = await resultatsApi.list();
      setResultats(resultatsData);

      // Charger les concours disponibles
      const concoursData = await concoursApi.list();
      const concoursActifs = concoursData.filter(c => c.statut === "DISPONIBLE");

      // Calculer les statistiques
      const candidaturesEnAttente = inscriptionsData.filter(
        i => i.statut === "EN_ATTENTE"
      ).length;

      const totalPaye = inscriptionsData
        .filter(i => i.statut === "VALIDÉ")
        .reduce((sum, i) => {
          // Récupérer le prix du concours
          const concours = concoursData.find(c => c.id === i.concours);
          return sum + (concours?.prix || 0);
        }, 0);

      const resultatsAdmis = resultatsData.filter(r => r.admis).length;

      setStats({
        candidaturesCount: inscriptionsData.length,
        candidaturesEnAttente,
        concoursDisponibles: concoursActifs.length,
        totalPaye,
        resultatsAdmis,
      });

      // Générer les notifications
      generateNotifications(inscriptionsData, resultatsData, concoursActifs);
    } catch (error) {
      console.error("Erreur chargement dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateNotifications = (
    inscriptions: any[],
    resultats: any[],
    concoursActifs: any[]
  ) => {
    const notifs: Notification[] = [];

    // Notifications pour les résultats admis
    resultats
      .filter(r => r.admis)
      .slice(0, 2)
      .forEach(r => {
        notifs.push({
          title: "Félicitations ! Vous êtes admis",
          description: `${r.concours} - Note: ${r.note}/20`,
          time: getTimeAgo(r.date_publication),
          type: "success",
        });
      });

    // Notifications pour inscriptions validées
    inscriptions
      .filter(i => i.statut === "VALIDÉ")
      .slice(0, 1)
      .forEach(i => {
        notifs.push({
          title: "Inscription validée",
          description: "Votre inscription a été confirmée",
          time: getTimeAgo(i.date_inscription),
          type: "success",
        });
      });

    // Notifications pour nouveaux concours
    if (concoursActifs.length > 0) {
      notifs.push({
        title: `${concoursActifs.length} concours disponible(s)`,
        description: "Consultez les concours ouverts aux inscriptions",
        time: "Aujourd'hui",
        type: "info",
      });
    }

    // Notifications pour inscriptions en attente
    const enAttente = inscriptions.filter(i => i.statut === "EN_ATTENTE");
    if (enAttente.length > 0) {
      notifs.push({
        title: "Inscription en attente",
        description: `${enAttente.length} inscription(s) en cours de validation`,
        time: "Aujourd'hui",
        type: "warning",
      });
    }

    setNotifications(notifs.slice(0, 4));
  };

  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaine(s)`;
    return `Il y a ${Math.floor(diffDays / 30)} mois`;
  };

  const mapStatutToDisplay = (statut: string) => {
    const mapping: Record<string, any> = {
      EN_ATTENTE: "paiement_en_attente",
      VALIDÉ: "validee",
      ANNULÉ: "refusee",
    };
    return mapping[statut] || "paiement_en_attente";
  };

  if (loading) {
    return (
      <DashboardLayout userType="student">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const statsCards = [
    {
      title: "Candidatures Soumises",
      value: stats.candidaturesCount.toString(),
      subtitle: `${stats.candidaturesEnAttente} en attente de validation`,
      icon: FileText,
      variant: "default" as const,
    },
    {
      title: "Concours Disponibles",
      value: stats.concoursDisponibles.toString(),
      subtitle: "Consultez les opportunités",
      icon: Trophy,
      variant: "primary" as const,
    },
    {
      title: "Résultats",
      value: stats.resultatsAdmis.toString(),
      subtitle: "Concours réussi(s)",
      icon: CreditCard,
      variant: "success" as const,
    },
  ];

  return (
    <DashboardLayout userType="student">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Bienvenue, {user?.prenom || user?.first_name || "Étudiant"}
            </h1>
            <p className="text-muted-foreground mt-1">
              Suivez vos candidatures et inscriptions
            </p>
          </div>
          <Link to="/etudiant/concours">
            <Button variant="hero" size="lg">
              Voir les Concours
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-3 gap-6">
          {statsCards.map((stat, index) => (
            <div key={stat.title} style={{ animationDelay: `${index * 0.1}s` }}>
              <StatCard {...stat} />
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Candidatures */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Mes Candidatures Récentes
              </h2>
              <Link to="/etudiant/candidatures" className="text-sm text-primary hover:underline">
                Voir tout
              </Link>
            </div>
            
            {inscriptions.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">Aucune candidature</h3>
                <p className="text-muted-foreground mb-4">
                  Vous n'avez pas encore soumis de candidature
                </p>
                <Link to="/etudiant/concours">
                  <Button>
                    Voir les concours
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {inscriptions.map((inscription, index) => (
                  <div
                    key={inscription.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CandidatureStatus
                      status={mapStatutToDisplay(inscription.statut)}
                      concours={`Concours #${inscription.concours}`}
                      date={new Date(inscription.date_inscription).toLocaleDateString("fr-FR")}
                      parcours={`ID ${inscription.concours}`}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-card border border-border rounded-xl p-6 mt-6 animate-slide-up">
              <h3 className="font-display font-semibold text-card-foreground mb-4">
                Actions Rapides
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Link to="/etudiant/concours">
                  <Button variant="outline" className="w-full justify-start">
                    <Trophy className="h-4 w-4 mr-2" />
                    Voir les concours disponibles
                  </Button>
                </Link>
                <Link to="/etudiant/candidatures">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Mes candidatures
                  </Button>
                </Link>
                <Link to="/etudiant/resultats">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Consulter mes résultats
                  </Button>
                </Link>
                <Link to="/etudiant/reinscription">
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Réinscription
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="space-y-6">
            <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </h2>
            
            {notifications.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <Bell className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Aucune notification pour le moment
                </p>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl divide-y divide-border animate-slide-up">
                {notifications.map((notif, index) => (
                  <div key={index} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-2">
                      {notif.type === "success" && (
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                      )}
                      {notif.type === "info" && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                      )}
                      {notif.type === "warning" && (
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-card-foreground text-sm">
                          {notif.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notif.description}
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-2">
                          {notif.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}