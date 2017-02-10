FROM php:5.6-apache

RUN apt-get -qq update \
 && apt-get -qq install libmcrypt-dev libldap2-dev -y \
 && rm -rf /var/lib/apt/lists/*

RUN docker-php-source extract \
 && docker-php-ext-configure ldap --with-libdir=lib/x86_64-linux-gnu \
 && docker-php-ext-install ldap pdo pdo_mysql \
 && docker-php-source delete

RUN a2enmod rewrite \
 && a2enmod ssl \
 && a2enmod headers

COPY .htaccess /var/www/html/.htaccess
