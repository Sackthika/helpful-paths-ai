import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data/dataset');
const OUTPUT_FILE = path.join(__dirname, '../../../hospital_dataset.xlsx');

import { Department, Patient } from '../data/hospitalData';

const departmentsData: Department[] = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'departments.json'), 'utf8'));
const patientsData: Patient[] = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'patients.json'), 'utf8'));
const campusData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'campus.json'), 'utf8'));

const generateExcel = () => {
    const wb = XLSX.utils.book_new();

    // 1. Departments Sheet
    const deptRows = departmentsData.map((d: Department) => ({
        ID: d.id,
        "Name (EN)": d.name,
        "Name (TA)": d.nameTA,
        Floor: d.floor,
        Block: d.block,
        Side: d.side,
        Room: d.room,
        Category: d.category,
        Keywords: d.keywords
    }));
    const deptWs = XLSX.utils.json_to_sheet(deptRows);
    XLSX.utils.book_append_sheet(wb, deptWs, "Departments");

    // 2. Patients Sheet
    const patientRows = patientsData.map((p: Patient) => ({
        ID: p.id,
        Name: p.name,
        "Phone Number": p.phoneNumber || 'N/A',
        Ward: p.ward || 'N/A',
        Room: p.room,
        Floor: p.floor
    }));
    const patientWs = XLSX.utils.json_to_sheet(patientRows);
    XLSX.utils.book_append_sheet(wb, patientWs, "Patients");

    // 3. Campus Overview Sheet
    const campusRows: any[][] = [
        ["Hospital Name", campusData.name],
        ["Tamil Name", campusData.nameTA],
        ["Address", campusData.address],
        ["Phone", campusData.phone],
        ["Total Buildings", campusData.buildings.length]
    ];
    campusData.buildings.forEach((b: any) => {
        campusRows.push([`Building: ${b.label}`, b.name]);
    });
    const campusWs = XLSX.utils.aoa_to_sheet(campusRows);
    XLSX.utils.book_append_sheet(wb, campusWs, "Campus Info");

    // Save File
    XLSX.writeFile(wb, OUTPUT_FILE);
    console.log(`✅ Excel file generated at: ${OUTPUT_FILE}`);
};

generateExcel();
