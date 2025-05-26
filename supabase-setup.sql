-- Script para configurar banco de dados no Supabase
-- Execute este script no SQL Editor do Supabase

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'USER',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de pilotos
CREATE TABLE IF NOT EXISTS pilots (
    id BIGSERIAL PRIMARY KEY,
    driver_id VARCHAR(255) UNIQUE NOT NULL,
    given_name VARCHAR(255) NOT NULL,
    family_name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    nationality VARCHAR(255),
    code VARCHAR(10),
    permanent_number INTEGER,
    url TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de construtores
CREATE TABLE IF NOT EXISTS constructors (
    id BIGSERIAL PRIMARY KEY,
    constructor_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    nationality VARCHAR(255),
    url TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de grandes prêmios
CREATE TABLE IF NOT EXISTS grand_prix (
    id BIGSERIAL PRIMARY KEY,
    season INTEGER NOT NULL,
    round INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    circuit_name VARCHAR(255) NOT NULL,
    circuit_url TEXT,
    practice1_date_time TIMESTAMP,
    practice2_date_time TIMESTAMP,
    practice3_date_time TIMESTAMP,
    qualifying_date_time TIMESTAMP,
    sprint_date_time TIMESTAMP,
    race_date_time TIMESTAMP NOT NULL,
    timezone VARCHAR(100) DEFAULT 'UTC',
    laps INTEGER,
    circuit_length DECIMAL(5,3),
    description TEXT,
    active BOOLEAN DEFAULT true,
    completed BOOLEAN DEFAULT false,
    is_sprint_weekend BOOLEAN DEFAULT false,
    betting_deadline TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(season, round)
);

-- Tabela de equipes de usuários
CREATE TABLE IF NOT EXISTS user_teams (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    year INTEGER NOT NULL,
    user1_id BIGINT REFERENCES users(id),
    user2_id BIGINT REFERENCES users(id),
    total INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(year, user1_id, user2_id)
);

-- Tabela de palpites
CREATE TABLE IF NOT EXISTS guesses (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    grand_prix_id BIGINT REFERENCES grand_prix(id),
    guess_type VARCHAR(50) NOT NULL, -- 'QUALIFYING' ou 'RACE'
    position INTEGER NOT NULL,
    pilot_id BIGINT REFERENCES pilots(id),
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, grand_prix_id, guess_type, position)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);
CREATE INDEX IF NOT EXISTS idx_pilots_active ON pilots(active);
CREATE INDEX IF NOT EXISTS idx_constructors_active ON constructors(active);
CREATE INDEX IF NOT EXISTS idx_grand_prix_season ON grand_prix(season);
CREATE INDEX IF NOT EXISTS idx_grand_prix_active ON grand_prix(active);
CREATE INDEX IF NOT EXISTS idx_guesses_user_gp ON guesses(user_id, grand_prix_id);
CREATE INDEX IF NOT EXISTS idx_user_teams_year ON user_teams(year);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pilots_updated_at BEFORE UPDATE ON pilots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_constructors_updated_at BEFORE UPDATE ON constructors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_grand_prix_updated_at BEFORE UPDATE ON grand_prix FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_teams_updated_at BEFORE UPDATE ON user_teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_guesses_updated_at BEFORE UPDATE ON guesses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir dados iniciais
INSERT INTO users (name, email, password, role) VALUES 
('Admin', 'admin@palpitef1.com', '$2a$10$example', 'ADMIN')
ON CONFLICT (email) DO NOTHING; 