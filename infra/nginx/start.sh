#!/bin/bash

# Iniciar o cron em background
service cron start

# Aguardar o bitbook-api estar disponível
/wait-for-it.sh bitbook-api:3000

# Iniciar o Nginx
exec nginx -g "daemon off;" 