# Backend Dockerfile - FastAPI Service
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application code and cached data
COPY backend/app/ /app/app/
COPY backend/data/ /app/data/
COPY backend/run_backend.py /app/run_backend.py

ENV PORT=8000
EXPOSE 8000

CMD ["python", "run_backend.py", "--port", "8000"]
