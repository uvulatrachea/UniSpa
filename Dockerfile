FROM php:8.4

# System deps
RUN apt-get update -y && apt-get install -y \
    openssl \
    zip \
    unzip \
    git \
    curl \
    wget \
    nodejs \
    npm \
    libpq-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
 && rm -rf /var/lib/apt/lists/*

# Composer
RUN curl -sS https://getcomposer.org/installer | php -- \
    --install-dir=/usr/local/bin --filename=composer

# PHP extensions (this is the IMPORTANT part)
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
 && docker-php-ext-install \
    pdo \
    pdo_pgsql \
    pgsql \
    mbstring \
    zip \
    exif \
    pcntl \
    gd \
    bcmath

# (Optional) Only install MySQL extensions if you REALLY use MySQL
# RUN docker-php-ext-install pdo_mysql mysqli

WORKDIR /var/www/html

# Copy composer files first (better caching)
COPY composer.json composer.lock ./
RUN composer install --no-interaction --prefer-dist --optimize-autoloader --no-scripts

# Copy package files first (better caching)
COPY package*.json ./
RUN if [ -f "package.json" ]; then npm install; else echo "No package.json found"; fi

# Copy the rest of the app
COPY .env .env

# Permissions for Laravel
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
 && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Run Laravel on port 80 INSIDE container (so nginx can proxy to it)
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=80"]

EXPOSE 80
