FROM python:3.12-slim-bookworm

# УСТАНАВЛИВАЕМ node + npm + java + curl
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    openjdk-17-jre-headless \
    curl \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# PREBUILT БИНАРНИКИ
COPY tools/bin/kiterunner /usr/local/bin/kiterunner
COPY tools/bin/zap.sh /usr/local/bin/zap.sh
COPY tools/zap/ /opt/zap/
RUN chmod +x /usr/local/bin/kiterunner /usr/local/bin/zap.sh

# Spectral + Newman — ТЕПЕРЬ npm ЕСТЬ!
RUN npm install -g @stoplight/spectral-cli newman

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .
COPY core/ core/
COPY tools/ tools/

RUN touch core/__init__.py tools/__init__.py
RUN mkdir -p /tmp/plugins && chown -R nobody:nogroup /app /tmp/plugins

USER nobody
EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]