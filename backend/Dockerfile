# backend/Dockerfile
FROM python:3.12-slim

# Системные зависимости
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Node.js + spectral-cli
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g @stoplight/spectral-cli

# Рабочая директория
WORKDIR /app

# Python-зависимости
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Код
COPY app.py .

# Порт
EXPOSE 8080

# Запуск
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080"]