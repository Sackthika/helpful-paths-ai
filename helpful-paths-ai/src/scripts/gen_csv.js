import fs from 'fs';

const departments = ['Emergency', 'Cardiology', 'Orthopedics', 'Radiology', 'Neurology', 'Pediatrics', 'Oncology', 'Maternity', 'Urology', 'ENT', 'Ophthalmology', 'General Medicine'];
const names = ['Arjun', 'Sriya', 'Rohan', 'Ananya', 'Vikram', 'Ishita', 'Karthik', 'Saanvi', 'Nikhil', 'Priyanka', 'Aarav', 'Meera', 'Aditya', 'Keerthana', 'Manish', 'Diya', 'Sanjay', 'Ritika', 'Varun', 'Swathi'];
const surnames = ['Sharma', 'Patel', 'Iyer', 'Singh', 'Mehta', 'Gupta', 'Kumar', 'Reddy', 'Chatterjee', 'Joshi'];

let content = 'SL.NO,PATIENT ID,PATIENT NAME,PHONE NO,CATEGORY,FLOOR NUMBER,WARD NUMBER\n';
for (let i = 1; i <= 100; i++) {
    const deptIdx = Math.min(11, Math.floor((i - 1) / 8.33));
    const dept = departments[deptIdx];
    const floor = 1 + Math.floor(deptIdx / 4);
    const ward = 'W' + i.toString().padStart(3, '0');
    const name = names[(i - 1) % names.length] + ' ' + surnames[Math.floor(Math.random() * surnames.length)];
    const pid = 'PID' + i.toString().padStart(3, '0');
    const phone = '9' + Math.floor(100000000 + Math.random() * 900000000);
    content += `${i},${pid},${name},${phone},${dept},${floor},${ward}\n`;
}

fs.writeFileSync('hospital_dataset.csv', content);
console.log('Successfully generated hospital_dataset.csv with 100 patients.');
