# frontend/Dockerfile
# Multi-stage build
FROM node:20-alpine AS builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json (если есть)
COPY ./frontend/package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь фронтенд
COPY ./frontend/ .

# Передаём API URL
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Сборка
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Копируем nginx.conf из корня
COPY ./nginx.conf /etc/nginx/nginx.conf

# Копируем собранные файлы
COPY --from=builder /app/dist /usr/share/nginx/html

# Удаляем дефолтный конфиг
RUN rm -f /etc/nginx/conf.d/default.conf

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]