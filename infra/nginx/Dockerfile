FROM nginx:1.24

# Remove a configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Instala dependências e Certbot
RUN apt-get update && apt-get install -y \
    bash \
    curl \
    certbot \
    python3-certbot-nginx \
    cron \
    && rm -rf /var/lib/apt/lists/*

# Copia as configurações personalizadas
COPY conf.d/ /etc/nginx/conf.d/

# Cria diretórios necessários
RUN mkdir -p /var/log/nginx && \
    mkdir -p /etc/nginx/ssl && \
    mkdir -p /var/www/certbot

# Configurar renovação automática do Certbot
RUN echo "0 12 * * * /usr/bin/certbot renew --quiet --deploy-hook 'nginx -s reload'" | crontab -

# Expõe as portas 80 e 443
EXPOSE 80 443

# Instala o wait-for-it
ADD https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

# Script de inicialização
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Altere o entrypoint para aguardar o bitbook-api:3000 e iniciar cron
ENTRYPOINT ["/start.sh"] 