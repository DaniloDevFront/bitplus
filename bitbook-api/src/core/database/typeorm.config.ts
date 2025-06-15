import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { config } from 'dotenv';

// Carrega as variáveis de ambiente
config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [join(process.cwd(), 'src', '**', '*.entity{.ts,.js}')],
  migrations: [join(process.cwd(), 'src', 'core', 'database', 'migrations', '*{.ts,.js}')],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
});

// Função para criar o DataSource com ConfigService
export const createTypeOrmDataSource = (configService: ConfigService) => {
  return new DataSource({
    type: 'mysql',
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT', 3306),
    username: configService.get('DB_USER'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_NAME'),
    entities: [join(process.cwd(), 'src', '**', '*.entity{.ts,.js}')],
    migrations: [join(process.cwd(), 'src', 'core', 'database', 'migrations', '*{.ts,.js}')],
    migrationsTableName: 'migrations',
    synchronize: false,
    logging: configService.get('NODE_ENV') !== 'production',
  });
};