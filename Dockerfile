# --- Этап 1: Сборка статических файлов ---
FROM node:18-alpine AS build

WORKDIR /app

# Кэшируем зависимости
COPY package.json package-lock.json ./
RUN npm install

# Копируем исходники и собираем проект
COPY . .

# --- Собираем с плейсхолдерами ---
RUN VITE_API_URL="__VITE_API_URL__" \
    VITE_TIME="__VITE_TIME__" \
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

# ✅ ИСПРАВЛЕНО: убрана лишняя буква "a"
ENTRYPOINT ["/entrypoint.sh"]