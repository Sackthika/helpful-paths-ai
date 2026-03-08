import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import campus from '../data/dataset/campus.json' assert { type: 'json' };
import departments from '../data/dataset/departments.json' assert { type: 'json' };
import patients from '../data/dataset/patients.json' assert { type: 'json' };
import { floors } from '../data/hospitalData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..', '..');

function generateHtmlReport() {
    const today = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hospital Master Dataset Report - ${campus.name}</title>
    <style>
        :root {
            --primary: #6366f1;
            --primary-light: #eef2ff;
            --accent: #f59e0b;
            --text-main: #1e293b;
            --text-muted: #64748b;
            --border: #e2e8f0;
        }
        body { 
            font-family: 'Inter', -apple-system, sans-serif; 
            padding: 40px; 
            color: var(--text-main);
            line-height: 1.6;
            margin: 0;
            background: #f8fafc;
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            padding: 50px;
            box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
            border-radius: 16px;
        }
        header { 
            text-align: center; 
            border-bottom: 3px solid var(--primary); 
            margin-bottom: 40px; 
            padding-bottom: 30px; 
        }
        h1 { color: var(--primary); margin: 0; font-size: 2.5em; letter-spacing: -0.02em; }
        h2 { color: var(--text-muted); margin: 10px 0; font-weight: 500; }
        .gen-info { font-size: 0.9em; color: var(--text-muted); margin-top: 15px; }
        
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
        .card { 
            background: var(--primary-light); 
            padding: 20px; 
            border-radius: 12px; 
            border: 1px solid var(--border);
        }
        .card h3 { margin-top: 0; color: var(--primary); font-size: 1.1em; text-transform: uppercase; }

        .section { margin-bottom: 50px; }
        .section-title { 
            font-size: 1.5em; 
            border-left: 6px solid var(--accent); 
            padding-left: 15px; 
            margin-bottom: 25px; 
            font-weight: 800;
            color: var(--text-main);
        }
        
        table { width: 100%; border-collapse: collapse; margin-top: 10px; background: white; }
        th { 
            text-align: left; 
            background: #f1f5f9; 
            padding: 15px; 
            border-bottom: 2px solid var(--border); 
            font-size: 0.85em;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--text-muted);
        }
        td { padding: 15px; border-bottom: 1px solid var(--border); font-size: 0.95em; }
        tr:hover { background: #fdfdfd; }
        
        .bilingual { font-size: 0.85em; color: var(--text-muted); display: block; margin-top: 4px; font-style: italic; }
        .tag {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            background: #e2e8f0;
            margin-right: 4px;
        }
        
        @media print {
            body { background: white; padding: 0; }
            .container { box-shadow: none; border-radius: 0; padding: 20px; width: 100%; max-width: none; }
            .section { break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>${campus.name}</h1>
            <h2>${campus.nameTA}</h2>
            <div class="gen-info">Hospital Dataset Report • Generated: ${today}</div>
        </header>

        <div class="grid">
            <div class="card">
                <h3>Campus Summary</h3>
                <p><strong>Floors:</strong> ${floors.length}</p>
                <p><strong>Departments:</strong> ${departments.length}</p>
            </div>
            <div class="card">
                <h3>Contact Information</h3>
                <p><strong>Phone:</strong> ${campus.phone}</p>
                <p><strong>Emergency:</strong> 108</p>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Campus Details / வளாக விவரங்கள்</div>
            <p><strong>Address:</strong> ${campus.address}</p>
            <p><strong>Tamil Address:</strong> ${campus.addressTA}</p>
        </div>

        <div class="section">
            <div class="section-title">Directory / துறைகள்</div>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Department / துறை</th>
                        <th>Location / இடம்</th>
                        <th>Room</th>
                    </tr>
                </thead>
                <tbody>
                    ${departments.map((d: any) => `
                        <tr>
                            <td><strong>${d.id}</strong></td>
                            <td>
                                <div>${d.name}</div>
                                <span class="bilingual">${d.nameTA}</span>
                            </td>
                            <td>
                                Floor ${d.floor}, Block ${d.block}
                                <span class="bilingual">${d.side} side</span>
                            </td>
                            <td><span class="tag">${d.room}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="section">
            <div class="section-title">Patients Dataset / நோயாளிகள்</div>
            <p>Total records: ${patients.length}. Displaying first 50 records.</p>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Ward / Category</th>
                        <th>Room</th>
                    </tr>
                </thead>
                <tbody>
                    ${patients.slice(0, 50).map((p: any) => `
                        <tr>
                            <td>${p.id}</td>
                            <td>${p.name}</td>
                            <td>${p.ward || 'General'}</td>
                            <td>${p.room}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <footer style="margin-top: 60px; text-align: center; font-size: 0.85em; color: var(--text-muted); border-top: 1px solid var(--border); padding-top: 20px;">
            This report is automatically generated from the Hospital Navigation AI System master dataset.<br>
            &copy; ${new Date().getFullYear()} ${campus.name}. Confirmed and Verified.
        </footer>
    </div>
</body>
</html>
    `;

    const outputPath = path.join(projectRoot, 'hospital_dataset_report.html');
    fs.writeFileSync(outputPath, html);
    console.log(`✅ Success! Report generated at: ${outputPath}`);
}

generateHtmlReport();
