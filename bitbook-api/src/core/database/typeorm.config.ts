import { DataSource } from 'typeorm';
import { join } from 'path';
import * as dotenv from 'dotenv';
import 'tsconfig-paths/register';

// Carrega as variáveis de ambiente do arquivo correto baseado no NODE_ENV
const env = process.env.NODE_ENV;
const envFile = `.env.${env}`;
dotenv.config({ path: envFile });

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Arquivo de env carregado:', envFile);
console.log('DB_HOST:', process.env.DB_HOST);

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
