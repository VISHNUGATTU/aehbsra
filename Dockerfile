# Unified Single-Container Deployment Dockerfile (Heroku / Render / Railway)
FROM node:22-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Python 3.12 Runtime
FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application and cached January 2026 Elexon data
COPY backend/app/ /app/app/
COPY backend/data/ /app/data/
COPY backend/run_backend.py /app/run_backend.py

# Copy pre-built React frontend into static distribution path
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
