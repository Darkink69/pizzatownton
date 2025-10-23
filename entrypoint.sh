#!/bin/sh
set -euo pipefail

export VITE_API_URL=${VITE_API_URL:-https://pizzatownton.com/api}
export VITE_TIME=${VITE_TIME:-5000}
export VITE_WS_URL=${VITE_WS_URL:-wss://pizzatownton.com/ws}

echo "VITE_API_URL=$VITE_API_URL"
echo "VITE_TIME=$VITE_TIME"
echo "VITE_WS_URL=$VITE_WS_URL"

# функция экранирования для sed
escape_sed() {
  printf '%s' "$1" | sed -e 's/[\/&|\\]/\\&/g'
}

API_ESC=$(escape_sed "$VITE_API_URL")
TIME_ESC=$(escape_sed "$VITE_TIME")
WS_ESC=$(escape_sed "$VITE_WS_URL")


find /usr/share/nginx/html -type f \( -name "*.js" -o -name "*.html" -o -name "*.css" \) -exec \
  sed -i -e "s|__VITE_API_URL__|${API_ESC}|g" \
         -e "s|__VITE_TIME__|${TIME_ESC}|g" \
         -e "s|__VITE_WS_URL__|${WS_ESC}|g" {} +


if grep -R "__VITE_" -n /usr/share/nginx/html >/dev/null 2>&1; then
  echo "WARN: найдены незаменённые плейсхолдеры:"
  grep -R "__VITE_" -n /usr/share/nginx/html || true
fi

echo "Starting Nginx..."
exec nginx -g 'daemon off;'