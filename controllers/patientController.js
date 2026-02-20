// Patient Controller
import {
    getAllPatients,
    getPatientById,
    getPatientByName,
    searchPatient
} from '../models/patientModel.js';

// GET /api/patients — list all patients
export const listPatients = async (req, res) => {
    try {
        const patients = await getAllPatients();
        res.json({ success: true, count: patients.length, data: patients });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/patients/id/:id — fetch patient by ID
export const fetchPatientById = async (req, res) => {
    try {
        const { id } = req.params;
        const patient = await getPatientById(id);
        if (!patient) {
            return res.status(404).json({ success: false, message: `Patient with ID '${id}' not found.` });
        }
        res.json({ success: true, data: patient });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/patients/name/:name — fetch patients by name
export const fetchPatientByName = async (req, res) => {
    try {
        const { name } = req.params;
        const patients = await getPatientByName(name);
        if (patients.length === 0) {
            return res.status(404).json({ success: false, message: `No patient found with name containing '${name}'.` });
        }
        res.json({ success: true, count: patients.length, data: patients });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/patients/search?q=... — search patients by ID/name/ward/room
export const searchPatients = async (req, res) => {
    try {
        const { q, role } = req.query;
        if (!q) {
            return res.status(400).json({ success: false, message: 'Query parameter q is required.' });
        }

        // Include facilities (Labs, Blood Bank) if user is in 'others' (Staff/Visitor) role
        const includeFacilities = role === 'others';
        const results = await searchPatient(q, includeFacilities);

        res.json({ success: true, count: results.length, data: results });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
