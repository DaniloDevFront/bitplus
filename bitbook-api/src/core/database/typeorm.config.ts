import { DataSource } from 'typeorm';
import { join } from 'path';
import * as dotenv from 'dotenv';
import 'tsconfig-paths/register';

// Carrega as variáveis de ambiente do arquivo correto baseado no NODE_ENV
const env = process.env.NODE_ENV;
if (!env) {
  throw new Error('NODE_ENV não está definido');
}

const envFile = `.env.${env}`;
dotenv.config({ path: envFile });

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Arquivo de env carregado:', envFile);
console.log('DB_HOST:', process.env.DB_HOST);

// Validação das variáveis de ambiente obrigatórias
const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD', 'DB_DATABASE'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Variável de ambiente ${envVar} não está definida`);
  }
}

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [join(process.cwd(), 'src', '**', '*.entity{.ts,.js}')],
  migrations: [join(process.cwd(), 'src', 'core', 'database', 'migrations', '*{.ts,.js}')],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});
