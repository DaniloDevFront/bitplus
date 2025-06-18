# API Bitbook

API desenvolvida com NestJS para o sistema Bitbook.

## ✅ Requisitos

- Docker e Docker Compose instalados
- Arquivo `.env` para o ambiente desejado

---

## ⚙️ Ambientes disponíveis

- **Local**: com banco e phpMyAdmin (`.env.local`)
- **Development**: para uso com banco externo ou homolog (`.env.development`)
- **Produção**: build otimizado, banco externo (ex: RDS) (`.env.production`)

---

## 🛠️ Configuração `.env`

Crie um arquivo com base em `.env.example`:

### Exemplo `.env.local`

```env
NODE_ENV=local
APP_PORT=3032
MYSQL_PORT=3307
PHPMYADMIN_PORT=8081

DB_HOST=mysql
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=root
DB_DATABASE=bitbook_local

JWT_SECRET=sua_chave_secreta
```

---

## 🚀 Subindo o projeto com Docker

### 🧪 Ambiente local (com banco + phpMyAdmin)

```bash
npm run docker:local
```

### 🧪 Ambiente de desenvolvimento (banco externo, ex: RDS de homolog)

```bash
npm run docker:dev
```

### 🧪 Ambiente de produção (build otimizado)

```bash
npm run docker:prod
```

### ⛔ Encerrar containers

```bash
npm run docker:down
```

---

## 🧭 Acessos

| Serviço      | Endereço                           |
| ------------ | ---------------------------------- |
| API (NestJS) | http://localhost:`APP_PORT`        |
| Swagger      | http://localhost:`APP_PORT`/api    |
| phpMyAdmin   | http://localhost:`PHPMYADMIN_PORT` |

---

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes end-to-end
npm run test:e2e

# Cobertura
npm run test:cov
```

---

## 🗂️ Estrutura do Projeto

```
src/
├── core/           # Configurações e módulos principais
├── modules/        # Módulos da aplicação
│   ├── auth/       # Autenticação e autorização
│   └── user/       # Gerenciamento de usuários
└── shared/         # Recursos compartilhados (utils, pipes, etc)
```

---

## 📦 Scripts disponíveis

```bash
npm run build               # Compila o projeto
npm run start:local         # Inicia a API com live reload
npm run start:production    # Inicia a API em modo produção
npm run lint                # Lint com ESLint
```

---

## 🛡️ Segurança e boas práticas

- Utiliza `node:20-slim` para minimizar CVEs
- Suporte completo a libs nativas (ex: bcrypt)
- Dockerfile multistage para builds de produção enxutos
- Variáveis de ambiente via `.env`

---

Feito com 💻 por [sua equipe]
