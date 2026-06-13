-- ============================================================
-- DIAMANT PRO SERVICES - Supabase Schema
-- ============================================================

-- 1. CLIENTS
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR(255) NOT NULL,
  telephone VARCHAR(50),
  email VARCHAR(255),
  ice VARCHAR(255),
  adresse TEXT,
  ville VARCHAR(100),
  code_postal VARCHAR(20),
  notes TEXT,
  prochaine_visite DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. INTERVENTIONS
CREATE TABLE interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  date_intervention DATE NOT NULL,
  heure_debut TIME,
  heure_fin TIME,
  type_prestation VARCHAR(255) NOT NULL,
  statut VARCHAR(50) DEFAULT 'planifiee' CHECK (statut IN ('planifiee', 'effectuee', 'annulee')),
  montant NUMERIC(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. DOCUMENTS (devis, factures, bons de livraison)
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  intervention_id UUID REFERENCES interventions(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('devis', 'facture', 'bon_livraison')),
  numero VARCHAR(255) NOT NULL UNIQUE,
  date_emission DATE NOT NULL DEFAULT CURRENT_DATE,
  montant_ht NUMERIC(10,2),
  montant_ttc NUMERIC(10,2),
  statut VARCHAR(50) DEFAULT 'brouillon' CHECK (statut IN ('brouillon', 'envoye', 'paye', 'annule')),
  contenu JSONB,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_interventions_client_id ON interventions(client_id);
CREATE INDEX idx_interventions_date ON interventions(date_intervention);
CREATE INDEX idx_interventions_statut ON interventions(statut);
CREATE INDEX idx_documents_client_id ON documents(client_id);
CREATE INDEX idx_documents_type ON documents(type);
CREATE INDEX idx_documents_numero ON documents(numero);
CREATE INDEX idx_clients_prochaine_visite ON clients(prochaine_visite);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER interventions_updated_at
  BEFORE UPDATE ON interventions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER documents_updated_at
  BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- SAMPLE DATA (à remplacer par vos vraies données)
-- ============================================================

INSERT INTO clients (nom, telephone, email, ice, adresse, ville, prochaine_visite) VALUES
('Société Al Omrane', '0522-123456', 'contact@alomrane.ma', 'ICE12345678', '12 Rue Hassan II', 'Casablanca', '2025-04-15'),
('Restaurant Le Jardin', '0524-789012', 'info@lejardin.ma', 'ICE23456789', '45 Av. Mohammed V', 'Marrakech', '2025-04-20'),
('Clinique Atlas', '0528-345678', 'direction@cliniqueatlas.ma', 'ICE34567890', '8 Bd Zerktouni', 'Rabat', '2025-04-10'),
('Hôtel Royal', '0522-901234', 'reservation@hotelroyal.ma', 'ICE45678901', '200 Corniche', 'Casablanca', '2025-04-25'),
('École Ibn Sina', '0527-567890', 'contact@ibnsina.ma', 'ICE56789012', '34 Rue de la Liberté', 'Fès', '2025-05-01');

INSERT INTO interventions (client_id, date_intervention, type_prestation, statut, montant) 
SELECT id, '2025-04-15', 'Nettoyage complet', 'planifiee', 2500.00 FROM clients WHERE nom = 'Société Al Omrane';

INSERT INTO interventions (client_id, date_intervention, type_prestation, statut, montant) 
SELECT id, '2025-04-10', 'Dératisation', 'planifiee', 1800.00 FROM clients WHERE nom = 'Clinique Atlas';

INSERT INTO interventions (client_id, date_intervention, type_prestation, statut, montant) 
SELECT id, '2025-03-28', 'Désinsectisation', 'effectuee', 1500.00 FROM clients WHERE nom = 'Restaurant Le Jardin';

INSERT INTO interventions (client_id, date_intervention, type_prestation, statut, montant) 
SELECT id, '2025-04-20', 'Nettoyage tapis', 'planifiee', 3200.00 FROM clients WHERE nom = 'Restaurant Le Jardin';

INSERT INTO interventions (client_id, date_intervention, type_prestation, statut, montant) 
SELECT id, '2025-03-15', 'Désinfection', 'effectuee', 2000.00 FROM clients WHERE nom = 'Hôtel Royal';
