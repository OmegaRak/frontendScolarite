import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const useConvocation = (user: any, concours: any[]) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // -------- Générer HTML Convocation --------
  const generateConvocationHTML = (candidature: any, concoursInfo: any) => {
    const dateInscription = new Date(candidature.date_inscription);
    const dateDebut = new Date(concoursInfo.date_debut);
    const dateFin = new Date(concoursInfo.date_fin);

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Convocation</title>
</head>
<body>
  <h1>Convocation au Concours</h1>
  <p><strong>Nom :</strong> ${user?.nom} ${user?.prenom}</p>
  <p><strong>Concours :</strong> ${concoursInfo.nom}</p>
  <p><strong>Date début :</strong> ${dateDebut.toLocaleDateString("fr-FR")}</p>
  <p><strong>Date fin :</strong> ${dateFin.toLocaleDateString("fr-FR")}</p>
  <p><strong>Date inscription :</strong> ${dateInscription.toLocaleDateString("fr-FR")}</p>
</body>
</html>`;
  };

  // -------- Télécharger la convocation --------
  const telechargerConvocation = async (candidature: any) => {
    try {
      setLoading(true);

      const concoursInfo = concours.find((c: any) => c.id === candidature.concours);
      if (!concoursInfo) throw new Error("Concours introuvable");

      const htmlContent = generateConvocationHTML(candidature, concoursInfo);

      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `convocation_${concoursInfo.nom}.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);

      toast({
        title: "Convocation générée",
        description: "Le fichier de convocation a été téléchargé.",
      });
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    telechargerConvocation,
    loading,
  };
};
