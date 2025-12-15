import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { ConcoursCard } from "@/components/dashboard/ConcoursCard";
import { Users, Trophy, FileText, CreditCard, TrendingUp, Clock } from "lucide-react";

const stats = [
  {
    title: "Total Bacheliers Importés",
    value: "2,543",
    subtitle: "Session 2024",
    icon: Users,
    variant: "default" as const,
  },
  {
    title: "Concours Actifs",
    value: "4",
    subtitle: "2 en cours d'inscription",
    icon: Trophy,
    variant: "primary" as const,
  },
  {
    title: "Candidatures Reçues",
    value: "1,287",
    subtitle: "+156 cette semaine",
    icon: FileText,
    trend: { value: 12, isPositive: true },
    variant: "default" as const,
  },
  {
    title: "Paiements Validés",
    value: "892,000 Ar",
    subtitle: "Ce mois",
    icon: CreditCard,
    variant: "success" as const,
  },
];

const recentConcours = [
  {
    title: "Concours d'entrée L1 - Informatique",
    parcours: ["L1 Info", "L1 GB"],
    dateDebut: "01 Nov 2024",
    dateFin: "30 Nov 2024",
    frais: 25000,
    inscrits: 456,
    status: "ouvert" as const,
  },
  {
    title: "Concours L1 - Sciences Économiques",
    parcours: ["L1 Éco", "L1 Gestion"],
    dateDebut: "15 Oct 2024",
    dateFin: "15 Nov 2024",
    frais: 20000,
    inscrits: 312,
    status: "ouvert" as const,
  },
  {
    title: "Concours Master - Mathématiques",
    parcours: ["M1 Math", "M1 Stats"],
    dateDebut: "01 Oct 2024",
    dateFin: "31 Oct 2024",
    frais: 35000,
    inscrits: 89,
    status: "ferme" as const,
  },
];

const recentActivities = [
  { action: "Import bacheliers", count: 150, time: "Il y a 2 heures" },
  { action: "Nouvelles candidatures", count: 23, time: "Il y a 4 heures" },
  { action: "Paiements validés", count: 45, time: "Aujourd'hui" },
  { action: "Reçus envoyés", count: 45, time: "Aujourd'hui" },
];

export default function AdminDashboard() {
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

            <div className="grid md:grid-cols-2 gap-4">
              {recentConcours.slice(0, 2).map((concours, index) => (
                <div
                  key={concours.title}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ConcoursCard
                    {...concours}
                    onAction={() => {}}
                    actionLabel="Gérer"
                  />
                </div>
              ))}
            </div>
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
                    +{activity.count}
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
