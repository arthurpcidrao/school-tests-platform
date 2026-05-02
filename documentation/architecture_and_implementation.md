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
O backend foi construído em **Python com Django Rest Framework (DRF)**. A escolha do Django se deu pela robustez de seu ORM, segurança nativa e velocidade para a criação de APIs voltadas para dashboards administrativos.

- **Autenticação:** Baseada em JWT (JSON Web Tokens). O Django expõe rotas `/api/token/` para emissão e renovação das credenciais de acesso de alunos e professores.
- **Modelagem de Dados:** Os apps `accounts` (Gestão de Usuários e Roles) e `exams` (Questões, Alternativas e Provas) representam a lógica de negócio principal.
- **Infraestrutura:** O backend é completamente "Dockerizado", facilitando deploys agnósticos usando o `docker-compose.yml`.

### 2.2 Banco de Dados (`/database`)
Migramos do banco relacional embutido do Django (SQLite) para o **PostgreSQL**, visando um deploy de produção direto no GCP (Google Cloud SQL).

- O arquivo principal `schema.sql` reflete a versão de produção do banco.
- **Decisões de Performance:** Para suportar Analytics rápido no frontend e mobile, separamos as tentativas ativas (`test_attempts`) do registro granular de respostas (`student_responses`). Isso permite recalcular rapidamente as métricas (ex: "85% de acerto") sem queries pesadas no banco de questões (`questions`).

### 2.3 Frontend (`/frontend`)
O painel administrativo Web foi construído com **React e Next.js 16 (App Router)**. É a principal interface para Professores e Coordenação.

- **Estilização:** Utilizamos **Tailwind CSS v4**. O arquivo `globals.css` mapeia todo o Design System (Fontes Lexend e Inter, e paleta de cores como `primary: #0054cb`) para as classes utilitárias do Tailwind.
- **Funcionalidades Chave:** Dashboard do Professor, Fluxos de Cadastro e Login e a tela de **Criação de Simulados** (onde o professor seleciona questões do Banco Global).
- **Decisão Técnica:** No desenvolvimento visual do frontend, optamos por utilizar dimensões fixas (ex: `max-w-[896px]`) em substituição às variáveis relativas base do Tailwind (ex: `max-w-md`), resolvendo conflitos em resoluções Web amplas (computadores).

### 2.4 Mobile (`/mobile`)
O aplicativo Mobile foi construído com **Flutter**. Ele é destinado estritamente aos **Alunos**.

- **Estratégia Offline-First:** O app usa o pacote `sqflite` (no arquivo `database_helper.dart`) para recriar o schema do banco de dados na memória do celular.
  - *Fluxo:* Quando o app detecta internet via `connectivity_plus`, ele puxa as provas através do `ApiService` (utilizando o package HTTP `dio`). Se a internet cair, a prova continua perfeitamente, pois tudo foi previamente salvo no cache local.
- **Gerenciamento de Estado:** Utilizamos o `provider` para injetar o `AuthProvider` e o `TestProvider` pela árvore de widgets.
- **Anti-Fraude (AppLifecycle):** Foi implementado um mecanismo que usa o `AppLifecycleState` dentro do `TestProvider`. Se o aluno minimizar o aplicativo ou tentar "colar" abrindo outro app (Navegador/WhatsApp), um timer dispara. Caso passem de 10 segundos, o app sinaliza a variável `isBlocked = true`, a prova é interrompida e enviada com as respostas até aquele momento.

---

## 3. Fluxo de Integração (Como tudo se comunica)

A orquestração do sistema segue o seguinte fluxo padrão:

1. **Gestão:** O **Professor** acessa o `Frontend Web (Next.js)`, faz Login via JWT e interage com o `Backend Django`. Ele cria um novo Simulado. O Django salva o simulado no `PostgreSQL` do GCP.
2. **Sincronização:** O **Aluno** abre o aplicativo `Mobile (Flutter)`. O aplicativo bate no `Backend Django` (usando `Dio`), detecta o novo simulado e faz o download das estruturas (tests, questions, items).
3. **Execução:** O aluno entra na aba de "Simulados Disponíveis" e clica em iniciar. A internet pode cair. O aluno responde as questões que estão salvas no `sqflite`. O `TestProvider` contabiliza o tempo.
4. **Envio:** Se o aluno finalizar a prova *ou* a regra anti-fraude (10s fora do app) o bloquear, o app salva as respostas como `student_responses` (com a flag local `synced=0`). Assim que a internet retornar, o aplicativo sincroniza os dados via API devolvendo o resultado ao `Backend Django` para ser gravado definitivamente.
5. **Dashboard:** O resultado é calculado pelo backend, e a nota do aluno (`score_assigned`) fica imediatamente disponível tanto para a aba "Desempenho" do Flutter, quanto para o painel de Relatórios do Professor no Next.js.
