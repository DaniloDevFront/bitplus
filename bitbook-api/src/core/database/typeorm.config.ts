import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

const configService = new ConfigService();

export default new DataSource({
  type: 'mysql',
  host: configService.get('DB_HOST'),
  port: configService.get('DB_PORT', 3306),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_DATABASE'),
  entities: [join(process.cwd(), 'src', '**', '*.entity{.ts,.js}')],
  migrations: [join(process.cwd(), 'src', 'core', 'database', 'migrations', '*{.ts,.js}')],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: configService.get('NODE_ENV') === 'development',
});