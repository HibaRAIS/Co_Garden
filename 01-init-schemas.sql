-- ============================================
-- SCRIPT D'INITIALISATION DES SCHÉMAS ET TABLES
-- Co-Garden - PostgreSQL Database Structure
-- ============================================

\c cogarden;

-- ============================================
-- CRÉATION DES SCHÉMAS
-- ============================================

CREATE SCHEMA IF NOT EXISTS membres;
CREATE SCHEMA IF NOT EXISTS catalogue;
CREATE SCHEMA IF NOT EXISTS parcelles;
CREATE SCHEMA IF NOT EXISTS taches;

-- ============================================
-- SCHÉMA MEMBRES - Tables
-- ============================================

CREATE TABLE IF NOT EXISTS membres.members (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'membre' CHECK (role IN ('admin', 'membre')),
    join_date TIMESTAMP DEFAULT NOW(),
    skills TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- SCHÉMA CATALOGUE - Tables
-- ============================================

CREATE TABLE IF NOT EXISTS catalogue.plants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    scientific_name VARCHAR(300),
    type VARCHAR(100),
    description TEXT,
    care_instructions TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS catalogue.comments (
    id SERIAL PRIMARY KEY,
    plant_id INTEGER NOT NULL,
    user_id VARCHAR(100),
    author VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_plant FOREIGN KEY (plant_id) REFERENCES catalogue.plants(id) ON DELETE CASCADE
);

-- ============================================
-- SCHÉMA PARCELLES - Tables
-- ============================================

CREATE TABLE IF NOT EXISTS parcelles.plots (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    surface FLOAT NOT NULL,
    status VARCHAR(50) DEFAULT 'available',
    soil_type VARCHAR(100),
    image VARCHAR(500),
    current_plant VARCHAR(200),
    plant_emoji VARCHAR(10),
    occupant VARCHAR(200),
    occupantid INTEGER,
    history TEXT[]
);

CREATE TABLE IF NOT EXISTS parcelles.assignment_requests (
    id SERIAL PRIMARY KEY,
    plot_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    motivation TEXT,
    requested_at TIMESTAMP DEFAULT NOW(),
    reviewed_at TIMESTAMP,
    CONSTRAINT fk_plot FOREIGN KEY (plot_id) REFERENCES parcelles.plots(id) ON DELETE CASCADE
);

-- ============================================
-- SCHÉMA TACHES - Tables
-- ============================================

CREATE TABLE IF NOT EXISTS taches.tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'to_do' CHECK (status IN ('to_do', 'in_progress', 'done')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS taches.task_assignments (
    task_id INTEGER NOT NULL,
    member_id VARCHAR(50) NOT NULL,
    assigned_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (task_id, member_id),
    CONSTRAINT fk_task FOREIGN KEY (task_id) REFERENCES taches.tasks(id) ON DELETE CASCADE
);

-- ============================================
-- SÉQUENCES - Initialisation
-- ============================================

-- Les séquences seront créées automatiquement par SERIAL
-- Mais on s'assure qu'elles existent au cas où

SELECT setval('membres.members_id_seq', 1, false);
SELECT setval('catalogue.plants_id_seq', 1, false);
SELECT setval('catalogue.comments_id_seq', 1, false);
SELECT setval('parcelles.plots_id_seq', 1, false);
SELECT setval('parcelles.assignment_requests_id_seq', 1, false);
SELECT setval('taches.tasks_id_seq', 1, false);

-- ============================================
-- PERMISSIONS
-- ============================================

GRANT ALL PRIVILEGES ON SCHEMA membres TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA catalogue TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA parcelles TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA taches TO postgres;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA membres TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA catalogue TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA parcelles TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA taches TO postgres;

GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA membres TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA catalogue TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA parcelles TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA taches TO postgres;
