import { CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "en_attente" | "validee" | "refusee" | "paiement_en_attente";

interface CandidatureStatusProps {
  status: Status;
  concours: string;
  date: string;
  parcours: string;
}

const statusConfig = {
  en_attente: {
    icon: Clock,
    label: "En attente de validation",
    className: "bg-warning/10 text-warning border-warning/20",
  },
  validee: {
    icon: CheckCircle,
    label: "Candidature validée",
    className: "bg-success/10 text-success border-success/20",
  },
  refusee: {
    icon: XCircle,
    label: "Candidature refusée",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  paiement_en_attente: {
    icon: AlertCircle,
    label: "Paiement en attente",
    className: "bg-info/10 text-info border-info/20",
  },
};

export function CandidatureStatus({
  status,
  concours,
  date,
  parcours,
}: CandidatureStatusProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className={cn("p-2 rounded-lg border", config.className)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-card-foreground">{concours}</h4>
          <p className="text-sm text-muted-foreground mt-1">
            Parcours: {parcours}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Soumis le {date}
          </p>
        </div>
        <span
          className={cn(
            "px-3 py-1 text-xs font-medium rounded-full border",
            config.className
          )}
        >
          {config.label}
        </span>
      </div>
    </div>
  );
}
