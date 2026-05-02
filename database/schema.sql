-- Script de Criação do Banco de Dados PostgreSQL (Para Deploy no GCP Cloud SQL)
-- Baseado no arquivo documentation/DB_SPEC.md

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('PROFESSOR', 'ALUNO')),
    phone VARCHAR(20),
    auth_provider VARCHAR(50) DEFAULT 'jwt',
    is_staff BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_superuser BOOLEAN DEFAULT FALSE,
    date_joined TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- 2. questions
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject VARCHAR(255),
    content TEXT,
    stem TEXT NOT NULL,
    image_url VARCHAR(500),
    competence_bncc VARCHAR(100),
    skill_bncc VARCHAR(100),
    question_type VARCHAR(20) DEFAULT 'FECHADA' CHECK (question_type IN ('ABERTA', 'FECHADA')),
    created_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- 3. items
CREATE TABLE IF NOT EXISTS items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    image_url VARCHAR(500),
    is_correct BOOLEAN DEFAULT FALSE
);

-- 4. tests
CREATE TABLE IF NOT EXISTS tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    area VARCHAR(255),
    start_at TIMESTAMP WITH TIME ZONE,
    end_at TIMESTAMP WITH TIME ZONE,
    time_per_question INTEGER,
    allowed_students JSONB,
    initial_seed INTEGER,
    created_by_id UUID REFERENCES users(id) ON DELETE CASCADE
);

-- 5. test_questions
CREATE TABLE IF NOT EXISTS test_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    order_index INTEGER DEFAULT 0,
    weight DOUBLE PRECISION DEFAULT 1.0
);

-- 6. test_attempts
CREATE TABLE IF NOT EXISTS test_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'FINISHED', 'EXPIRED')),
    random_seed INTEGER
);

-- 7. student_responses
CREATE TABLE IF NOT EXISTS student_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID NOT NULL REFERENCES test_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected_item_id UUID REFERENCES items(id) ON DELETE SET NULL,
    text_response TEXT,
    is_correct BOOLEAN,
    score_assigned DECIMAL(5,2)
);
