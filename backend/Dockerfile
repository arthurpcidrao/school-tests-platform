# FROM python:3.12-slim

# # The installer requires curl (and certificates) to download the release archive
# RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates libpq-dev gcc python3-dev && rm -rf /var/lib/apt/lists/*

# # Download the latest installer
# ADD https://astral.sh/uv/install.sh /uv-installer.sh
# # Run the installer then remove it
# RUN sh /uv-installer.sh && rm /uv-installer.sh
# # Ensure the installed binary is on the `PATH`
# ENV PATH="/root/.local/bin/:$PATH"

# WORKDIR /app

# # Install dependencies using uv
# COPY pyproject.toml uv.lock ./
# RUN uv sync --frozen

# # Copy project files
# COPY . .

# # Run the Django server (or gunicorn for production)
# CMD ["uv", "run", "python", "manage.py", "runserver", "0.0.0.0:8000"]


FROM python:3.12-slim

# Instala dependências do sistema necessárias para o PostgreSQL e compilação
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    libpq-dev \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Instala o uv de forma otimizada (copiando o binário diretamente)
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Primeiro copiamos apenas os arquivos de dependências (otimiza o cache do Docker)
COPY pyproject.toml uv.lock ./

# Instala as dependências criando o ambiente virtual (.venv)
RUN uv sync --frozen

# --- MUDANÇA CRUCIAL: Adiciona o .venv ao PATH do container ---
ENV PATH="/app/.venv/bin:$PATH"

# Agora copiamos o restante do código
COPY . .

# Comando de execução usando 'uv run' para garantir o carregamento do ambiente
CMD ["uv", "run", "python", "manage.py", "runserver", "0.0.0.0:8000"]