# TechSpecs.md - Plataforma de Simulados (EdukSim)

## 1. Stack Tecnológica
- **Backend:** Python 3.12 + Django 5.x + Django Ninja (API Assíncrona). Gerenciador de pacotes: UV.
- **Frontend Web:** Next.js 14 (App Router) + Tailwind CSS.
- **Mobile:** Flutter 3.x + State Management (Provider ou Riverpod).
- **Banco de Dados:** PostgreSQL 15 (Hospedado no GCP Cloud SQL).
- **Infra/Deploy:** Docker + GitHub Actions (CI/CD) + Render/Vercel.

## 2. Modelagem de Dados (Entidades Principais)
- **User (Custom):** Professor e Aluno (vinculados por email).
- **Simulado:** `id, professor_id, titulo, tempo_limite, data_criacao, embaralhar_questoes (bool)`.
- **Questao:** `id, simulado_id, texto, tipo (ABERTA/FECHADA), peso, ordem_original`.
- **Alternativa:** `id, questao_id, texto, eh_correta (bool)`.
- **Tentativa_Simulado:** `id, aluno_id, simulado_id, data_inicio, data_fim, status (EM_ANDAMENTO/FINALIZADO), seed_random`.
- **Resposta_Aluno:** `id, tentativa_id, questao_id, texto_resposta (aberta), alternativa_escolhida_id (fechada), nota_atribuida`.

## 3. Arquitetura de Software

### 3.1. Lógica de Embaralhamento
Para garantir que o aluno veja as questões em ordens diferentes mas consistentes (se ele fechar e abrir o app), usaremos uma **Seed (Semente) Aleatória**.
- O Backend gera uma `seed` única quando o aluno inicia o simulado.
- O algoritmo de `random.shuffle(questoes, seed)` será replicado no Flutter para garantir a mesma ordem offline.

### 3.2. Estratégia Offline-First (Mobile)
- **Armazenamento Local:** Uso da biblioteca `sqflite` ou `Hive` no Flutter.
- **Fluxo de Sincronização:**
    1. O App baixa o JSON do simulado e salva localmente.
    2. As respostas são salvas em uma fila local (Local Queue).
    3. Um `Background Service` ou trigger manual tenta enviar o JSON de respostas para o endpoint `/sync` do Django Ninja assim que houver `ConnectivityResult.mobile` ou `wifi`.

### 3.3. Algoritmo de Correção Automática (Sugestão)
- **Objetivas:** Comparação direta de IDs no banco de dados.
- **Discursivas:** O Backend utilizará uma busca por "Keywords" (Palavras-chave obrigatórias) definidas pelo professor no cadastro da questão para calcular um percentual de acerto inicial.

## 4. Endpoints Principais (API)
- `POST /auth/login-code`: Valida e-mail e código de acesso.
- `GET /simulados/{id}`: Retorna dados do simulado e questões (embaralhadas).
- `POST /simulados/{id}/sync`: Recebe o pacote de respostas do mobile.
- `GET /admin/dashboard`: Retorna métricas agregadas para o Next.js.

## 5. Infraestrutura no Google Cloud (GCP)
- Instância Cloud SQL com IP público autorizado para o backend.
- Variáveis de ambiente gerenciadas pelo Secret Manager ou arquivo `.env` seguro.

## 6. Gerenciamento de Dependências
### backend
- **Ferramenta:** UV (Fast Python package installer and resolver).
- **Configuração:** `pyproject.toml`.
- **Ambiente Virtual:** Gerenciado via `uv venv` e sincronizado com `uv sync`.
### frontend-web
- **Ferramenta:** PNPM.
- **Configuração:** `package.json`.
- **Ambiente Virtual:** Gerenciado via `.npmrc` e sincronizado com `npm ci`.
### mobile
- **Ferramenta:** Pub (Dart package manager).
- **Configuração:** `pubspec.yaml`.
- **Ambiente Virtual:** Gerenciado via `.pubrc` e sincronizado com `pub get`.