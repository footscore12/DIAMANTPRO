export interface Client {
  id: string;
  nom: string;
  telephone: string | null;
  email: string | null;
  ice: string | null;
  adresse: string | null;
  ville: string | null;
  code_postal: string | null;
  notes: string | null;
  prochaine_visite: string | null;
  created_at: string;
  updated_at: string;
}

export interface Intervention {
  id: string;
  client_id: string;
  date_intervention: string;
  heure_debut: string | null;
  heure_fin: string | null;
  type_prestation: string;
  statut: 'planifiee' | 'effectuee' | 'annulee';
  montant: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  client?: Client;
}

export interface Document {
  id: string;
  client_id: string;
  intervention_id: string | null;
  type: 'devis' | 'facture' | 'bon_livraison';
  numero: string;
  date_emission: string;
  montant_ht: number | null;
  montant_ttc: number | null;
  statut: 'brouillon' | 'envoye' | 'paye' | 'annule';
  contenu: any;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
  client?: Client;
}

export type NewClient = Omit<Client, 'id' | 'created_at' | 'updated_at'>;
export type NewIntervention = Omit<Intervention, 'id' | 'created_at' | 'updated_at'>;
export type NewDocument = Omit<Document, 'id' | 'created_at' | 'updated_at'>;

export const PRESTATIONS = [
  'Nettoyage complet',
  'Nettoyage tapis',
  'Nettoyage vitres',
  'Dératisation',
  'Désinfection',
  'Désinsectisation',
  'Nettoyage après chantier',
  'Nettoyage bureaux',
  'Autre',
] as const;

export const STATUT_INTERVENTION = [
  'planifiee',
  'effectuee',
  'annulee',
] as const;

export const TYPE_DOCUMENT = [
  'devis',
  'facture',
  'bon_livraison',
] as const;
