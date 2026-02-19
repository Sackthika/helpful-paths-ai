import * as XLSX from 'xlsx';
import { Department, Patient, FloorInfo } from '@/data/hospitalData';

export const exportHospitalDataToExcel = (
    departments: Department[],
    patients: Patient[],
    floors: FloorInfo[],
    campusName: string
) => {
    const wb = XLSX.utils.book_new();

    // 1. Campus Overview Sheet
    const campusRows = [
        ["Hospital Name", campusName],
        ["Generated Date", new Date().toLocaleString()],
        ["Total Departments", departments.length],
        ["Total Patients", patients.length],
        ["Total Floors", floors.length]
    ];
    const campusWs = XLSX.utils.aoa_to_sheet(campusRows);
    XLSX.utils.book_append_sheet(wb, campusWs, "Overview");

    // 2. Departments Sheet
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

    // 3. Patients Sheet
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

    // 4. Floors Sheet
    const floorRows = floors.map((f: FloorInfo) => ({
        Level: f.floor,
        "Label (EN)": f.label,
        "Label (TA)": f.labelTA,
        Blocks: f.blocks.join(', ')
    }));
    const floorWs = XLSX.utils.json_to_sheet(floorRows);
    XLSX.utils.book_append_sheet(wb, floorWs, "Floors");

    // Save File
    XLSX.writeFile(wb, `${campusName.replace(/\s+/g, '_')}_Master_Dataset.xlsx`);
};
