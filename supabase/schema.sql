-- ============================================================
-- DIAMANT PRO SERVICES - Supabase Schema
-- ============================================================

-- 1. CLIENTS
CREATE TABLE IF NOT EXISTS clients (
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

-- 2. SERVICES
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR(255) NOT NULL,
  domaine VARCHAR(50) NOT NULL CHECK (domaine IN ('nettoyage', '3d')),
  description TEXT,
  prix_defaut NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. INTERVENTIONS
CREATE TABLE IF NOT EXISTS interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
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

-- 4. DOCUMENTS
CREATE TABLE IF NOT EXISTS documents (
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
CREATE INDEX IF NOT EXISTS idx_interventions_client_id ON interventions(client_id);
CREATE INDEX IF NOT EXISTS idx_interventions_date ON interventions(date_intervention);
CREATE INDEX IF NOT EXISTS idx_interventions_statut ON interventions(statut);
CREATE INDEX IF NOT EXISTS idx_documents_client_id ON documents(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_numero ON documents(numero);
CREATE INDEX IF NOT EXISTS idx_clients_prochaine_visite ON clients(prochaine_visite);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS clients_updated_at ON clients;
CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS services_updated_at ON services;
CREATE TRIGGER services_updated_at
  BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS interventions_updated_at ON interventions;
CREATE TRIGGER interventions_updated_at
  BEFORE UPDATE ON interventions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS documents_updated_at ON documents;
CREATE TRIGGER documents_updated_at
  BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- RESET & SEED DATA
-- ============================================================

DELETE FROM documents;
DELETE FROM interventions;
DELETE FROM clients;
DELETE FROM services;

-- SERVICES - Nettoyage
INSERT INTO services (nom, domaine, description, prix_defaut) VALUES
('Nettoyage appartement', 'nettoyage', 'Nettoyage complet appartement (sol, vitres, sanitaires)', 800.00),
('Nettoyage villa', 'nettoyage', 'Nettoyage complet villa ou maison individuelle', 1500.00),
('Nettoyage bureau', 'nettoyage', 'Nettoyage bureaux et espaces de travail', 600.00),
('Nettoyage usine', 'nettoyage', 'Nettoyage industriel et ateliers', 3000.00),
('Nettoyage après chantier', 'nettoyage', 'Nettoyage fin de chantier (poussières, gravats)', 2000.00),
('Nettoyage vitres', 'nettoyage', 'Lavage vitres et façades vitrées', 500.00),
('Nettoyage tapis & moquette', 'nettoyage', 'Nettoyage tapis, moquette et revêtements', 400.00),
('Nettoyage façade', 'nettoyage', 'Nettoyage façade et murs extérieurs', 2500.00),
('Nettoyage cuisines pro', 'nettoyage', 'Nettoyage cuisines professionnelles et hottes', 1200.00),
('Nettoyage complet sur devis', 'nettoyage', 'Nettoyage sur mesure selon vos besoins', 0.00);

-- SERVICES - 3D (Dératisation, Désinfection, Désinsectisation)
INSERT INTO services (nom, domaine, description, prix_defaut) VALUES
('Dératisation', '3d', 'Traitement anti-rongeurs (rats, souris)', 1200.00),
('Désinfection', '3d', 'Désinfection bactéricide et virucide', 800.00),
('Désinsectisation', '3d', 'Traitement anti-insectes rampants et volants', 1000.00),
('Traitement anti-termites', '3d', 'Lutte contre les termites et xylophages', 2000.00),
('Fumigation', '3d', 'Traitement par gaz pour infestations sévères', 3500.00),
('Lutte anti-punaises de lit', '3d', 'Traitement spécifique punaises de lit', 1500.00),
('Traitement anti-moustiques', '3d', 'Traitement extérieur anti-moustiques', 900.00),
('Forfait 3D complet', '3d', 'Dératisation + Désinfection + Désinsectisation', 2500.00);

-- CLIENTS
INSERT INTO clients (nom, telephone, email, ice, adresse, ville, prochaine_visite) VALUES
('MINI BRIOCH', '0528-101010', 'minibrioch@gmail.com', 'ICE12340101', 'Av. Hassan II', 'Agadir', '2025-07-01'),
('MARK KIDS', '0528-202020', 'markkids@gmail.com', 'ICE12340102', 'Rue des Orangers', 'Agadir', '2025-06-28'),
('PATTE FILO', '0528-303030', 'pattefilo@gmail.com', 'ICE12340103', 'Centre Aït Melloul', 'Aït Melloul', '2025-07-05'),
('LUMIER DES YEUX', '0528-404040', 'lumieryeux@gmail.com', 'ICE12340104', 'Av. Mohammed V', 'Agadir', '2025-06-30'),
('EXELENCIA', '0528-505050', 'exelencia@gmail.com', 'ICE12340105', 'Quartier Founty', 'Agadir', '2025-07-10'),
('ECO TERRE', '0528-606060', 'ecoterre@gmail.com', 'ICE12340106', 'Houara', 'Houara', '2025-07-12'),
('RESIDENCE HYVERNAGE', '0528-707070', 'hyvernage@gmail.com', 'ICE12340107', 'Agadir Bay', 'Agadir', '2025-07-03'),
('PIONNER BUSINESS', '0528-808080', 'pionner@gmail.com', 'ICE12340108', 'Av. des FAR', 'Agadir', '2025-07-08'),
('STE MCDA', '0528-909090', 'mcda@gmail.com', 'ICE12340109', 'Zone industrielle Houara', 'Houara', '2025-06-25'),
('KEI KAI SURF', '0528-111111', 'keikaisurf@gmail.com', 'ICE12340110', 'Plage de Taghazout', 'Taghazout', '2025-07-15');

-- Interventions initiales
INSERT INTO interventions (client_id, date_intervention, heure_debut, heure_fin, type_prestation, statut, montant)
SELECT id, '2025-06-20', '09:00', '12:00', 'Nettoyage appartement', 'planifiee', 800.00 FROM clients WHERE nom = 'MINI BRIOCH';

INSERT INTO interventions (client_id, date_intervention, heure_debut, heure_fin, type_prestation, statut, montant)
SELECT id, '2025-06-22', '10:00', '13:00', 'Désinfection', 'planifiee', 800.00 FROM clients WHERE nom = 'MARK KIDS';

INSERT INTO interventions (client_id, date_intervention, heure_debut, heure_fin, type_prestation, statut, montant)
SELECT id, '2025-06-25', '08:00', '11:00', 'Nettoyage complet sur devis', 'effectuee', 1800.00 FROM clients WHERE nom = 'PATTE FILO';

INSERT INTO interventions (client_id, date_intervention, heure_debut, heure_fin, type_prestation, statut, montant)
SELECT id, '2025-06-28', '14:00', '17:00', 'Dératisation', 'planifiee', 1200.00 FROM clients WHERE nom = 'LUMIER DES YEUX';

INSERT INTO interventions (client_id, date_intervention, heure_debut, heure_fin, type_prestation, statut, montant)
SELECT id, '2025-07-01', '09:00', '12:00', 'Nettoyage villa', 'planifiee', 1500.00 FROM clients WHERE nom = 'EXELENCIA';
