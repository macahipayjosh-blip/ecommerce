#!/bin/sh
set -e

cd /var/www/html

# Remove any stale cached config that may have baked in empty values
rm -f bootstrap/cache/config.php bootstrap/cache/routes-v7.php bootstrap/cache/services.php

# Write .env only if it doesn't exist (first boot)
if [ ! -f .env ]; then
    cp .env.example .env
fi

# Overwrite .env values from Railway environment variables
overwrite_env() {
    local key=$1
    local val=$2
    if [ -n "$val" ]; then
        if grep -q "^${key}=" .env; then
            sed -i "s|^${key}=.*|${key}=${val}|" .env
        else
            echo "${key}=${val}" >> .env
        fi
    fi
}

if [ -n "$APP_KEY" ]; then
    overwrite_env APP_KEY "$APP_KEY"
else
    php artisan key:generate --force
fi

overwrite_env APP_ENV "${APP_ENV:-production}"
overwrite_env APP_URL "$APP_URL"
overwrite_env APP_DEBUG "${APP_DEBUG:-false}"
overwrite_env DB_CONNECTION "$DB_CONNECTION"
overwrite_env DB_HOST "$DB_HOST"
overwrite_env DB_PORT "$DB_PORT"
overwrite_env DB_DATABASE "$DB_DATABASE"
overwrite_env DB_USERNAME "$DB_USERNAME"
overwrite_env DB_PASSWORD "$DB_PASSWORD"
overwrite_env SESSION_DRIVER "$SESSION_DRIVER"
overwrite_env CACHE_STORE "$CACHE_STORE"
overwrite_env QUEUE_CONNECTION "$QUEUE_CONNECTION"

# Storage link
php artisan storage:link --force 2>/dev/null || true

# Run migrations
php artisan migrate --force || true

# Inject Railway PORT into nginx config
PORT=${PORT:-8000}
sed -i "s/NGINX_PORT/${PORT}/g" /etc/nginx/nginx.conf

# Start supervisor (nginx + php-fpm)
exec supervisord -c /etc/supervisor/conf.d/supervisord.conf
