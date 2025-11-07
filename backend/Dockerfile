# backend/Dockerfile
FROM python:3.12-slim

# Системные зависимости
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl wget git ca-certificates build-essential golang-go \
    && rm -rf /var/lib/apt/lists/*

# Node.js + Spectral + Newman
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g @stoplight/spectral-cli newman

# Kiterunner (сборка из исходников)
RUN git clone https://github.com/assetnote/kiterunner.git /tmp/kr \
    && cd /tmp/kr \
    && make build \
    && cp dist/kr /usr/local/bin/kiterunner \
    && chmod +x /usr/local/bin/kiterunner \
    && rm -rf /tmp/kr

# OWASP ZAP
RUN wget -q https://github.com/zaproxy/zaproxy/releases/download/v2.15.0/ZAP_2.15.0_Linux.tar.gz -O /tmp/zap.tar.gz \
    && tar -xzf /tmp/zap.tar.gz -C /opt \
    && mv /opt/ZAP_* /opt/zap \
    && ln -s /opt/zap/zap.sh /usr/local/bin/zap.sh \
    && rm /tmp/zap.tar.gz

# Рабочая директория
WORKDIR /app

# Python-зависимости
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Копируем код (ОБРАТИ ВНИМАНИЕ: без backend/ в пути!)
COPY app.py .
COPY core/ /app/core/
COPY tools/ /app/tools/

# Папка для пользовательских плагинов
RUN mkdir -p /tmp/plugins && chmod 777 /tmp/plugins

# Порт
EXPOSE 8080

# Запуск
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080"]