FROM nginx:alpine

# Remove a configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia as configurações personalizadas
COPY conf.d/ /etc/nginx/conf.d/

# Cria diretórios necessários
RUN mkdir -p /var/log/nginx && \
    mkdir -p /etc/nginx/ssl

# Expõe as portas 80 e 443
EXPOSE 80 443

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"] 