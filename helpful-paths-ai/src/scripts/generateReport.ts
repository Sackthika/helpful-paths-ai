import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data/dataset');
const OUTPUT_FILE = path.join(__dirname, '../../../hospital_dataset_report.html');

const departmentsData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'departments.json'), 'utf8'));
const patientsData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'patients.json'), 'utf8'));
const campusData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'campus.json'), 'utf8'));

const generateHtml = () => {
    const today = new Date().toISOString().split('T')[0];

    let deptRows = departmentsData.map((d: any) => `
                    <tr>
                        <td>${d.id}</td>
                        <td>${d.name}<span class="bilingual">${d.nameTA}</span></td>
                        <td>Block ${d.block}, Floor ${d.floor}</td>
                        <td>${d.room}</td>
                        <td><span class="tag tag-category">${d.category}</span></td>
                    </tr>`).join('');

    let patientRows = patientsData.map((p: any) => `
                    <tr>
                        <td>${p.id}</td>
                        <td>${p.name}</td>
                        <td>${p.phoneNumber || 'N/A'}</td>
                        <td>${p.ward || 'N/A'}</td>
                        <td>${p.room}</td>
                    </tr>`).join('');

    let blockInfo = campusData.buildings.map((b: any) => `
                    <li><strong>${b.label}:</strong> ${b.name.split('—')[1]?.trim() || b.name}</li>`).join('');

    const html = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hospital Navigation Dataset Report</title>
    <style>
        :root {
            --primary: #6366f1;
            --secondary: #475569;
            --accent: #f59e0b;
            --background: #f8fafc;
            --card: #ffffff;
            --text: #0f172a;
            --border: #e2e8f0;
        }

        @media print {
            body { background: white !important; padding: 0 !important; }
            .no-print { display: none; }
            .card { border: 1px solid #eee !important; box-shadow: none !important; break-inside: avoid; }
            .page-break { page-break-before: always; }
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: var(--background);
            color: var(--text);
            line-height: 1.6;
            margin: 0;
            padding: 40px 20px;
        }

        .container { max-width: 900px; margin: 0 auto; }
        header { text-align: center; margin-bottom: 50px; border-bottom: 2px solid var(--primary); padding-bottom: 20px; }
        h1 { margin: 0; color: var(--primary); font-size: 2.5rem; }
        h2 { margin: 5px 0; color: var(--secondary); font-size: 1.2rem; }
        .meta { font-size: 0.9rem; color: #666; margin-top: 10px; }
        .section-title { font-size: 1.5rem; color: var(--text); border-left: 5px solid var(--accent); padding-left: 15px; margin: 40px 0 20px 0; text-transform: uppercase; letter-spacing: 1px; }
        .card { background: var(--card); border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid var(--border); }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { text-align: left; background: #f1f5f9; padding: 12px; font-size: 0.85rem; text-transform: uppercase; color: var(--secondary); border-bottom: 2px solid var(--border); }
        td { padding: 12px; border-bottom: 1px solid var(--border); font-size: 0.95rem; }
        .tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
        .tag-category { background: #dcfce7; color: #166534; }
        .btn-print { position: fixed; bottom: 30px; right: 30px; background: var(--primary); color: white; border: none; padding: 12px 24px; border-radius: 50px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.4); }
        .bilingual { font-size: 0.8rem; color: var(--secondary); display: block; margin-top: 2px; }
    </style>
</head>

<body>
    <div class="container">
        <header>
            <h1>${campusData.name}</h1>
            <h2>${campusData.nameTA}</h2>
            <p class="meta">Hospital Infrastructure Dataset Report • Updated: ${today}</p>
        </header>

        <button class="btn-print no-print" onclick="window.print()">
            ⎙ Print / Save as PDF
        </button>

        <div class="section-title">Campus Overview / வளாக மேலோட்டம்</div>
        <div class="grid">
            <div class="card">
                <h3 style="margin-top:0">Blocks / பிளாக்குகள்</h3>
                <ul>${blockInfo}</ul>
            </div>
            <div class="card">
                <h3 style="margin-top:0">Address / முகவரி</h3>
                <p>${campusData.address}</p>
                <p style="font-size: 0.9rem; color: #666;">${campusData.addressTA}</p>
                <p><strong>Phone:</strong> ${campusData.phone}</p>
            </div>
        </div>

        <div class="section-title">Department List / துறை பட்டியல்</div>
        <div class="card">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name / பெயர்</th>
                        <th>Location / இடம்</th>
                        <th>Room</th>
                        <th>Category</th>
                    </tr>
                </thead>
                <tbody>${deptRows}</tbody>
            </table>
        </div>

        <div class="section-title page-break">Patient Directory / நோயாளி அடைவு</div>
        <div class="card">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name / பெயர்</th>
                        <th>Phone / போன்</th>
                        <th>Ward / வார்டு</th>
                        <th>Room</th>
                    </tr>
                </thead>
                <tbody>${patientRows}</tbody>
            </table>
        </div>

        <footer style="margin-top: 50px; text-align: center; color: var(--secondary); font-size: 0.8rem;">
            © 2026 City General Hospital Navigation System • Automatically Generated
        </footer>
    </div>
</body>
</html>`;

    fs.writeFileSync(OUTPUT_FILE, html);
    console.log(`✅ Report generated at: ${OUTPUT_FILE}`);
};

generateHtml();
