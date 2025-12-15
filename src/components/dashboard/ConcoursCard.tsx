import { Calendar, Users, CreditCard, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConcoursCardProps {
  title: string;
  parcours: string[];
  dateDebut: string;
  dateFin: string;
  frais: number;
  inscrits: number;
  status: "ouvert" | "ferme" | "termine";
  onAction?: () => void;
  actionLabel?: string;
}

const statusStyles = {
  ouvert: "bg-success/10 text-success border-success/20",
  ferme: "bg-warning/10 text-warning border-warning/20",
  termine: "bg-muted text-muted-foreground border-border",
};

const statusLabels = {
  ouvert: "Inscriptions ouvertes",
  ferme: "Inscriptions fermées",
  termine: "Terminé",
};

export function ConcoursCard({
  title,
  parcours,
  dateDebut,
  dateFin,
  frais,
  inscrits,
  status,
  onAction,
  actionLabel = "Voir détails",
}: ConcoursCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 animate-slide-up">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold text-lg text-card-foreground">
            {title}
          </h3>

          <div className="flex flex-wrap gap-2 mt-2">
            {parcours.map((p) => (
              <span
                key={p}
                className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-md"
              >
                {p}
              </span>
            ))}
          </div>
        </div>

        <span
          className={cn(
            "px-3 py-1 text-xs font-medium rounded-full border",
            statusStyles[status]
          )}
        >
          {statusLabels[status]}
        </span>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {dateDebut} - {dateFin}
          </span>
        </div>

        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <CreditCard className="h-4 w-4" />
          <span>{frais.toLocaleString()} Ar</span>
        </div>

        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{inscrits} candidat(s) inscrit(s)</span>
        </div>
      </div>

      {onAction && (
        <Button
          onClick={onAction}
          variant={status === "ouvert" ? "hero" : "outline"}
          className="w-full"
        >
          {actionLabel}
          <ArrowRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
