import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useUtilisateurs } from "@/hooks/useUtilisateurs";
import { useEtablissements } from "@/hooks/useEtablissements";
import {
  Users,
  UserPlus,
  UserMinus,
  Shield,
  Building2,
  Loader2,
  Search,
  AlertTriangle,
} from "lucide-react";

export default function GestionUtilisateurs() {
  const { toast } = useToast();
  const {
    admins,
    loading: loadingAdmins,
    error,
    fetchAdmins,
    assignAdmin,
    revokeAdmin,
  } = useUtilisateurs();

  const {
    etablissements,
    fetchEtablissements,
  } = useEtablissements();

  const [searchTerm, setSearchTerm] = useState("");
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedEtablissementId, setSelectedEtablissementId] = useState<string>("");
  const [manualUserSearch, setManualUserSearch] = useState("");

  useEffect(() => {
    fetchAdmins();
    fetchEtablissements();
  }, [fetchAdmins, fetchEtablissements]);

  const handleAssignAdmin = async () => {
    if (!selectedUserId || !selectedEtablissementId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un utilisateur et un établissement",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await assignAdmin({
        utilisateur_id: parseInt(selectedUserId),
        etablissement_id: parseInt(selectedEtablissementId),
      });
      toast({
        title: "Admin assigné",
        description: result.message,
      });
      setIsAssignDialogOpen(false);
      setSelectedUserId("");
      setSelectedEtablissementId("");
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  const handleRevokeAdmin = async (userId: number, username: string) => {
    if (
      !confirm(
        `Êtes-vous sûr de vouloir révoquer les droits admin de "${username}" ?`
      )
    ) {
      return;
    }

    try {
      const result = await revokeAdmin(userId);
      toast({
        title: "Admin révoqué",
        description: result.message,
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.etablissement_details?.nom
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const activeEtablissements = etablissements.filter((e) => e.actif);

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display text-foreground">
              Gestion des Utilisateurs
            </h1>
            <p className="text-muted-foreground mt-1">
              Gérez les administrateurs et leurs établissements
            </p>
          </div>
          <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Assigner un Admin
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Assigner un administrateur</DialogTitle>
                <DialogDescription>
                  Assignez un utilisateur comme administrateur d'un établissement
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="user-id">ID Utilisateur</Label>
                  <Input
                    id="user-id"
                    type="number"
                    placeholder="Entrez l'ID de l'utilisateur"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Vous pouvez trouver l'ID utilisateur dans la base de données
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="etablissement">Établissement</Label>
                  <Select
                    value={selectedEtablissementId}
                    onValueChange={setSelectedEtablissementId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un établissement" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeEtablissements.map((etab) => (
                        <SelectItem key={etab.id} value={etab.id.toString()}>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            {etab.code} - {etab.nom}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {activeEtablissements.length === 0 && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-500/10 rounded-lg text-yellow-700 dark:text-yellow-400">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">
                      Aucun établissement actif. Veuillez d'abord créer un établissement.
                    </span>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                  Annuler
                </Button>
                <Button
                  onClick={handleAssignAdmin}
                  disabled={
                    loadingAdmins ||
                    !selectedUserId ||
                    !selectedEtablissementId
                  }
                >
                  {loadingAdmins && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Assigner
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total admins</p>
                  <p className="text-2xl font-bold">{admins.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <Building2 className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Établissements avec admin</p>
                  <p className="text-2xl font-bold">
                    {new Set(admins.filter(a => a.etablissement_details).map(a => a.etablissement_details?.id)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-orange-500/10">
                  <AlertTriangle className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Établissements sans admin</p>
                  <p className="text-2xl font-bold">
                    {etablissements.filter(e => e.actif && (e.nombre_admins === 0)).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admins Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>Administrateurs par établissement</CardTitle>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingAdmins && admins.length === 0 ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">{error}</div>
            ) : filteredAdmins.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {admins.length === 0
                  ? "Aucun administrateur assigné"
                  : "Aucun résultat pour cette recherche"}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Établissement</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAdmins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {admin.first_name} {admin.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              @{admin.username}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>
                        {admin.etablissement_details ? (
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {admin.etablissement_details.code}
                            </span>
                            <span className="text-muted-foreground">
                              - {admin.etablissement_details.nom}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">
                            Non assigné
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={admin.is_active ? "default" : "secondary"}>
                          {admin.is_active ? "Actif" : "Inactif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleRevokeAdmin(admin.id, admin.username)}
                        >
                          <UserMinus className="h-4 w-4 mr-1" />
                          Révoquer
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Établissements sans admin */}
        {etablissements.filter(e => e.actif && (e.nombre_admins === 0)).length > 0 && (
          <Card className="border-orange-200 dark:border-orange-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                <AlertTriangle className="h-5 w-5" />
                Établissements sans administrateur
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {etablissements
                  .filter(e => e.actif && (e.nombre_admins === 0))
                  .map((etab) => (
                    <div
                      key={etab.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{etab.code} - {etab.nom}</p>
                          <p className="text-sm text-muted-foreground">{etab.ville}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedEtablissementId(etab.id.toString());
                          setIsAssignDialogOpen(true);
                        }}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Assigner
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
