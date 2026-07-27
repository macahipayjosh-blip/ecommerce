# ── Stage 1: Node build ──────────────────────────────────────────────────────
FROM node:20-alpine AS node-build

WORKDIR /app

# Install composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
RUN apk add --no-cache php83 php83-phar php83-mbstring php83-openssl php83-tokenizer php83-xml php83-xmlwriter php83-dom php83-json \
    && ln -sf /usr/bin/php83 /usr/local/bin/php

# Install PHP deps first (needed for ziggy)
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts --no-interaction --ignore-platform-reqs

# Install Node deps
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ── Stage 2: PHP runtime ──────────────────────────────────────────────────────
FROM php:8.2-fpm-alpine AS php-base

# System deps + PHP extensions
RUN apk add --no-cache \
        nginx \
        supervisor \
        curl \
        unzip \
        libpng-dev \
        libjpeg-turbo-dev \
        libwebp-dev \
        freetype-dev \
        oniguruma-dev \
        libxml2-dev \
        sqlite-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_sqlite \
        pdo_mysql \
        mbstring \
        exif \
        pcntl \
        bcmath \
        gd \
        opcache

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Install PHP deps
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts --no-interaction

# Copy app source
COPY . .

# Copy built frontend assets from node stage
COPY --from=node-build /app/public/build ./public/build

# Permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

# Nginx config
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Supervisor config
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Entrypoint
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]
