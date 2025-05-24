import { Router } from 'express';
import {
  getAllSiswa,
  getSiswaById,
  createSiswa,
  updateSiswa,
  deleteSiswa,
} from '../controllers/siswaController';

const router = Router();

// Rute untuk manajemen data siswa
router.get('/', getAllSiswa);          // GET /api/siswa - Mendapatkan semua siswa (dengan paginasi & filter)
router.get('/:id', getSiswaById);    // GET /api/siswa/:id - Mendapatkan siswa berdasarkan ID
router.post('/', createSiswa);         // POST /api/siswa - Membuat siswa baru
router.put('/:id', updateSiswa);       // PUT /api/siswa/:id - Memperbarui siswa berdasarkan ID
router.delete('/:id', deleteSiswa);   // DELETE /api/siswa/:id - Menghapus siswa berdasarkan ID

export default router;
