# --- Этап 1: Сборка статических файлов ---
FROM node:20-bullseye AS build

WORKDIR /app

# Кэшируем зависимости
COPY package.json package-lock.json ./
RUN npm install

# Копируем исходники и собираем проект
COPY . .

# Важно! Чтобы PostCSS/Vite не падал на hash
ENV NODE_OPTIONS=--openssl-legacy-provider

# --- Собираем с плейсхолдерами ---
RUN VITE_API_URL="__VITE_API_URL__" \
    VITE_WS_URL="__VITE_WS_URL__" \
    npm run build

# --- Этап 2: Запуск на Nginx ---
FROM nginx:1.25-alpine

# Копируем конфиг Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Копируем статику
COPY --from=build /app/dist /usr/share/nginx/html

# Копируем и делаем исполняемым скрипт подстановки переменных
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

# HEALTHCHECK (опционально)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1


ENTRYPOINT ["/entrypoint.sh"]