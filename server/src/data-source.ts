import 'reflect-metadata';
import { DataSource } from 'typeorm';
import path from 'path';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: path.join(__dirname, '..', 'database.sqlite'), // Menyimpan database di root folder server
  synchronize: false, // Skema database dikelola melalui migrasi
  logging: false, // Nonaktifkan logging query SQL (bisa diaktifkan jika perlu debugging)
  entities: [
    path.join(__dirname, 'entity', '**', '*.{ts,js}') // Lokasi file entity
  ],
  migrations: [
    path.join(__dirname, 'migration', '**', '*.{ts,js}') // Lokasi file migration
  ],
  subscribers: [
    path.join(__dirname, 'subscriber', '**', '*.{ts,js}') // Lokasi file subscriber
  ],
});
