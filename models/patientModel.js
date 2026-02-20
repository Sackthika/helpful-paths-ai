// Patient Model — reads from JSON file
import { readJSON } from '../utils/fileHelper.js';

export const getAllPatients = async () => {
    return await readJSON('patients.json');
};

export const getPatientById = async (id) => {
    const patients = await readJSON('patients.json');
    return patients.find(p => p.id.toLowerCase() === id.toLowerCase()) || null;
};

export const getPatientByName = async (name) => {
    const patients = await readJSON('patients.json');
    const query = name.toLowerCase().trim();
    return patients.filter(p => p.name.toLowerCase().includes(query));
};

export const searchPatient = async (query, includeFacilities = false) => {
    const patients = await readJSON('patients.json');
    const q = query.toLowerCase().trim();

    let results = patients.filter(p =>
        p.id.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.ward.toLowerCase().includes(q) ||
        p.room.toLowerCase().includes(q) ||
        (p.disease && p.disease.toLowerCase().includes(q)) ||
        (p.diseaseTamil && p.diseaseTamil.toLowerCase().includes(q))
    ).map(p => ({ ...p, type: 'patient' }));

    if (includeFacilities) {
        const graph = await readJSON('hospital_graph.json');
        const facilities = graph.nodes.filter(n =>
            n.isFacility && (
                n.label.toLowerCase().includes(q) ||
                (n.labelTamil && n.labelTamil.toLowerCase().includes(q))
            )
        ).map(f => ({
            id: f.id,
            name: f.label,
            nameTamil: f.labelTamil,
            floor: f.floor,
            type: 'facility',
            room: f.label, // For unified rendering
            ward: 'Hospital Facility',
            wardTamil: 'மருத்துவமனை வசதி'
        }));
        results = [...results, ...facilities];
    }

    return results;
};
