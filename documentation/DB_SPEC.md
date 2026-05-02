# Especificação do Banco de Dados - EdukSim

**Engine:** PostgreSQL 15+ (GCP Cloud SQL)

## Entidades e Colunas

### 1. `users`
- `id`: UUID (Primary Key)
- `email`: String (Unique)
- `role`: Enum (PROFESSOR, ALUNO)
- `phone`: String (Opcional)
- `auth_provider`: String (ex: 'google' ou 'jwt')

### 2. `questions` (Banco de Questões Global)
- `id`: UUID (PK)
- `subject`: String (Disciplina)
- `content`: Text (Conteúdo específico)
- `stem`: Text (Enunciado)
- `image_url`: String (Link para Cloud Storage)
- `competence_bncc`: String
- `skill_bncc`: String
- `created_by`: UUID (FK -> users.id)

### 3. `items` (Alternativas)
- `id`: UUID (PK)
- `question_id`: UUID (FK -> questions.id)
- `text`: Text (Enunciado da alternativa)
- `image_url`: String (Opcional)
- `is_correct`: Boolean

### 4. `tests` (Simulados)
- `id`: UUID (PK)
- `title`: String
- `area`: String (ex: Ciências da Natureza)
- `start_at`: DateTime
- `end_at`: DateTime
- `time_per_question`: Integer (Segundos)
- `allowed_students`: JSONB (Lista de emails autorizados)
- `initial_seed`: Integer (Para lógica de embaralhamento)

### 5. `test_questions` (Associação/Order)
- `id`: UUID (PK)
- `test_id`: UUID (FK -> tests.id)
- `question_id`: UUID (FK -> questions.id)
- `order_index`: Integer