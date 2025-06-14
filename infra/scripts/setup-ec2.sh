#!/bin/bash

# Atualizar sistema
sudo dnf update -y

# Instalar dependências
sudo dnf install -y git

# Configurar SSH para Git
mkdir -p ~/.ssh
chmod 700 ~/.ssh
ssh-keygen -t rsa -b 4096 -f ~/.ssh/ec2-bitplus -N "" -C "ec2-bitplus"
chmod 600 ~/.ssh/ec2-bitplus
chmod 644 ~/.ssh/ec2-bitplus.pub

# Mostrar a chave pública para ser adicionada ao GitHub/GitLab
echo "Adicione a seguinte chave pública ao seu GitHub/GitLab:"
cat ~/.ssh/ec2-bitplus.pub

# Configurar SSH para usar a chave
echo "Host github.com
    IdentityFile ~/.ssh/ec2-bitplus
    User git" >> ~/.ssh/config

chmod 600 ~/.ssh/config

# Instalar MySQL Client
sudo dnf install -y mariadb105

# Instalar Docker
sudo dnf install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Configurar timezone
sudo timedatectl set-timezone America/Sao_Paulo

# Configurar swap
sudo dd if=/dev/zero of=/swapfile bs=1M count=1024
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Criar diretórios necessários
mkdir -p ~/bitplus
cd ~/bitplus

# Clonar repositório (substitua pela URL do seu repositório)
# git clone <seu-repositorio>

# Configurar permissões
sudo chown -R ec2-user:ec2-user ~/bitplus

# Mensagem de conclusão
echo "Configuração inicial concluída!"
echo "Por favor, faça logout e login novamente para que as alterações tenham efeito."
echo "Em seguida, execute: cd ~/bitplus/infra && docker-compose up -d" 