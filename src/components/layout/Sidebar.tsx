import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  GraduationCap,
  Users,
  FileText,
  Settings,
  LayoutDashboard,
  ClipboardList,
  Upload,
  Receipt,
  Trophy,
  BookOpen,
  CreditCard,
  Menu,
  X,
  LogOut,
  Building2,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { resultatsApi } from "@/lib/api/inscription";

interface SidebarProps {
  userType: "admin" | "student";
}

// Menu SuperAdmin (gestion globale)
const superAdminMenuItems = [
  { icon: LayoutDashboard, label: "Tableau de bord", path: "/admin" },
  { icon: Building2, label: "Établissements", path: "/admin/etablissements" },
  { icon: Shield, label: "Utilisateurs", path: "/admin/utilisateurs" },
  { icon: Upload, label: "Importer Bacheliers", path: "/admin/import-bacheliers" },
  { icon: Trophy, label: "Gestion Concours", path: "/admin/concours" },
  { icon: ClipboardList, label: "Candidatures", path: "/admin/candidatures" },
  { icon: Receipt, label: "Reçus & Paiements", path: "/admin/paiements" },
  { icon: FileText, label: "Résultats Concours", path: "/admin/resultats-concours" },
  { icon: BookOpen, label: "Résultats Examens", path: "/admin/resultats-examens" },
  { icon: Users, label: "Réinscriptions", path: "/admin/reinscriptions" },
  { icon: Settings, label: "Paramètres", path: "/admin/settings" },
];

// Menu Admin d'établissement
const adminMenuItems = [
  { icon: LayoutDashboard, label: "Tableau de bord", path: "/admin" },
  { icon: Upload, label: "Importer Bacheliers", path: "/admin/import-bacheliers" },
  { icon: Trophy, label: "Gestion Concours", path: "/admin/concours" },
  { icon: ClipboardList, label: "Candidatures", path: "/admin/candidatures" },
  { icon: Receipt, label: "Reçus & Paiements", path: "/admin/paiements" },
  { icon: FileText, label: "Résultats Concours", path: "/admin/resultats-concours" },
  { icon: BookOpen, label: "Résultats Examens", path: "/admin/resultats-examens" },
  { icon: Users, label: "Réinscriptions", path: "/admin/reinscriptions" },
  { icon: Settings, label: "Paramètres", path: "/admin/settings" },
];

// Menu items de base pour les étudiants/candidats
const baseStudentMenuItems = [
  { icon: LayoutDashboard, label: "Tableau de bord", path: "/etudiant" },
  { icon: Trophy, label: "Concours Disponibles", path: "/etudiant/concours" },
  { icon: ClipboardList, label: "Mes Candidatures", path: "/etudiant/candidatures" },
  { icon: CreditCard, label: "Paiements", path: "/etudiant/paiements" },
  { icon: FileText, label: "Mes Résultats", path: "/etudiant/resultats" },
];

// Item réinscription pour les étudiants admis
const reinscriptionMenuItem = { 
  icon: BookOpen, 
  label: "Réinscription", 
  path: "/etudiant/reinscription" 
};

export function Sidebar({ userType }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showReinscription, setShowReinscription] = useState(false);
  const location = useLocation();
  const { role } = useAuth();

  // Vérifier si l'utilisateur est éligible à la réinscription (a réussi le concours)
  useEffect(() => {
    const checkReinscriptionEligibility = async () => {
      // Seulement pour les étudiants
      if (userType !== 'student' || role !== 'etudiant') {
        setShowReinscription(false);
        return;
      }

      try {
        // Vérifier si l'étudiant a été admis à un concours
        const resultats = await resultatsApi.list();
        const hasAdmission = resultats.some(r => r.admis);
        setShowReinscription(hasAdmission);
      } catch (error) {
        console.error('Erreur vérification éligibilité réinscription:', error);
        // Par défaut, ne pas afficher si erreur
        setShowReinscription(false);
      }
    };

    checkReinscriptionEligibility();
  }, [userType, role]);

  // Construire le menu selon le type d'utilisateur et l'éligibilité
  const getMenuItems = () => {
    if (userType === "admin") {
      // SuperAdmin voit tout
      if (role === 'superadmin') {
        return superAdminMenuItems;
      }
      // Admin d'établissement
      return adminMenuItems;
    }

    // Pour les étudiants, ajouter réinscription si éligible
    if (showReinscription) {
      return [...baseStudentMenuItems, reinscriptionMenuItem];
    }

    return baseStudentMenuItems;
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-sidebar-border">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary">
              <GraduationCap className="h-6 w-6 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-sidebar-foreground">UniPortal</h1>
              <p className="text-xs text-sidebar-foreground/60">
                {userType === "admin" ? "Administration" : "Espace Étudiant"}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-sidebar-border p-4">
            <Link
              to="/"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Déconnexion
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
