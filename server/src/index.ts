import 'reflect-metadata';
import express, { Express, Request, Response, NextFunction } from 'express';
import { AppDataSource } from './data-source';
import pengaturanSekolahRoutes from './routes/pengaturanSekolahRoutes';
import siswaRoutes from './routes/siswaRoutes';
import sklRoutes from './routes/sklRoutes';
import nilaiSiswaRoutes from './routes/nilaiSiswaRoutes';
import mataPelajaranRoutes from './routes/mataPelajaranRoutes';
import path from 'path';
import cors from 'cors';

const app: Express = express();

// Middleware untuk parsing body JSON dan URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware CORS
app.use(cors({ origin: 'http://localhost:5173' }));

// Middleware untuk menyajikan file statis dari folder 'public'
app.use('/public', express.static(path.join(__dirname, '..', 'public')));
const port = process.env.PORT || 3001;

// Daftarkan rute
app.use('/api/pengaturan-sekolah', pengaturanSekolahRoutes);
app.use('/api/siswa', siswaRoutes);
app.use('/api/skl', sklRoutes);
app.use('/api/nilai', nilaiSiswaRoutes);
app.use('/api/matapelajaran', mataPelajaranRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Server Aplikasi Kelulusan Berjalan!');
});

// Global Error Handler Middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Global Error Handler:", err.stack);
  // Cek apakah header sudah terkirim
  if (res.headersSent) {
    return next(err); // Delegasikan ke default Express error handler jika header sudah terkirim
  }
  res.status(500).json({
    message: 'Terjadi kesalahan pada server.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, // Opsional: tampilkan stack trace di development
  });
});

AppDataSource.initialize()
  .then(() => {
    console.log('[database]: Koneksi database berhasil.');
    app.listen(port, () => {
  console.log(`[server]: Server berjalan di http://localhost:${port}`);
    });
  })
  .catch((error) => console.log('[database]: Error koneksi database:', error));
