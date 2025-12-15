// Types
export interface Bachelier {
  id: string;
  nom: string;
  prenom: string;
  numeroBac: string;
  serie: string;
  annee: string;
  etablissement: string;
  moyenne: number;
  dateImport: string;
}

export interface Concours {
  id: string;
  titre: string;
  parcours: string[];
  dateDebut: string;
  dateFin: string;
  frais: number;
  places: number;
  inscrits: number;
  statut: 'ouvert' | 'ferme' | 'termine';
  description: string;
}

export interface Candidature {
  id: string;
  candidatId: string;
  candidatNom: string;
  candidatPrenom: string;
  concoursId: string;
  concoursTitre: string;
  parcours: string;
  datePostulation: string;
  statut: 'en_attente_paiement' | 'paiement_en_validation' | 'validee' | 'rejetee';
  montant: number;
}

export interface Paiement {
  id: string;
  candidatureId: string;
  candidatNom: string;
  candidatPrenom: string;
  concours: string;
  montant: number;
  reference: string;
  modePaiement: 'mvola' | 'orange_money' | 'airtel_money';
  datePaiement: string;
  statut: 'en_attente' | 'valide' | 'rejete';
  recu?: string;
}

export interface Resultat {
  id: string;
  candidatId: string;
  candidatNom: string;
  candidatPrenom: string;
  concoursId: string;
  concoursTitre: string;
  note?: number;
  rang?: number;
  resultat: 'admis' | 'refuse';
  datePublication: string;
  publie: boolean;
}

export interface ResultatExamen {
  id: string;
  etudiantId: string;
  etudiantNom: string;
  etudiantPrenom: string;
  niveau: 'L2' | 'L3' | 'M1' | 'M2';
  parcours: string;
  anneeAcademique: string;
  moyenne: number;
  resultat: 'admis' | 'rattrapage' | 'redouble';
  datePublication: string;
  publie: boolean;
}

export interface Reinscription {
  id: string;
  etudiantId: string;
  etudiantNom: string;
  etudiantPrenom: string;
  niveauActuel: string;
  niveauSuivant: string;
  parcours: string;
  montant: number;
  statutPaiement: 'en_attente' | 'paye' | 'valide' | 'refuse';
  datedemande: string;
  carteEtudiant?: string;
}

// Mock Data
export const mockBacheliers: Bachelier[] = [
  { id: '1', nom: 'Rakoto', prenom: 'Jean', numeroBac: 'A-2023-001', serie: 'C', annee: '2023', etablissement: 'Lycée Gallieni', moyenne: 14.5, dateImport: '2024-01-15' },
  { id: '2', nom: 'Ranaivo', prenom: 'Marie', numeroBac: 'A-2023-002', serie: 'D', annee: '2023', etablissement: 'Lycée Andohalo', moyenne: 15.2, dateImport: '2024-01-15' },
  { id: '3', nom: 'Andria', prenom: 'Paul', numeroBac: 'A-2023-003', serie: 'C', annee: '2023', etablissement: 'Lycée Nanisana', moyenne: 13.8, dateImport: '2024-01-15' },
  { id: '4', nom: 'Razafy', prenom: 'Sophie', numeroBac: 'A-2023-004', serie: 'A2', annee: '2023', etablissement: 'Lycée Ampefiloha', moyenne: 16.1, dateImport: '2024-01-16' },
  { id: '5', nom: 'Ramana', prenom: 'Luc', numeroBac: 'A-2023-005', serie: 'C', annee: '2023', etablissement: 'Lycée Antsirabe', moyenne: 12.9, dateImport: '2024-01-16' },
  { id: '6', nom: 'Rasoana', prenom: 'Emma', numeroBac: 'A-2023-006', serie: 'D', annee: '2023', etablissement: 'Lycée Fianarantsoa', moyenne: 14.0, dateImport: '2024-01-17' },
  { id: '7', nom: 'Rajao', prenom: 'Pierre', numeroBac: 'A-2023-007', serie: 'C', annee: '2023', etablissement: 'Lycée Majunga', moyenne: 15.5, dateImport: '2024-01-17' },
  { id: '8', nom: 'Ravelo', prenom: 'Anna', numeroBac: 'A-2023-008', serie: 'A1', annee: '2023', etablissement: 'Lycée Tamatave', moyenne: 13.2, dateImport: '2024-01-18' },
];

export const mockConcours: Concours[] = [
  {
    id: '1',
    titre: 'Concours L1 Informatique 2024',
    parcours: ['Génie Logiciel', 'Réseaux', 'Intelligence Artificielle'],
    dateDebut: '2024-02-01',
    dateFin: '2024-03-15',
    frais: 25000,
    places: 150,
    inscrits: 89,
    statut: 'ouvert',
    description: 'Concours d\'entrée en première année de Licence Informatique'
  },
  {
    id: '2',
    titre: 'Concours L1 Mathématiques 2024',
    parcours: ['Mathématiques Pures', 'Mathématiques Appliquées'],
    dateDebut: '2024-02-15',
    dateFin: '2024-03-30',
    frais: 20000,
    places: 100,
    inscrits: 45,
    statut: 'ouvert',
    description: 'Concours d\'entrée en première année de Licence Mathématiques'
  },
  {
    id: '3',
    titre: 'Concours L1 Physique 2024',
    parcours: ['Physique Fondamentale', 'Physique Appliquée'],
    dateDebut: '2024-01-15',
    dateFin: '2024-02-28',
    frais: 22000,
    places: 80,
    inscrits: 80,
    statut: 'ferme',
    description: 'Concours d\'entrée en première année de Licence Physique'
  },
];

export const mockCandidatures: Candidature[] = [
  { id: '1', candidatId: '1', candidatNom: 'Rakoto', candidatPrenom: 'Jean', concoursId: '1', concoursTitre: 'Concours L1 Informatique 2024', parcours: 'Génie Logiciel', datePostulation: '2024-02-05', statut: 'validee', montant: 25000 },
  { id: '2', candidatId: '1', candidatNom: 'Rakoto', candidatPrenom: 'Jean', concoursId: '2', concoursTitre: 'Concours L1 Mathématiques 2024', parcours: 'Mathématiques Appliquées', datePostulation: '2024-02-20', statut: 'en_attente_paiement', montant: 20000 },
  { id: '3', candidatId: '2', candidatNom: 'Ranaivo', candidatPrenom: 'Marie', concoursId: '1', concoursTitre: 'Concours L1 Informatique 2024', parcours: 'Intelligence Artificielle', datePostulation: '2024-02-08', statut: 'paiement_en_validation', montant: 25000 },
  { id: '4', candidatId: '3', candidatNom: 'Andria', candidatPrenom: 'Paul', concoursId: '1', concoursTitre: 'Concours L1 Informatique 2024', parcours: 'Réseaux', datePostulation: '2024-02-10', statut: 'validee', montant: 25000 },
  { id: '5', candidatId: '4', candidatNom: 'Razafy', candidatPrenom: 'Sophie', concoursId: '2', concoursTitre: 'Concours L1 Mathématiques 2024', parcours: 'Mathématiques Pures', datePostulation: '2024-02-22', statut: 'rejetee', montant: 20000 },
  { id: '6', candidatId: '5', candidatNom: 'Ramana', candidatPrenom: 'Luc', concoursId: '3', concoursTitre: 'Concours L1 Physique 2024', parcours: 'Physique Fondamentale', datePostulation: '2024-01-20', statut: 'validee', montant: 22000 },
];

export const mockPaiements: Paiement[] = [
  { id: '1', candidatureId: '1', candidatNom: 'Rakoto', candidatPrenom: 'Jean', concours: 'Concours L1 Informatique 2024', montant: 25000, reference: 'MVL-2024-001', modePaiement: 'mvola', datePaiement: '2024-02-06', statut: 'valide', recu: 'REC-001' },
  { id: '2', candidatureId: '3', candidatNom: 'Ranaivo', candidatPrenom: 'Marie', concours: 'Concours L1 Informatique 2024', montant: 25000, reference: 'ORG-2024-002', modePaiement: 'orange_money', datePaiement: '2024-02-09', statut: 'en_attente' },
  { id: '3', candidatureId: '4', candidatNom: 'Andria', candidatPrenom: 'Paul', concours: 'Concours L1 Informatique 2024', montant: 25000, reference: 'AIR-2024-003', modePaiement: 'airtel_money', datePaiement: '2024-02-11', statut: 'valide', recu: 'REC-002' },
  { id: '4', candidatureId: '6', candidatNom: 'Ramana', candidatPrenom: 'Luc', concours: 'Concours L1 Physique 2024', montant: 22000, reference: 'MVL-2024-004', modePaiement: 'mvola', datePaiement: '2024-01-21', statut: 'valide', recu: 'REC-003' },
  { id: '5', candidatureId: '5', candidatNom: 'Razafy', candidatPrenom: 'Sophie', concours: 'Concours L1 Mathématiques 2024', montant: 20000, reference: 'ORG-2024-005', modePaiement: 'orange_money', datePaiement: '2024-02-23', statut: 'rejete' },
];

export const mockResultats: Resultat[] = [
  { id: '1', candidatId: '1', candidatNom: 'Rakoto', candidatPrenom: 'Jean', concoursId: '1', concoursTitre: 'Concours L1 Informatique 2024', note: 16.5, rang: 5, resultat: 'admis', datePublication: '2024-04-01', publie: true },
  { id: '2', candidatId: '3', candidatNom: 'Andria', candidatPrenom: 'Paul', concoursId: '1', concoursTitre: 'Concours L1 Informatique 2024', note: 12.0, rang: 120, resultat: 'refuse', datePublication: '2024-04-01', publie: true },
  { id: '3', candidatId: '5', candidatNom: 'Ramana', candidatPrenom: 'Luc', concoursId: '3', concoursTitre: 'Concours L1 Physique 2024', note: 14.2, rang: 25, resultat: 'admis', datePublication: '2024-03-15', publie: true },
];

export const mockResultatsExamens: ResultatExamen[] = [
  { id: '1', etudiantId: '10', etudiantNom: 'Andria', etudiantPrenom: 'Marc', niveau: 'L2', parcours: 'Génie Logiciel', anneeAcademique: '2023-2024', moyenne: 14.5, resultat: 'admis', datePublication: '2024-06-15', publie: true },
  { id: '2', etudiantId: '11', etudiantNom: 'Rabe', etudiantPrenom: 'Lina', niveau: 'L2', parcours: 'Génie Logiciel', anneeAcademique: '2023-2024', moyenne: 9.8, resultat: 'rattrapage', datePublication: '2024-06-15', publie: true },
  { id: '3', etudiantId: '12', etudiantNom: 'Solo', etudiantPrenom: 'Fidy', niveau: 'L3', parcours: 'Réseaux', anneeAcademique: '2023-2024', moyenne: 15.2, resultat: 'admis', datePublication: '2024-06-15', publie: true },
  { id: '4', etudiantId: '13', etudiantNom: 'Hery', etudiantPrenom: 'Tiana', niveau: 'M1', parcours: 'Intelligence Artificielle', anneeAcademique: '2023-2024', moyenne: 16.0, resultat: 'admis', datePublication: '2024-06-15', publie: false },
];

export const mockReinscriptions: Reinscription[] = [
  { id: '1', etudiantId: '1', etudiantNom: 'Rakoto', etudiantPrenom: 'Jean', niveauActuel: 'L1', niveauSuivant: 'L2', parcours: 'Génie Logiciel', montant: 150000, statutPaiement: 'en_attente', datedemande: '2024-04-05' },
  { id: '2', etudiantId: '10', etudiantNom: 'Andria', etudiantPrenom: 'Marc', niveauActuel: 'L2', niveauSuivant: 'L3', parcours: 'Génie Logiciel', montant: 175000, statutPaiement: 'paye', datedemande: '2024-06-20' },
  { id: '3', etudiantId: '12', etudiantNom: 'Solo', etudiantPrenom: 'Fidy', niveauActuel: 'L3', niveauSuivant: 'M1', parcours: 'Réseaux', montant: 200000, statutPaiement: 'valide', datedemande: '2024-06-18', carteEtudiant: 'CARTE-2024-012' },
  { id: '4', etudiantId: '5', etudiantNom: 'Ramana', etudiantPrenom: 'Luc', niveauActuel: 'L1', niveauSuivant: 'L2', parcours: 'Physique Fondamentale', montant: 150000, statutPaiement: 'refuse', datedemande: '2024-04-10' },
];

// Utility functions
export const getStatutCandidatureLabel = (statut: Candidature['statut']) => {
  const labels = {
    'en_attente_paiement': 'En attente de paiement',
    'paiement_en_validation': 'en entente',
    'validee': 'Validée',
    'rejetee': 'Rejetée'
  };
  return labels[statut];
};

export const getStatutPaiementLabel = (statut: Paiement['statut']) => {
  const labels = {
    'en_attente': 'En attente',
    'valide': 'Validé',
    'rejete': 'Rejeté'
  };
  return labels[statut];
};

export const getModePaiementLabel = (mode: Paiement['modePaiement']) => {
  const labels = {
    'mvola': 'MVola',
    'orange_money': 'Orange Money',
    'airtel_money': 'Airtel Money'
  };
  return labels[mode];
};
