import { Sequelize, DataTypes, Model } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../hospital.sqlite'),
    logging: false,
});

export class Department extends Model {
    declare id: string;
    declare name: string;
    declare nameTA: string;
    declare floor: number;
    declare block: string;
    declare side: string;
    declare sideTA: string;
    declare room: string;
    declare category: string;
    declare keywords: string; // Stored as comma-separated string
    declare keywordsTA: string; // Stored as comma-separated string
    declare x: number;
    declare y: number;
}

Department.init(
    {
        id: { type: DataTypes.STRING, primaryKey: true },
        name: { type: DataTypes.STRING, allowNull: false },
        nameTA: { type: DataTypes.STRING, allowNull: false },
        floor: { type: DataTypes.INTEGER, allowNull: false },
        block: { type: DataTypes.STRING, allowNull: false },
        side: { type: DataTypes.STRING, allowNull: false },
        sideTA: { type: DataTypes.STRING, allowNull: false },
        room: { type: DataTypes.STRING, allowNull: false },
        category: { type: DataTypes.STRING, allowNull: false },
        keywords: { type: DataTypes.TEXT, allowNull: false },
        keywordsTA: { type: DataTypes.TEXT, allowNull: false },
        x: { type: DataTypes.FLOAT, allowNull: false },
        y: { type: DataTypes.FLOAT, allowNull: false },
    },
    {
        sequelize,
        modelName: 'Department',
    }
);

export const initDb = async () => {
    await sequelize.sync(); // Sync without dropping tables

    // Seed initial data only if table is empty
    const count = await Department.count();
    if (count > 0) return;

    const initialDepartments = [
        { id: "reception", name: "Reception", nameTA: "வரவேற்பு", floor: 0, block: "A", side: "Main Entrance", sideTA: "முக்கிய நுழைவாயில்", room: "G01", category: "General", keywords: "reception,front desk,help,information,entrance", keywordsTA: "வரவேற்பு,உதவி", x: 50, y: 30 },
        { id: "emergency", name: "Emergency / ER", nameTA: "அவசர சிகிச்சை", floor: 0, block: "A", side: "Left Side", sideTA: "இடது பக்கம்", room: "G05", category: "Emergency", keywords: "emergency,er,accident,trauma,urgent", keywordsTA: "அவசரம்,அவசர சிகிச்சை", x: 20, y: 50 },
        { id: "pharmacy", name: "Pharmacy", nameTA: "மருந்தகம்", floor: 0, block: "B", side: "Right Side", sideTA: "வலது பக்கம்", room: "G10", category: "Services", keywords: "pharmacy,medicine,drug,medical store,tablets", keywordsTA: "மருந்தகம்,மருந்து", x: 75, y: 70 },
        { id: "billing", name: "Billing Counter", nameTA: "பில்லிங் கவுண்டர்", floor: 0, block: "A", side: "Right Side", sideTA: "வலது பக்கம்", room: "G03", category: "Services", keywords: "billing,payment,cashier,pay,bill", keywordsTA: "பில்லிங்,கட்டணம்", x: 60, y: 30 },
        { id: "lab", name: "Laboratory", nameTA: "ஆய்வகம்", floor: 0, block: "B", side: "Rear Side", sideTA: "பின் பக்கமாக", room: "G12", category: "Diagnostics", keywords: "lab,laboratory,blood test,test,sample", keywordsTA: "ஆய்வகம்,இரத்த பரிசோதனை", x: 80, y: 40 },
        { id: "cardiology", name: "Cardiology OPD", nameTA: "இதய நோய் பிரிவு", floor: 1, block: "B", side: "East Wing", sideTA: "கிழக்கு பகுதி", room: "104", category: "OPD", keywords: "cardiology,heart,cardiac,chest pain,ecg", keywordsTA: "இதயம்,இதய நோய்", x: 55, y: 35 },
        { id: "orthopedics", name: "Orthopedics OPD", nameTA: "எலும்பு சிகிச்சை", floor: 1, block: "A", side: "West Wing", sideTA: "மேற்கு பகுதி", room: "108", category: "OPD", keywords: "orthopedics,bone,fracture,joint,knee,spine", keywordsTA: "எலும்பு,மூட்டு", x: 30, y: 50 },
        { id: "neurology", name: "Neurology OPD", nameTA: "நரம்பு நோய் பிரிவு", floor: 1, block: "C", side: "North Wing", sideTA: "வடக்கு பகுதி", room: "112", category: "OPD", keywords: "neurology,neuro,brain,nerve,headache,seizure", keywordsTA: "நரம்பு,மூளை", x: 80, y: 60 },
        { id: "ent", name: "ENT Department", nameTA: "காது மூக்கு தொண்டை", floor: 1, block: "B", side: "East Wing", sideTA: "கிழக்கு பகுதி", room: "106", category: "OPD", keywords: "ent,ear,nose,throat,hearing", keywordsTA: "காது,மூக்கு,தொண்டை", x: 55, y: 65 },
        { id: "radiology", name: "Radiology / X-Ray", nameTA: "கதிரியக்கவியல்", floor: 1, block: "A", side: "West Wing", sideTA: "மேற்கு பகுதி", room: "115", category: "Diagnostics", keywords: "radiology,x-ray,xray,scan,mri,ct,ultrasound", keywordsTA: "எக்ஸ்ரே,ஸ்கேன்", x: 25, y: 30 },
        { id: "icu", name: "ICU", nameTA: "தீவிர சிகிச்சை பிரிவு", floor: 2, block: "A", side: "North Side", sideTA: "வடக்குப் பக்கம்", room: "201", category: "Critical", keywords: "icu,intensive care,critical,ventilator", keywordsTA: "தீவிர சிகிச்சை,ஐசியூ", x: 25, y: 40 },
        { id: "surgery", name: "Surgery Ward", nameTA: "அறுவை சிகிச்சை பிரிவு", floor: 2, block: "B", side: "Central Area", sideTA: "மையப் பகுதி", room: "204", category: "Ward", keywords: "surgery,operation,ot,operation theatre", keywordsTA: "அறுவை சிகிச்சை,ஆபரேஷன்", x: 55, y: 35 },
        { id: "pediatrics", name: "Pediatrics Ward", nameTA: "குழந்தை நல பிரிவு", floor: 2, block: "C", side: "South Wing", sideTA: "தெற்கு பகுதி", room: "210", category: "Ward", keywords: "pediatrics,child,children,baby,kids", keywordsTA: "குழந்தை,குழந்தை நல", x: 80, y: 55 },
        { id: "gynecology", name: "Gynecology OPD", nameTA: "மகளிர் மருத்துவம்", floor: 2, block: "B", side: "Central Area", sideTA: "மையப் பகுதி", room: "207", category: "OPD", keywords: "gynecology,gynaecology,women,maternity,pregnancy,obstetrics", keywordsTA: "மகளிர்,பெண்கள்", x: 55, y: 65 },
        { id: "dermatology", name: "Dermatology", nameTA: "தோல் நோய் பிரிவு", floor: 3, block: "A", side: "West Wing", sideTA: "மேற்கு பகுதி", room: "301", category: "OPD", keywords: "dermatology,skin,rash,allergy", keywordsTA: "தோல்,சரும", x: 30, y: 40 },
        { id: "ophthalmology", name: "Ophthalmology", nameTA: "கண் மருத்துவம்", floor: 3, block: "B", side: "East Wing", sideTA: "கிழக்கு பகுதி", room: "305", category: "OPD", keywords: "ophthalmology,eye,vision,cataract,glasses", keywordsTA: "கண்,பார்வை", x: 65, y: 50 },
        { id: "admin", name: "Administration", nameTA: "நிர்வாகம்", floor: 3, block: "A", side: "North Wing", sideTA: "வடக்கு பகுதி", room: "310", category: "Admin", keywords: "admin,administration,office,director,management", keywordsTA: "நிர்வாகம்,அலுவலகம்", x: 30, y: 65 },
    ];

    await Department.bulkCreate(initialDepartments);
};

export default sequelize;
