# Guia do Backend: Django + Django Ninja

O backend é o coração da lógica da EdukSim. Ele roda em Python e foi construído com os *frameworks* **Django** (para gerenciar banco de dados, segurança e estrutura robusta) e **Django Ninja** (para criar a API RESTful de forma rápida, tipada e parecida com o FastAPI, usando `Pydantic` para validação de dados).

Este documento detalha profundamente as engrenagens internas do nosso backend, para que qualquer desenvolvedor entenda as conexões e arquitetura.

## 1. Estrutura do Backend e Organização

A filosofia do Django baseia-se na separação em pequenos "aplicativos" (Apps), onde cada um cuida de um domínio específico do negócio. Dentro do diretório `backend/`, temos a seguinte organização:

- **`core/` (O Cérebro da Configuração):**
  - Contém as configurações globais do projeto.
  - `settings.py`: O arquivo vital. É aqui que definimos as variáveis de ambiente, dependências instaladas (INSTALLED_APPS), middlewares de segurança, configurações de CORS (quem pode acessar a API) e as configurações de autenticação JWT.
  - `urls.py`: O roteador mestre do projeto. Ele direciona o tráfego da internet (ex: a rota base `/api/`) para a instância principal do Django Ninja.
  - `api.py`: Instância principal do Django Ninja (`api = NinjaAPI()`). Ele importa e agrupa todos os roteadores dos outros aplicativos (como `accounts` e `exams`).

- **`accounts/` (Gestão de Usuários e Identidade):**
  - Este app é responsável por toda a lógica de negócio em torno dos usuários. É aqui que definimos se um usuário é um **Professor** (com privilégios de criar provas) ou um **Aluno** (que apenas as consome). Lida também com os tokens JWT e autenticação (OAuth2 do Google ou via email/senha).

- **`exams/` (A Lógica de Provas e Avaliações):**
  - É o módulo mais denso do sistema. Ele gerencia as Entidades de Domínio relacionadas a avaliações: o Banco de Questões, as Alternativas, os Simulados (Provas) em si, os alunos designados para uma prova e o registro de respostas (`student_responses`) e tentativas finais (`test_attempts`).

### Estrutura Interna Comum de um App
Cada app (`accounts` e `exams`) geralmente segue o seguinte padrão de arquivos:
- `models.py`: A declaração da estrutura das tabelas do banco de dados utilizando a sintaxe Python do ORM (Object-Relational Mapping) do Django.
- `schemas.py` (ou dentro do próprio `api.py`): As classes Pydantic que servem como "contratos" definindo exatamente quais campos o front-end precisa enviar na requisição e o que a API vai devolver na resposta.
- `api.py` (ou `views.py`): Onde declaramos as rotas (endpoints) específicas do app. É onde a lógica de negócio acontece após receber o dado e antes de salvá-lo no banco.

## 2. Conexões com o Banco de Dados

A conexão entre a aplicação Python e o banco de dados PostgreSQL não é estática (hardcoded). Seguimos as boas práticas do *"Twelve-Factor App"*, onde as credenciais e conexões são injetadas via variáveis de ambiente.

**Onde e como estão configuradas?**
- A conexão está configurada no arquivo `backend/core/settings.py`, especificamente no dicionário chamado `DATABASES`.
- Utilizamos a leitura de variáveis do sistema operacional para construir a comunicação com segurança.
- **Variáveis de Ambiente Necessárias:** O projeto lê o arquivo `.env` localizado na raiz do `backend/` e extrai as chaves de acesso essenciais:
  - `POSTGRES_DB` (Nome do banco de dados)
  - `POSTGRES_USER` (Usuário com permissões adequadas)
  - `POSTGRES_PASSWORD` (Senha encriptada)
  - `POSTGRES_HOST` (Endereço IP, como `127.0.0.1` para testes ou o endereço de proxy do Google Cloud SQL em produção)
  - `POSTGRES_PORT` (Porta TCP padrão 5432)

**Orquestração com o Banco de Dados (Como é feito o manuseio e salvamento de dados):**
O backend do Django utiliza seu poderoso ORM para evitar escrita de SQL cru. 
Quando um aluno finaliza a prova no celular e a envia:
1. O backend recebe o lote massivo de respostas no seu endpoint de submissão.
2. O Django abre imediatamente uma "Transação Segura" (`transaction.atomic()`). Se ocorrer qualquer problema elétrico, de rede, ou erro nos dados durante o processamento, a transação inteira sofre um *rollback* e nenhum dado quebrado é gravado.
3. Se tudo estiver correto, o backend itera pelas respostas, cruza os dados com o gabarito oficial na tabela do banco, realiza a matemática da nota, grava cada linha em `student_responses` e consolida finalizando a avaliação em `test_attempts`. O commit no banco de dados só ocorre ao final do sucesso de todos esses passos.

## 3. O que são e como são usadas as Migrations?

**O que são as Migrations?**
As "Migrations" (ou Migrações) são scripts em Python, gerados de maneira automatizada pelo Django, que documentam o histórico de vida da estrutura do seu banco de dados. 
Quando você desenha uma tabela no código escrevendo uma nova classe no arquivo `models.py` (ex: `class Ranking`), o PostgreSQL real na nuvem não sabe da existência disso. As migrações são o mecanismo tradutor: elas convertem o código Python das suas tabelas em comandos de criação e alteração (`CREATE TABLE`, `ALTER TABLE`) na linguagem SQL do banco. 
Elas agem de modo análogo a "commits de Git" exclusivos para a arquitetura de tabelas.

**Onde e como elas são usadas na prática?**
- Quando um programador adiciona ou remove uma coluna no `models.py` de qualquer aplicativo (ex: app `exams`), ele roda no terminal o comando: `python manage.py makemigrations`. O Django vasculha o que mudou e cria um arquivo enumerado (como `migrations/0002_add_ranking.py`) instruindo passo-a-passo aquela mudança.
- Posteriormente (e obrigatoriamente no deploy em produção), o comando `python manage.py migrate` é executado. Ele se conecta ao banco de dados, verifica uma tabela interna de registro e executa o código SQL das novas migrações que ainda não foram aplicadas ativando essas mudanças estruturais no servidor.

## 4. Especificação das Rotas da API (Endpoints)

O backend possui diversas rotas RESTful já configuradas em seus arquivos `api.py`. Ao acessar `http://localhost:8000/api/docs`, você acessa uma documentação interativa e detalhada (Swagger UI) construída em tempo real pelo Django Ninja para auxiliar front-ends.

**Principais Rotas de Autenticação (`/api/auth/...`):**
- `POST /api/auth/register`: Rota de cadastro que valida os campos (nome, email, senha), encripta a senha com *hashes* seguras e cria o perfil de Professor ou Aluno.
- `POST /api/auth/login`: Recebe credenciais e, se corretas, emite os *Tokens JWT* que funcionarão como "passes livres" temporários.
- `POST /api/auth/google-login`: Recebe tokens de validação originários da integração Google (mobile ou web) e valida a autenticidade diretamente com os servidores da Google, criando ou logando usuários instantaneamente no nosso ecossistema.
- `GET /api/auth/me`: Rota blindada e protegida. Exige a apresentação de um Token JWT válido no cabeçalho e, em troca, informa ao aplicativo front-end quais os dados do perfil acessado.

**Principais Rotas do Domínio de Provas (`/api/exams/...`):**
- `GET /api/exams/questions`: Retorna a lista integral das questões salvas na plataforma escolar (O Banco de Questões).
- `POST /api/exams/questions`: Permite ao Professor via web empurrar uma nova questão, informando o texto da pergunta e a matriz com as alternativas (e a indicação de qual é correta).
- `GET /api/exams/tests`: Usada pelo frontend Web para listar de forma gerencial todas as provas e simulados já criados na escola.
- `POST /api/exams/tests`: Rota mestra para o Professor. Ela absorve o envio de um JSON complexo contendo os dados base do simulado, o tempo de prova, a associação com várias questões prévias ou novas criadas no momento, e a lista de alunos (IDs) escolhidos para fazerem a prova.
- `GET /api/exams/tests/available`: Rota exclusiva para o uso diário do aplicativo Mobile. É ela que implementa o modelo de negócio: cruza a lista de provas do aluno com as provas que ele já completou, e envia **apenas** as pendentes.
- `POST /api/exams/tests/{id}/submit`: A rota da "entrega da prova" que vem do Mobile. Aciona todas as engrenagens de validação anti-fraude (verificando os horários) e orquestra a correção transacional de notas junto ao PostgreSQL.
