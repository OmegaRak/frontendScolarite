import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import GestionConcours from "./pages/admin/GestionConcours";
import ImportBacheliers from "./pages/admin/ImportBacheliers";
import GestionCandidatures from "./pages/admin/GestionCandidatures";
import GestionPaiements from "./pages/admin/GestionPaiements";
import ResultatsConcours from "./pages/admin/ResultatsConcours";
import ResultatsExamens from "./pages/admin/ResultatsExamens";
import GestionReinscriptions from "./pages/admin/GestionReinscriptions";
import GestionEtablissements from "./pages/admin/GestionEtablissements";
import GestionUtilisateurs from "./pages/admin/GestionUtilisateurs";

// Student Pages
import EtudiantDashboard from "./pages/etudiant/EtudiantDashboard";
import ConcoursDisponibles from "./pages/etudiant/ConcoursDisponibles";
import MesCandidatures from "./pages/etudiant/MesCandidatures";
import MesPaiements from "./pages/etudiant/MesPaiements";
import MesResultats from "./pages/etudiant/MesResultats";
import Reinscription from "./pages/etudiant/Reinscription";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Auth />} />
            
            {/* Admin Routes - Protected */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            0 <Route path="/admin/etablissements" element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <GestionEtablissements />
              </ProtectedRoute>
            } />
            <Route path="/admin/utilisateurs" element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <GestionUtilisateurs />
              </ProtectedRoute>
            } />
            <Route path="/admin/concours" element={
              <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                <GestionConcours />
              </ProtectedRoute>
            } />
            <Route path="/admin/import-bacheliers" element={
              <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                <ImportBacheliers />
              </ProtectedRoute>
            } />
            <Route path="/admin/candidatures" element={
              <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                <GestionCandidatures />
              </ProtectedRoute>
            } />
            <Route path="/admin/paiements" element={
              <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                <GestionPaiements />
              </ProtectedRoute>
            } />
            <Route path="/admin/resultats-concours" element={
              <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                <ResultatsConcours />
              </ProtectedRoute>
            } />
            <Route path="/admin/resultats-examens" element={
              <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                <ResultatsExamens />
              </ProtectedRoute>
            } />
            <Route path="/admin/reinscriptions" element={
              <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                <GestionReinscriptions />
              </ProtectedRoute>
            } />
            
            {/* Student/Candidat Routes - Protected */}
            <Route path="/etudiant" element={
              <ProtectedRoute allowedRoles={['candidat', 'etudiant']}>
                <EtudiantDashboard />
              </ProtectedRoute>
            } />
            <Route path="/etudiant/concours" element={
              <ProtectedRoute allowedRoles={['candidat', 'etudiant']}>
                <ConcoursDisponibles />
              </ProtectedRoute>
            } />
            <Route path="/etudiant/candidatures" element={
              <ProtectedRoute allowedRoles={['candidat', 'etudiant']}>
                <MesCandidatures />
              </ProtectedRoute>
            } />
            <Route path="/etudiant/paiements" element={
              <ProtectedRoute allowedRoles={['candidat', 'etudiant']}>
                <MesPaiements />
              </ProtectedRoute>
            } />
            <Route path="/etudiant/resultats" element={
              <ProtectedRoute allowedRoles={['candidat', 'etudiant']}>
                <MesResultats />
              </ProtectedRoute>
            } />
            <Route path="/etudiant/reinscription" element={
              <ProtectedRoute allowedRoles={['etudiant']}>
                <Reinscription />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
