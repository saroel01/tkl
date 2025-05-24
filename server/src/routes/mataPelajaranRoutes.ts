import { Router } from 'express';
import { getAllMataPelajaran } from '../controllers/mataPelajaranController';
// import { authenticateToken } from '../middleware/authMiddleware'; // Jika perlu otentikasi

const router = Router();

// Tambahkan authenticateToken jika rute ini perlu dilindungi
router.get('/', getAllMataPelajaran);

export default router;
