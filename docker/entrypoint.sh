#!/bin/sh
set -e

cd /var/www/html

# Create .env from environment variables if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
fi

# Write APP_KEY into .env if provided as env var but not in file
if [ -n "$APP_KEY" ]; then
    sed -i "s|^APP_KEY=.*|APP_KEY=${APP_KEY}|" .env
else
    php artisan key:generate --force
fi

# Inject all critical env vars from Railway environment into .env
for VAR in APP_URL APP_ENV APP_DEBUG \
           DB_CONNECTION DB_HOST DB_PORT DB_DATABASE DB_USERNAME DB_PASSWORD \
           SESSION_DRIVER CACHE_STORE QUEUE_CONNECTION \
           MAIL_MAILER MAIL_HOST MAIL_PORT MAIL_USERNAME MAIL_PASSWORD MAIL_ENCRYPTION MAIL_FROM_ADDRESS \
           ADMIN_REGISTER_TOKEN; do
    eval VAL=\$$VAR
    if [ -n "$VAL" ]; then
        if grep -q "^${VAR}=" .env; then
            sed -i "s|^${VAR}=.*|${VAR}=${VAL}|" .env
        else
            echo "${VAR}=${VAL}" >> .env
        fi
    fi
done

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
