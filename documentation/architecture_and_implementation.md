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

## 3. Fluxo Principal de Integração e Casos de Uso

A orquestração do sistema segue regras de negócio bem definidas, onde cada ponta da arquitetura possui uma responsabilidade clara no ciclo de vida de uma prova.

### 3.1 Web (Painel do Professor / Coordenação)
O frontend web (Next.js) é o ambiente de gestão.
- **Acesso e Gestão:** O professor (ou representante da escola) acessa o sistema, realiza o cadastro (se necessário) e faz o login. A partir da página de **Dashboard**, ele possui uma visão gerencial: pode visualizar os resultados consolidados dos alunos, verificar a quantidade de alunos ativos na plataforma e acompanhar métricas gerais.
- **Banco de Questões e Criação de Provas:** O professor pode criar questões isoladas (alimentando um **Banco de Questões** da instituição) ou pode criar novos simulados (provas).
- **Configuração do Simulado:** Durante a criação de uma prova, o professor tem total controle. Ele pode:
  - Alterar o tempo estipulado por questão (que refletirá no cronômetro do app do aluno).
  - Criar questões novas de forma dinâmica diretamente na tela de criação da prova.
  - Selecionar questões previamente cadastradas no Banco de Questões.
  - Selecionar nominalmente quais alunos (ou turmas) irão participar da prova (receberão a prova no mobile).

### 3.2 Mobile (Aplicativo do Aluno)
O aplicativo (Flutter) é a interface de execução focada na estabilidade e equidade (anti-fraude).
- **Acesso:** O aluno baixa o aplicativo, realiza seu cadastro, faz o login e entra na sua conta.
- **Painel de Provas:** A primeira tela (Dashboard) é a aba de **Simulados Disponíveis**. Nela, o aluno verá todas as provas que o professor designou. Apenas as provas "não feitas" aparecem aqui.
- **Execução:** O aluno escolhe um simulado e inicia. O fluxo de resolução é exibido **questão a questão**. O temporizador, configurado pelo professor, fica em contagem regressiva e há monitoramento se o aluno sair do app (anti-fraude). Ao responder a última, o aluno finaliza a prova.
- **Indisponibilidade Pós-Prova e Sincronização:** Quando a prova é finalizada, o Mobile salva tudo internamente (caso a internet caia) e, assim que possível, envia as respostas ao Backend para consolidar. Após esse envio bem-sucedido, o Banco de Dados cria o registro de tentativa (`test_attempts`) marcada como `completed` ou `finished` vinculada àquele `student_id`. A partir desse momento, quando o Mobile pedir novamente a lista de "provas disponíveis" (através da API `/api/exams/tests/available`), o Backend faz um cruzamento (JOIN) no banco de dados e **filtra (não retorna)** as provas que já possuem finalização. Isso garante que a prova fique permanentemente indisponível para uma segunda tentativa pelo app.
- **Desempenho:** Na tela ao lado (aba Desempenho), o aplicativo busca na API o histórico de provas concluídas e exibe os acertos, notas e a evolução do aluno.

### 3.3 Backend (A "Mente" Orquestradora)
O backend (Django + Django Ninja) é o cérebro do sistema, responsável por garantir que as regras de negócio acima funcionem com segurança, orquestrando as requisições e persistindo dados.
- **Tratamento e Validação:** Ele recebe as requisições REST de ambas as partes (Mobile e Web), valida os payloads (tipagem forte com Pydantic) e traduz isso para a lógica de negócio no banco de dados (ex: salvar toda a estrutura da prova configurada pelo professor no PostgreSQL).
- **Orquestração com o Banco (Correção Automática):** Quando o aluno envia uma prova finalizada do celular, o backend atua como orquestrador transacional seguro:
  1. Abre uma transação atômica no banco de dados.
  2. Verifica as alternativas marcadas na tabela `student_responses` contra a opção correta oficial (gabarito) atrelada à questão no banco.
  3. Calcula automaticamente a nota/pontuação final.
  4. Salva a tentativa finalizada (`test_attempts`) e a nota de forma definitiva. Se algum erro de rede ou de integridade ocorrer nesse meio tempo, a transação inteira sofre um *rollback* automático (desfazendo todas as parciais), garantindo que não existam notas inconsistentes no PostgreSQL.
- Concluída a transação, o resultado corrigido pelo backend reflete instantaneamente nos dashboards gerenciais Web do professor e na tela de desempenho do app do aluno.

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
