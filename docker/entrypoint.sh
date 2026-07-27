#!/bin/sh
set -e

cd /var/www/html

# Create .env from environment variables if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
fi

# Generate app key if not set
if [ -z "$APP_KEY" ]; then
    php artisan key:generate --force
fi

# Cache config/routes/views (non-fatal)
php artisan config:cache  || true
php artisan route:cache   || true
php artisan view:cache    || true

# Storage link
php artisan storage:link --force 2>/dev/null || true

# Run migrations
php artisan migrate --force || true

# Inject Railway PORT into nginx config
PORT=${PORT:-8000}
sed -i "s/NGINX_PORT/${PORT}/g" /etc/nginx/nginx.conf

# Start supervisor (nginx + php-fpm)
exec supervisord -c /etc/supervisor/conf.d/supervisord.conf
