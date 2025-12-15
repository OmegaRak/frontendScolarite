import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusType = 
  | 'en_attente_paiement' 
  | 'paiement_en_validation' 
  | 'validee' 
  | 'rejetee'
  | 'en_attente'
  | 'valide'
  | 'rejete'
  | 'admis'
  | 'refuse'
  | 'rattrapage'
  | 'redouble'
  | 'paye'
  | 'ouvert'
  | 'ferme'
  | 'termine';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  'en_attente_paiement': { label: 'En attente de paiement', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  'paiement_en_validation': { label: 'en entente', className: 'bg-orange-100 text-orange-800 border-orange-200' },
  'validee': { label: 'Validée', className: 'bg-green-100 text-green-800 border-green-200' },
  'rejetee': { label: 'Rejetée', className: 'bg-red-100 text-red-800 border-red-200' },
  'en_attente': { label: 'En attente', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  'valide': { label: 'Validé', className: 'bg-green-100 text-green-800 border-green-200' },
  'rejete': { label: 'Rejeté', className: 'bg-red-100 text-red-800 border-red-200' },
  'admis': { label: 'Admis', className: 'bg-green-100 text-green-800 border-green-200' },
  'refuse': { label: 'Refusé', className: 'bg-red-100 text-red-800 border-red-200' },
  'rattrapage': { label: 'Rattrapage', className: 'bg-orange-100 text-orange-800 border-orange-200' },
  'redouble': { label: 'Redouble', className: 'bg-red-100 text-red-800 border-red-200' },
  'paye': { label: 'Payé', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  'ouvert': { label: 'Ouvert', className: 'bg-green-100 text-green-800 border-green-200' },
  'ferme': { label: 'Fermé', className: 'bg-gray-100 text-gray-800 border-gray-200' },
  'termine': { label: 'Terminé', className: 'bg-purple-100 text-purple-800 border-purple-200' },
};

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
  
  return (
    <Badge 
      variant="outline" 
      className={cn('font-medium', config.className, className)}
    >
      {config.label}
    </Badge>
  );
};
