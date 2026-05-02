FROM python:3.12-slim

# The installer requires curl (and certificates) to download the release archive
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates libpq-dev gcc python3-dev && rm -rf /var/lib/apt/lists/*

# Download the latest installer
ADD https://astral.sh/uv/install.sh /uv-installer.sh
# Run the installer then remove it
RUN sh /uv-installer.sh && rm /uv-installer.sh
# Ensure the installed binary is on the `PATH`
ENV PATH="/root/.local/bin/:$PATH"

WORKDIR /app

# Install dependencies using uv
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen

# Copy project files
COPY . .

# Run the Django server (or gunicorn for production)
CMD ["uv", "run", "python", "manage.py", "runserver", "0.0.0.0:8000"]
