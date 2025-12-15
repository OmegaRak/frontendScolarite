import { Link } from "react-router-dom";
import { GraduationCap, Users, Shield, ArrowRight, BookOpen, Trophy, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";


const Index = () => {
  const { isAuthenticated, role, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="bg-gradient-hero text-primary-foreground">
        <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <img 
              src={logo} 
              alt="Logo" 
              className="h-10 w-10 rounded-lg object-cover"
            />
            <span className="font-display font-bold text-xl">Université de Fianarsantsoa</span>
          </div>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link to={role === 'admin' ? '/admin' : '/etudiant'}>
                  <Button variant="ghost" className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10">
                    Mon Espace
                  </Button>
                </Link>
                <Button 
                  variant="hero" 
                  onClick={logout}
                >
                  Déconnexion
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button variant="hero">
                  <LogIn className="h-4 w-4 mr-2" />
                  Connexion
                </Button>
              </Link>
            )}
          </div>
        </nav>

        <div className="container mx-auto px-6 py-32 lg:py-48">
          <div className="max-w-3xl animate-slide-up">
            <h1 className="font-display text-4xl lg:text-6xl font-bold leading-tight mb-6">
              Portail d'Inscription & Réinscription Universitaire
            </h1>
            <p className="text-lg lg:text-xl text-primary-foreground/80 mb-8 max-w-2xl">
              Gérez vos inscriptions aux concours, suivez vos candidatures et effectuez vos réinscriptions en toute simplicité.
            </p>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Un processus simple en deux étapes pour votre parcours universitaire
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Inscription Card */}
            <div className="bg-card border border-border rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-up">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Trophy className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold text-card-foreground">
                    Inscription
                  </h3>
                  <p className="text-muted-foreground">Phase Concours</p>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-success text-sm font-bold">1</span>
                  </div>
                  <span className="text-muted-foreground">Consultez les concours disponibles</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-success text-sm font-bold">2</span>
                  </div>
                  <span className="text-muted-foreground">Soumettez votre candidature</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-success text-sm font-bold">3</span>
                  </div>
                  <span className="text-muted-foreground">Payez les frais de concours</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-success text-sm font-bold">4</span>
                  </div>
                  <span className="text-muted-foreground">Recevez votre reçu et passez le concours</span>
                </li>
              </ul>
              <Link to="/etudiant/concours">
                <Button variant="hero" className="w-full">
                  Commencer l'inscription
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Réinscription Card */}
            <div className="bg-card border border-border rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <div className="flex items-center gap-4 mb-6">
                <div className="h-14 w-14 rounded-xl bg-info/10 flex items-center justify-center">
                  <BookOpen className="h-7 w-7 text-info" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold text-card-foreground">
                    Réinscription
                  </h3>
                  <p className="text-muted-foreground">Après réussite au concours</p>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-info/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-info text-sm font-bold">1</span>
                  </div>
                  <span className="text-muted-foreground">Consultez vos résultats de concours</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-info/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-info text-sm font-bold">2</span>
                  </div>
                  <span className="text-muted-foreground">Initiez votre réinscription</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-info/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-info text-sm font-bold">3</span>
                  </div>
                  <span className="text-muted-foreground">Payez les droits de réinscription</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-info/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-info text-sm font-bold">4</span>
                  </div>
                  <span className="text-muted-foreground">Confirmez votre inscription annuelle</span>
                </li>
              </ul>
              <Link to="/etudiant/reinscription">
                <Button variant="outline" className="w-full">
                  Accéder à la réinscription
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Role Selection */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Connectez-vous à votre espace
            </h2>
            <p className="text-muted-foreground">
              Choisissez votre type de compte pour accéder à votre espace personnel
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Link to="/login" className="group">
              <div className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-xl hover:border-warning/30 transition-all duration-300 h-full">
                <div className="h-14 w-14 rounded-2xl bg-warning/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-7 w-7 text-warning" />
                </div>
                <h3 className="font-display text-lg font-bold text-card-foreground mb-2">
                  Candidat
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Avant les résultats du concours : postulez et payez les frais
                </p>
                <Button variant="outline" className="w-full border-warning/30 hover:bg-warning/10">
                  Se connecter
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Link>

            <Link to="/login" className="group">
              <div className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-xl hover:border-success/30 transition-all duration-300 h-full">
                <div className="h-14 w-14 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen className="h-7 w-7 text-success" />
                </div>
                <h3 className="font-display text-lg font-bold text-card-foreground mb-2">
                  Étudiant
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Après admission : réinscrivez-vous et consultez vos résultats
                </p>
                <Button variant="outline" className="w-full border-success/30 hover:bg-success/10">
                  Se connecter
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Link>

            <Link to="/login" className="group">
              <div className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-xl hover:border-info/30 transition-all duration-300 h-full">
                <div className="h-14 w-14 rounded-2xl bg-info/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="h-7 w-7 text-info" />
                </div>
                <h3 className="font-display text-lg font-bold text-card-foreground mb-2">
                  Administrateur
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Gérez les concours, validez les inscriptions et paiements
                </p>
                <Button variant="outline" className="w-full border-info/30 hover:bg-info/10">
                  Se connecter
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-sidebar text-sidebar-foreground py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <img 
                src={logo} 
                alt="Logo" 
                className="h-10 w-10 rounded-lg object-cover"
              />
              <span className="font-display font-bold text-xl">Université de Fianarsantsoa</span>
            </div>
            </div>
            <p className="text-sidebar-foreground/60 text-sm">
              © Université de Fianarsantsoa. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
