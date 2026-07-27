#!/bin/sh
set -e

cd /var/www/html

# Remove any stale cached config that may have baked in empty values
rm -f bootstrap/cache/config.php bootstrap/cache/routes-v7.php bootstrap/cache/services.php

# Write .env only if it doesn't exist (first boot)
if [ ! -f .env ]; then
    cp .env.example .env
fi

# Always overwrite APP_KEY
if [ -n "$APP_KEY" ]; then
    sed -i "s|^APP_KEY=.*|APP_KEY=${APP_KEY}|" .env
else
    php artisan key:generate --force
fi

# Storage link
php artisan storage:link --force 2>/dev/null || true

# Run migrations
php artisan migrate --force || true

# Inject Railway PORT into nginx config
PORT=${PORT:-8000}
sed -i "s/NGINX_PORT/${PORT}/g" /etc/nginx/nginx.conf

# Start supervisor (nginx + php-fpm)
exec supervisord -c /etc/supervisor/conf.d/supervisord.conf
