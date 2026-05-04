# Guia do Backend: Django + Django Ninja

O backend é o coração da lógica da EdukSim. Ele roda em Python e foi construído com os *frameworks* **Django** (para gerenciar banco de dados e estrutura) e **Django Ninja** (para criar a API de forma rápida, tipada e parecida com o FastAPI).

## Estrutura de Pastas e Arquivos Principais

Dentro de `backend/`:
- `core/`: Configurações globais do projeto.
  - `settings.py`: Onde ficam as variáveis de ambiente, dependências instaladas e configurações de segurança.
  - `urls.py`: O roteador mestre do Django, que aponta para o roteador do Ninja (`api.py`).
  - `api.py`: Instância principal do Django Ninja (`api = NinjaAPI()`), que agrupa todos os outros sub-roteadores.
- `accounts/`: App responsável pelos usuários, professores, alunos e autenticação.
- `exams/`: App responsável pela lógica principal de provas, questões e notas.

Cada app (`accounts` e `exams`) geralmente contém:
- `models.py`: A estrutura das tabelas do banco de dados (seu esquema).
- `api.py`: As rotas (endpoints) específicas deste app criadas com o Django Ninja.

## Como incluir uma nova rota/endpoint?

1. **Abra o arquivo `api.py`** do app pertinente (ex: `exams/api.py`).
2. Defina os **Schemas** (usando Pydantic/Ninja Schema) que determinam o que a rota vai receber (In) e o que vai devolver (Out). Exemplo:
   ```python
   from ninja import Schema
   class MeuSchema(Schema):
       nome: str
   ```
3. Crie a **função da rota** decorada com `@router.get`, `@router.post`, etc.
   ```python
   @router.post("/minha-rota", response={200: MeuSchema})
   def minha_nova_rota(request, data: MeuSchema):
       return 200, {"nome": data.nome}
   ```
4. Se o `router` do app já estiver registrado no `core/api.py`, a rota já estará no ar automaticamente no servidor local.

## O que são as Migrations?

**Migrations** (Migrações) são "fotografias" ou scripts de versão do banco de dados gerados automaticamente pelo Django. Toda vez que você altera, cria ou deleta algo no arquivo `models.py`, o banco de dados real ainda não sabe disso.
- Você roda `python manage.py makemigrations` para o Django ler seus models e criar um arquivo de script instruindo o que mudou.
- Depois, roda `python manage.py migrate` para o Django executar esse script no banco de dados, aplicando as tabelas e colunas de fato.

## Onde está a Conexão com o Banco de Dados?

A conexão está configurada no arquivo `core/settings.py`, na seção `DATABASES`.
O projeto está configurado para ler os dados do **Google Cloud SQL** ou Banco Local através de **variáveis de ambiente** (arquivo `.env`). As variáveis lidas são:
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_HOST` (IP ou proxy do Google Cloud)
- `POSTGRES_PORT`
