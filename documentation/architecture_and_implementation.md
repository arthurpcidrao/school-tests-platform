# EdukSim - Documentação de Arquitetura e Implementação

Este documento centraliza a visão arquitetural, o progresso das implementações e as decisões técnicas de engenharia adotadas no projeto **EdukSim** (Plataforma Escolar de Simulados).

---

## 1. Visão Geral da Arquitetura do Sistema

O sistema foi desenhado visando **alta disponibilidade**, suporte a **conexões instáveis** por parte dos alunos e **segurança/anti-fraude** durante a execução das provas.

A arquitetura é dividida em quatro grandes pilares, cada um contido em seu respectivo diretório:

1. **Frontend (Web):** Focado na gestão escolar (Professores e Coordenadores).
2. **Mobile (App):** Focado no consumo de provas (Alunos) com capacidade offline-first.
3. **Backend (API):** O cérebro do sistema que faz o meio-campo entre as aplicações e o banco de dados.
4. **Database (Cloud):** Onde os dados residem definitivamente.

---

## 2. Detalhamento dos Componentes (Diretórios)

### 2.1 Backend (`/backend`)
O backend foi construído em **Python com Django e Django Ninja**. A escolha do Django se deu pela robustez de seu ORM e segurança nativa, enquanto o **Django Ninja** foi escolhido para a camada de API por oferecer uma sintaxe muito mais moderna, tipada (com Pydantic) e incrivelmente semelhante ao FastAPI, além de ser significativamente mais rápido e leve que o tradicional Django Rest Framework (DRF).

- **Autenticação:** Baseada em JWT (JSON Web Tokens). A autenticação utiliza o pacote `django-ninja-jwt` para manter a leveza, com endpoints de login para emissão de tokens.
- **Modelagem de Dados:** Os apps `accounts` (Gestão de Usuários e Roles) e `exams` (Questões, Alternativas e Provas) representam a lógica de negócio principal.
- **Infraestrutura:** O backend é completamente "Dockerizado", facilitando deploys agnósticos usando o `docker-compose.yml`.

**Rotas e APIs (Django Ninja):**
- `POST /api/auth/register` - Registro de novo usuário.
- `POST /api/auth/login` - Autenticação por email e senha, retorna JWT.
- `POST /api/auth/google-login` - Autenticação OAuth2 via Google.
- `GET /api/auth/me` - Retorna os dados do usuário autenticado.
- `GET /api/exams/questions` e `POST /api/exams/questions` - Listagem e criação de questões com suas alternativas.
- `GET /api/exams/tests` e `POST /api/exams/tests` - Listagem e criação de Simulados (provas).

**Migrations:**
Utilizamos o sistema de migrations nativo do Django para traduzir nossas models em Python diretamente para as tabelas do banco de dados (PostgreSQL), mantendo histórico versionado de alterações estruturais (como a adição de novas tabelas ou colunas).

### 2.2 Banco de Dados (`/database`)
Migramos do banco relacional embutido do Django (SQLite) para o **PostgreSQL**, visando um deploy de produção direto no GCP (Google Cloud SQL).

- O arquivo principal `schema.sql` reflete a versão de produção do banco.
- **Decisões de Performance:** Para suportar Analytics rápido no frontend e mobile, separamos as tentativas ativas (`test_attempts`) do registro granular de respostas (`student_responses`). Isso permite recalcular rapidamente as métricas (ex: "85% de acerto") sem queries pesadas no banco de questões (`questions`).

**Comunicação com o Google Cloud Platform (GCP):**
Para que o backend se conecte com o banco hospedado no Cloud SQL, a configuração utiliza variáveis de ambiente. Em desenvolvimento local, utilizamos o `Cloud SQL Auth Proxy`, garantindo túneis seguros para o banco de produção sem expor a rede publicamente. Na nuvem, basta o Cloud Run ou App Engine ser configurado com as credenciais da *Connection String* no formato: `postgres://USER:PASSWORD@HOST:PORT/DB_NAME`.

### 2.3 Frontend (`/frontend`)
O painel administrativo Web foi construído com **React e Next.js 16 (App Router)**. É a principal interface para Professores e Coordenação.

- **Estilização:** Utilizamos **Tailwind CSS v4**. O arquivo `globals.css` mapeia todo o Design System (Fontes Lexend e Inter, e paleta de cores como `primary: #0054cb`) para as classes utilitárias do Tailwind.
- **Funcionalidades Chave:** Dashboard do Professor, Fluxos de Cadastro e Login e a tela de **Criação de Simulados** (onde o professor seleciona questões do Banco Global).
- **Decisão Técnica:** No desenvolvimento visual do frontend, optamos por utilizar dimensões fixas (ex: `max-w-[896px]`) em substituição às variáveis relativas base do Tailwind (ex: `max-w-md`), resolvendo conflitos em resoluções Web amplas (computadores).

**Páginas e Rotas:**
- `/` - Página principal de atração/landing page (a ser desenvolvida).
- `/login` - Tela de Autenticação (Professor) com opções padrão e via Google.
- `/register` - Tela de Cadastro (Professor).
- `/dashboard` - Painel de controle do Professor.

### 2.4 Mobile (`/mobile`)
O aplicativo Mobile foi construído com **Flutter**. Ele é destinado estritamente aos **Alunos**.

- **Estratégia Offline-First:** O app usa o pacote `sqflite` (no arquivo `database_helper.dart`) para recriar o schema do banco de dados na memória do celular.
  - *Fluxo:* Quando o app detecta internet via `connectivity_plus`, ele puxa as provas através do `ApiService` (utilizando o package HTTP `dio`). Se a internet cair, a prova continua perfeitamente, pois tudo foi previamente salvo no cache local.
- **Gerenciamento de Estado:** Utilizamos o `provider` para injetar o `AuthProvider` e o `TestProvider` pela árvore de widgets.
- **Anti-Fraude (AppLifecycle):** Foi implementado um mecanismo que usa o `AppLifecycleState` dentro do `TestProvider`. Se o aluno minimizar o aplicativo ou tentar "colar" abrindo outro app (Navegador/WhatsApp), um timer dispara. Caso passem de 10 segundos, o app sinaliza a variável `isBlocked = true`, a prova é interrompida e enviada com as respostas até aquele momento.

**Telas do Aplicativo:**
- `LoginScreen` (`/login`) - Autenticação padrão.
- `RegisterScreen` (`/register`) - Cadastro de conta para novos alunos.
- `DashboardScreen` (`/dashboard`) - Base estrutural que contém o NavigationBar com as abas inferiores.
- Aba `SimuladosTab` - Visualização de provas disponíveis para execução.
- Aba `DesempenhoTab` - Visualização de resultados e métricas históricas de desempenho do aluno.
- `TestExecutionScreen` - Tela principal de resolução das questões (com temporizador e validação anti-fraude em tempo real).

---

## 3. Fluxo de Integração (Como tudo se comunica)

A orquestração do sistema segue o seguinte fluxo padrão:

1. **Gestão:** O **Professor** acessa o `Frontend Web (Next.js)`, faz Login via JWT e interage com o `Backend Django`. Ele cria um novo Simulado. O Django salva o simulado no `PostgreSQL` do GCP.
2. **Sincronização:** O **Aluno** abre o aplicativo `Mobile (Flutter)`. O aplicativo bate no `Backend Django` (usando `Dio`), detecta o novo simulado e faz o download das estruturas (tests, questions, items).
3. **Execução:** O aluno entra na aba de "Simulados Disponíveis" e clica em iniciar. A internet pode cair. O aluno responde as questões que estão salvas no `sqflite`. O `TestProvider` contabiliza o tempo.
4. **Envio:** Se o aluno finalizar a prova *ou* a regra anti-fraude (10s fora do app) o bloquear, o app salva as respostas como `student_responses` (com a flag local `synced=0`). Assim que a internet retornar, o aplicativo sincroniza os dados via API devolvendo o resultado ao `Backend Django` para ser gravado definitivamente.
5. **Dashboard:** O resultado é calculado pelo backend, e a nota do aluno (`score_assigned`) fica imediatamente disponível tanto para a aba "Desempenho" do Flutter, quanto para o painel de Relatórios do Professor no Next.js.

---

## 4. Como Rodar o Projeto

### Pré-requisitos Gerais
- Docker e Docker Compose (Opcional, para subir o banco mais facilmente)
- Node.js (v20+) e `pnpm`
- Python (3.12+)
- Flutter SDK instalado

### Banco de Dados (Cloud ou Local)
Se for rodar localmente usando Docker, inicie uma imagem do PostgreSQL puro.
Gere um arquivo `.env` na raiz da pasta `backend/` contendo:
```env
POSTGRES_DB=eduksim_db
POSTGRES_USER=eduksim_user
POSTGRES_PASSWORD=eduksim_pass_123
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5432
GOOGLE_CLIENT_ID=seu_client_id_do_google
```
*Dica para o GCP:* Se você estiver usando Google Cloud SQL, instale o **Cloud SQL Auth Proxy** na sua máquina local, aponte-o para a porta 5432 e mantenha `POSTGRES_HOST=127.0.0.1`.

### Rodando o Backend (Django Ninja)
1. Abra o terminal e navegue até a pasta: `cd backend`
2. Ative o ambiente virtual: `source .venv/bin/activate`
3. Instale as dependências (caso seja a primeira vez): `uv pip install -r requirements.txt`
4. Rode as migrações para criar as tabelas no banco de dados:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
5. Suba o servidor:
   ```bash
   python manage.py runserver
   ```
   A API ficará disponível em `http://localhost:8000/api/` e os documentos do Swagger no `/api/docs`.

### Rodando o Frontend Web (Next.js)
1. Navegue até a pasta: `cd frontend`
2. Instale as dependências: `pnpm install`
3. Crie um arquivo `.env` na pasta `frontend` e coloque:
   ```env
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=seu_client_id_do_google
   ```
4. Suba o ambiente de desenvolvimento:
   ```bash
   pnpm dev
   ```
   O frontend ficará acessível em `http://localhost:3000`.

### Rodando o Aplicativo Mobile (Flutter)
1. Navegue até a pasta: `cd mobile`
2. Certifique-se de que o emulador está aberto (Android Studio ou iOS Simulator) ou que seu celular está plugado.
3. Baixe as bibliotecas: `flutter pub get`
4. Rode o aplicativo:
   ```bash
   flutter run
   ```
   *Nota:* O emulador do Android costuma identificar o `localhost` da sua máquina como `10.0.2.2`. O arquivo `api_service.dart` já está apontando para `http://10.0.2.2:8000/api/`. Se você usar um celular físico, troque pelo IP da sua máquina.
