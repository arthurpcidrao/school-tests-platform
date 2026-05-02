# Especificação Backend - Django + Django Ninja

## Requisitos de Autenticação
- **JWT (SimpleJWT):** Autenticação Stateless.
- **Autenticação por Google:** Integração com Google Sign-In para autenticação de usuários.
- **Middleware de Permissão:** - `IsProfessor`: Acesso total a CRUD de questões e Dashboards.
    - `IsStudent`: Acesso apenas a leitura de provas e envio de respostas.

## Funcionalidades Obrigatórias
1. **Gestão de Provas (Professor):**
   - CRUD de Simulados.
   - Endpoint para upload de lista de emails (CSV/JSON).
   - **Disparo de E-mail:** Integração com SendGrid/Amazon SES para notificar alunos.
2. **Banco de Questões:**
   - Repositório compartilhado entre professores.
3. **Motor de Sincronização:**
   - Endpoint `/sync` (POST) resiliente: recebe respostas em lote do mobile.
   - Lógica de correção instantânea para questões objetivas.
4. **Analytics:**
   - Agregação de dados por disciplina e competência BNCC para o Dashboard.