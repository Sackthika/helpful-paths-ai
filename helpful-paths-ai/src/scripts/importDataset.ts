import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvPath = path.resolve(__dirname, '../../hospital_dataset.csv');
const patientsJsonPath = path.resolve(__dirname, '../data/dataset/patients.json');
const departmentsJsonPath = path.resolve(__dirname, '../data/dataset/departments.json');

const csvContent = fs.readFileSync(csvPath, 'utf8');
const lines = csvContent.split('\n').filter(line => line.trim() !== '');
const headers = lines[0].split(',');

const patients = lines.slice(1).map(line => {
    const values = line.split(',');
    const patient: any = {};
    headers.forEach((header, index) => {
        const key = header.trim();
        const value = values[index]?.trim();
        if (key === 'PATIENT ID') patient.id = value;
        if (key === 'PATIENT NAME') patient.name = value;
        if (key === 'PHONE NO') patient.phoneNumber = value;
        if (key === 'CATEGORY') patient.ward = value;
        if (key === 'FLOOR NUMBER') patient.floor = parseInt(value);
        if (key === 'WARD NUMBER') patient.room = value;
    });
    return patient;
});

// Update patients.json
fs.writeFileSync(patientsJsonPath, JSON.stringify(patients, null, 4));

// Update departments.json with missing wards/categories
const departments = JSON.parse(fs.readFileSync(departmentsJsonPath, 'utf8'));

const categoriesFromCsv = Array.from(new Set(patients.map(p => p.ward)));
categoriesFromCsv.forEach(cat => {
    const exists = departments.find((d: any) =>
        d.id.toLowerCase() === cat.toLowerCase() ||
        d.name.toLowerCase().includes(cat.toLowerCase())
    );

    if (!exists) {
        // Add new department for the category
        const samplePatient = patients.find(p => p.ward === cat);
        departments.push({
            id: cat.toLowerCase().replace(/\s+/g, '_'),
            name: `${cat} Department`,
            nameTA: cat, // Placeholder for Tamil
            floor: samplePatient.floor,
            block: samplePatient.floor === 1 ? 'A' : (samplePatient.floor === 2 ? 'B' : 'C'),
            side: 'Ward Wing',
            sideTA: 'வார்டு பகுதி',
            room: samplePatient.room,
            category: 'Ward',
            keywords: `${cat.toLowerCase()},ward,room`,
            keywordsTA: cat,
            x: Math.floor(Math.random() * 60) + 20,
            y: Math.floor(Math.random() * 60) + 20,
            occupancy: 50,
            waitTime: 10
        });
    }
});

fs.writeFileSync(departmentsJsonPath, JSON.stringify(departments, null, 4));

console.log(`Imported ${patients.length} patients and updated departments.`);
