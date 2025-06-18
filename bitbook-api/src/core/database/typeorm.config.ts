import { DataSource } from 'typeorm';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { resolve } from 'path';

if (!process.env.NODE_ENV) {
  throw new Error('NODE_ENV não está definido! Defina no .env ou como variável de ambiente do processo.');
}

// 1. Carrega dotenv manualmente com base no NODE_ENV
const nodeEnv = process.env.NODE_ENV;
const envFile = resolve(process.cwd(), `.env.${nodeEnv}`);
config({ path: envFile });

console.log('NODE_ENV:', process.env.NODE_ENV);

// 2. Inicializa o ConfigService como no NestJS
const configService = new ConfigService();

// 3. Valida as variáveis essenciais
const required = ['DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD', 'DB_DATABASE'];
for (const key of required) {
  if (!configService.get(key)) {
    throw new Error(`Variável de ambiente obrigatória '${key}' não está definida.`);
  }
}

// 4. Exporta a configuração do DataSource
export default new DataSource({
  type: 'mysql',
  host: configService.getOrThrow('DB_HOST'),
  port: parseInt(configService.getOrThrow('DB_PORT'), 10),
  username: configService.getOrThrow('DB_USERNAME'),
  password: configService.getOrThrow('DB_PASSWORD'),
  database: configService.getOrThrow('DB_DATABASE'),
  entities: [join(process.cwd(), 'src', '**', '*.entity{.ts,.js}')],
  migrations: [join(process.cwd(), 'src', 'core', 'database', 'migrations', '*{.ts,.js}')],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: configService.get('NODE_ENV') === 'development',
});
