# Guia de Deploy - Ambiente de Teste (Free Tier)

## 1. Criar Instância EC2

1. Acesse o Console AWS
2. Vá para EC2 > Instances > Launch Instance
3. Configure a instância:
   - Nome: bitplus-test
   - AMI: Amazon Linux 2023
   - Tipo: t2.micro (Free Tier)
   - Par de chaves: Criar novo
   - Security Group: Criar novo
     - SSH (22)
     - HTTP (80)
     - HTTPS (443)

## 2. Configurar Elastic IP

1. Vá para EC2 > Elastic IPs
2. Aloque novo endereço
3. Associe à instância criada

## 3. Conectar à Instância

```bash
# Ajuste as permissões do arquivo .pem
chmod 400 bitplus.pem

# Conecte via SSH
ssh -i bitplus.pem ec2-user@<seu-elastic-ip>
```

## 4. Configurar SSH para Git

1. Criar e configurar chave SSH:

```bash
# Criar diretório .ssh com permissões corretas
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Gerar chave SSH
ssh-keygen -t rsa -b 4096 -f ~/.ssh/ec2-bitplus -N "" -C "ec2-bitplus"

# Configurar permissões
chmod 600 ~/.ssh/ec2-bitplus
chmod 644 ~/.ssh/ec2-bitplus.pub

# Mostrar a chave pública
cat ~/.ssh/ec2-bitplus.pub
```

2. Adicionar a chave ao GitHub/GitLab:

   - GitHub: Settings > SSH and GPG keys > New SSH key
   - GitLab: Preferences > SSH Keys

3. Configurar SSH para usar a chave:

```bash
# Criar/editar arquivo de configuração SSH
echo "Host github.com
    IdentityFile ~/.ssh/ec2-bitplus
    User git" >> ~/.ssh/config

chmod 600 ~/.ssh/config
```

4. Testar conexão:

```bash
# Para GitHub
ssh -T git@github.com

# Para GitLab
ssh -T git@gitlab.com
```

## 5. Instalar Git e Clonar Repositório

```bash
# Instalar Git
sudo dnf install -y git

# Clonar o repositório
git clone <seu-repositorio> ~/bitplus
```

## 6. Configurar Ambiente

1. Tornar o script executável:

```bash
chmod +x ~/bitplus/infra/scripts/setup-ec2.sh
```

2. Executar o script de setup:

```bash
~/bitplus/infra/scripts/setup-ec2.sh
```

3. Faça logout e login novamente

## 7. Configurar Aplicação

1. Configure as variáveis de ambiente:

```bash
cp bitbook-api/.env.example bitbook-api/.env.production
# Edite o arquivo .env.production com as configurações corretas
```

2. Inicie os containers:

```bash
cd ~/bitplus/infra
docker-compose up -d
```

## 8. Verificar Deploy

1. Acesse a aplicação:

   - http://<seu-elastic-ip>

2. Verifique os logs:

```bash
docker-compose logs -f
```

## 9. Comandos Úteis

```bash
# Ver status dos containers
docker-compose ps

# Reiniciar containers
docker-compose restart

# Ver logs de um serviço específico
docker-compose logs -f bitbook-api

# Parar todos os containers
docker-compose down

# Reconstruir e iniciar containers
docker-compose up -d --build
```

## 10. Monitoramento Básico

1. Acesse o CloudWatch no console AWS
2. Verifique as métricas básicas:
   - CPU
   - Memória
   - Disco

## 11. Backup Básico

1. Backup do banco de dados:

```bash
# Execute dentro do container
docker-compose exec bitbook-api npm run db:backup
```

2. Backup dos volumes:

```bash
# Crie um script de backup
mkdir -p ~/backups
tar -czf ~/backups/bitplus-$(date +%Y%m%d).tar.gz ~/bitplus
```

## 12. Próximos Passos

1. Configurar HTTPS
2. Implementar monitoramento avançado
3. Configurar backup automatizado
4. Preparar para ambiente de produção
