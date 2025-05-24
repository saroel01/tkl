import { Router } from 'express';
import { generateSklController } from '../controllers/sklController';

const router = Router();

// GET /api/skl/:siswaId/download
router.get('/:siswaId/download', generateSklController);

export default router;
