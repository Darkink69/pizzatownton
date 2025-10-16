#!/bin/sh

# Устанавливаем переменные по умолчанию, если они не заданы
export VITE_API_URL=${VITE_API_URL:-https://default.api.url}
export VITE_TIME=${VITE_TIME:-5000}

echo "Setting VITE_API_URL to $VITE_API_URL"
echo "Setting VITE_TIME to $VITE_TIME"

# Находим все JS файлы и заменяем в них плейсхолдеры
for file in $(find /usr/share/nginx/html -type f -name "*.js");
do
  sed -i "s|__VITE_API_URL__|${VITE_API_URL}|g" "$file"
  sed -i "s|__VITE_TIME__|${VITE_TIME}|g" "$file"
done

echo "Starting Nginx..."
nginx -g 'daemon off;'