import { Router } from 'express';
import {
  getNilaiBySiswaId,
  batchUpdateNilaiSiswa,
  deleteNilaiSiswaById
} from '../controllers/nilaiSiswaController';

const router = Router();

// Route to get all grades for a specific student
// e.g., GET /api/nilai/siswa/123
router.get('/siswa/:siswaId', getNilaiBySiswaId);

// Route to batch update/create grades for a specific student
// e.g., POST /api/nilai/siswa/123
router.post('/siswa/:siswaId', batchUpdateNilaiSiswa);

// Route to delete a specific grade entry by its own ID
// e.g., DELETE /api/nilai/45
router.delete('/:nilaiId', deleteNilaiSiswaById);

export default router;
