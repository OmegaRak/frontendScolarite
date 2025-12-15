export const generateAndDownloadConvocation = async (candidature: any, concoursList: any[], user: any) => {
    const concoursInfo = concoursList.find(c => c.id === candidature.concours);
    if (!concoursInfo) throw new Error("Concours introuvable");
  
    const dateInscription = new Date(candidature.date_inscription);
  
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <title>Convocation</title>
    </head>
    <body>
      <h1>Convocation au concours : ${concoursInfo.nom}</h1>
      <p><strong>Nom :</strong> ${user?.nom} ${user?.prenom}</p>
      <p><strong>Date d'inscription :</strong> ${dateInscription.toLocaleDateString('fr-FR')}</p>
      <p><strong>Montant :</strong> ${concoursInfo.prix} Ar</p>
    </body>
    </html>
    `;
  
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
  
    const a = document.createElement("a");
    a.href = url;
    a.download = `Convocation_${concoursInfo.nom.replace(/\s+/g, '_')}.html`;
    a.click();
  
    URL.revokeObjectURL(url);
  };
  