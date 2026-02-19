import * as XLSX from 'xlsx';
import { Department, Patient } from '@/data/hospitalData';

export const exportHospitalDataToExcel = (departments: Department[], patients: Patient[], campusName: string) => {
    const wb = XLSX.utils.book_new();

    // 1. Departments Sheet
    const deptRows = departments.map((d: Department) => ({
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
    const patientRows = patients.map((p: Patient) => ({
        ID: p.id,
        Name: p.name,
        "Phone Number": p.phoneNumber || 'N/A',
        Ward: p.ward || 'N/A',
        Room: p.room,
        Floor: p.floor
    }));
    const patientWs = XLSX.utils.json_to_sheet(patientRows);
    XLSX.utils.book_append_sheet(wb, patientWs, "Patients");

    // Save File
    XLSX.writeFile(wb, `${campusName.replace(/\s+/g, '_')}_Dataset.xlsx`);
};
