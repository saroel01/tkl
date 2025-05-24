import { Router } from 'express';
import { generateSklController, downloadSklByTokenController } from '../controllers/sklController';

const router = Router();

// Existing route (if you want to keep it, otherwise it can be removed or refactored)
// GET /api/skl/:siswaId/download 
// router.get('/:siswaId/download', generateSklController);

// New route for FR-09 & FR-10: Download SKL by Token
// GET /api/skl/download/:token
router.get('/download/:token', downloadSklByTokenController);

export default router;
