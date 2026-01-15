import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config();

const isProduction = process.env.NODE_ENV === 'production';

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT ?? '3306'),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || '1kulte',
  entities: isProduction ? ['dist/**/*.entity.js'] : ['src/**/*.entity.ts'],
  migrations: isProduction
    ? ['dist/migrations/*.js']
    : ['src/migrations/*.ts'],
  synchronize: false,
  migrationsRun: false,
  migrationsTableName: 'migrations',
  migrationsTransactionMode: 'all',
});
