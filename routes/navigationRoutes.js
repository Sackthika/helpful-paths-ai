import { Router } from 'express';
import {
    fetchGraph,
    fetchNodes,
    computePath,
    navigateToPatient,
    scanQR
} from '../controllers/navigationController.js';

const router = Router();

router.get('/graph', fetchGraph);
router.get('/nodes', fetchNodes);
router.post('/path', computePath);
router.post('/navigate-to-patient', navigateToPatient);
router.get('/qr/:code', scanQR);

export default router;
