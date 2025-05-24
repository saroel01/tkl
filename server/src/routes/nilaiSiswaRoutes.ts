import { Router } from 'express';
import { getNilaiBySiswaId, createOrUpdateNilaiSiswaBatch } from '../controllers/nilaiSiswaController';
// Impor middleware otentikasi jika diperlukan di masa depan
// import { authenticateToken } from '../middleware/authMiddleware'; 

const router = Router();

// Mendapatkan semua nilai untuk seorang siswa
// Tambahkan authenticateToken jika rute ini perlu dilindungi
router.get('/siswa/:siswaId', getNilaiBySiswaId);

// Membuat atau memperbarui (batch) nilai untuk seorang siswa
// Tambahkan authenticateToken jika rute ini perlu dilindungi
router.post('/siswa/:siswaId', createOrUpdateNilaiSiswaBatch);

export default router;
