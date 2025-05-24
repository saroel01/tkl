import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getPengaturanSekolah, updatePengaturanSekolah } from '../controllers/pengaturanSekolahController';

const router = Router();

// Konfigurasi Multer untuk penyimpanan file
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'public', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Batasi format logo: PNG transparan, ukuran < 1 MB (sesuai README.md)
  if (file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Hanya file PNG yang diizinkan!'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1 * 1024 * 1024 } // 1 MB
});

// Definisi Rute
router.get('/', getPengaturanSekolah);
router.put('/', 
  upload.fields([
    { name: 'logo_sekolah', maxCount: 1 },
    { name: 'logo_dinas', maxCount: 1 }
  ]), 
  updatePengaturanSekolah
);

export default router;
