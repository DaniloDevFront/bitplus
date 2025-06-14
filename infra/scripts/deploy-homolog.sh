#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Função para log
log() {
    echo -e "${2:-$GREEN}$1${NC}"
}

# Função para erro
error() {
    log "$1" "$RED"
    exit 1
}

# Função para backup do banco
backup_database() {
    log "Iniciando backup do banco de dados..."
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="backup_${TIMESTAMP}.sql"
    
    # Backup do banco
    mysqldump -h $DB_HOST -u $DB_USERNAME -p$DB_PASSWORD $DB_DATABASE > $BACKUP_FILE
    
    if [ $? -eq 0 ]; then
        log "Backup realizado com sucesso: $BACKUP_FILE"
    else
        error "Falha ao realizar backup"
    fi
}

# Função para executar migrations
run_migrations() {
    log "Verificando migrations pendentes..."
    
    # Verifica migrations pendentes
    PENDING_MIGRATIONS=$(npm run migration:show --silent)
    
    if [ -n "$PENDING_MIGRATIONS" ]; then
        log "Executando migrations pendentes..."
        npm run migration:run
        
        if [ $? -eq 0 ]; then
            log "Migrations executadas com sucesso"
        else
            error "Falha ao executar migrations"
        fi
    else
        log "Nenhuma migration pendente"
    fi
}

# Função para rollback
rollback() {
    log "Iniciando rollback..."
    npm run migration:revert
    
    if [ $? -eq 0 ]; then
        log "Rollback realizado com sucesso"
    else
        error "Falha ao realizar rollback"
    fi
}

# Função principal de deploy
deploy() {
    log "Iniciando deploy em homologação..."
    
    # Backup do banco
    backup_database
    
    # Pull das alterações
    log "Atualizando código..."
    git pull origin main
    
    # Instala dependências
    log "Instalando dependências..."
    npm install
    
    # Build da aplicação
    log "Realizando build..."
    npm run build
    
    # Executa migrations
    run_migrations
    
    # Reinicia os containers
    log "Reiniciando containers..."
    docker compose up -d --build
    
    log "Deploy concluído com sucesso!"
}

# Executa o deploy
deploy 