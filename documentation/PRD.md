# PRD.md - Plataforma de Simulados (EdukSim)

## 1. Visão Geral do Produto
O **EdukSim** é um ecossistema educacional "end-to-end" projetado para automatizar o ciclo de vida de simulados escolares e académicos. A plataforma resolve dois problemas principais: a facilidade de fraude (através do embaralhamento dinâmico) e a sobrecarga de correção dos professores (através de automação e IA).

## 2. Personas e Objetivos
* **Professor (Web):** Criar simulados personalizados, gerir o acesso de alunos e analisar o desempenho da turma através de dados consolidados.
* **Aluno (Mobile):** Realizar provas de forma focada, com interface intuitiva e suporte total a ambientes offline, recebendo feedback imediato de performance.

## 3. Requisitos Funcionais

### 3.1. Painel Administrativo (Web - Next.js)
- **Gestão de Conteúdo:** - Criação de simulados com questões objetivas (múltipla escolha) e discursivas (abertas).
    - Atribuição de pesos diferenciados por questão.
    - Configuração de cronómetro (limite de tempo).
- **Controlo de Acesso:** - Registo de emails autorizados.
    - Sistema de envio de códigos de acesso únicos por email.
- **Correção e Analytics:**
    - Dashboard de performance (média, desvio padrão, questões mais erradas).
    - Interface de correção para questões abertas com "Nota Sugerida" (baseada em palavras-chave/lógica de backend).
    - Validação manual de notas pelo professor.

### 3.2. Experiência de Prova (Mobile - Flutter)
- **Modo Offline-First:**
    - Download completo do simulado (JSON + Imagens) para execução sem internet.
    - Sincronização automática com o servidor assim que a conexão for detetada após a conclusão.
- **Interface de Questões (Cards):**
    - Exibição de uma questão por ecrã (UX estilo card).
    - Navegação entre questões (Anterior/Próxima).
- **Resultados:**
    - Feedback instantâneo do total de acertos/erros (questões objetivas) após o envio.

### 3.3. Backend e Inteligência (Django Ninja)
- **Motor de Randomização:** Algoritmo que embaralha a ordem das questões e a posição das alternativas para cada aluno.
- **Lógica de Correção:** Comparação de IDs para questões fechadas e análise de termos obrigatórios para questões abertas.
- **API REST:** Endpoints otimizados para sincronização de grandes pacotes de dados offline.

## 4. Requisitos Não Funcionais
- **Arquitetura:** Monorepo para facilitar a consistência entre contratos da API e clientes.
- **Base de Dados:** PostgreSQL hospedado em Cloud SQL (GCP).
- **Performance:** Tempo de resposta da API < 200ms para garantir sincronização fluida.
- **Segurança:** Autenticação por token vinculado ao email e código de acesso do simulado.

## 5. Arquitetura de Pastas
```text
/EdukSim-monorepo
  ├── /backend        # Django + Django Ninja (API)
  ├── /frontend-web   # React + Next.js (Dashboard + Landing Page)
  ├── /mobile         # Flutter App (Offline-first)
  └── /infra          # Dockerfiles, CI/CD e scripts GCP