# Infraestrutura Docker para Bitbook

Este diretório contém a configuração Docker para o ambiente de produção do Bitbook.

## Estrutura

```
infra/
├── docker-compose.yml    # Configuração principal dos containers
├── nginx/               # Configuração do Nginx
│   ├── Dockerfile      # Dockerfile do Nginx
│   └── conf.d/         # Configurações do Nginx
│       └── default.conf # Configuração do proxy reverso
```

## Requisitos

- Docker
- Docker Compose
- Node.js 20.x (para desenvolvimento local)

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Banco de Dados
DB_PASSWORD=sua_senha
DB_DATABASE=bitbook_prod

# Outras variáveis necessárias para os serviços
```

## Comandos Úteis

### Iniciar todos os serviços

```bash
docker-compose up -d
```

### Parar todos os serviços

```bash
docker-compose down
```

### Ver logs

```bash
docker-compose logs -f
```

### Reconstruir imagens

```bash
docker-compose build
```

### Reconstruir e reiniciar serviços

```bash
docker-compose up -d --build
```

## Troubleshooting

### Problemas com permissões

Se encontrar problemas de permissão com os volumes do Docker, execute:

```bash
sudo chown -R 1000:1000 ./nginx/logs
```

### Limpar volumes não utilizados

```bash
docker volume prune
```

### Limpar imagens não utilizadas

```bash
docker image prune -a
```

## SSL/TLS

Para configurar SSL/TLS:

1. Coloque seus certificados em `nginx/ssl/`
2. Descomente as linhas SSL no arquivo `nginx/conf.d/default.conf`
3. Reinicie o container do Nginx:

```bash
docker-compose restart nginx
```
