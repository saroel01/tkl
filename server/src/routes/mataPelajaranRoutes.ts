import { Router } from 'express';
import {
  getAllMataPelajaran,
  getMataPelajaranById,
  createMataPelajaran,
  updateMataPelajaran,
  deleteMataPelajaran
} from '../controllers/mataPelajaranController';

const router = Router();

router.get('/', getAllMataPelajaran);
router.get('/:id', getMataPelajaranById);
router.post('/', createMataPelajaran);
router.put('/:id', updateMataPelajaran);
router.delete('/:id', deleteMataPelajaran);

export default router;
