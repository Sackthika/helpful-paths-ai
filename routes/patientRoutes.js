import { Router } from 'express';
import {
    listPatients,
    fetchPatientById,
    fetchPatientByName,
    searchPatients
} from '../controllers/patientController.js';

const router = Router();

router.get('/', listPatients);
router.get('/search', searchPatients);
router.get('/id/:id', fetchPatientById);
router.get('/name/:name', fetchPatientByName);

export default router;
