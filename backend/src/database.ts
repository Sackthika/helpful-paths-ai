import { Sequelize, DataTypes, Model } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths to frontend dataset
const DATASET_DIR = path.join(__dirname, '../../helpful-paths-ai/src/data/dataset');
const DEPARTMENTS_JSON = path.join(DATASET_DIR, 'departments.json');

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
    declare keywords: string;
    declare keywordsTA: string;
    declare x: number;
    declare y: number;
    declare occupancy: number;
    declare waitTime: number;
}

export class Patient extends Model {
    declare id: string;
    declare name: string;
    declare room: string;
    declare floor: number;
    declare phoneNumber: string;
    declare ward: string;
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
        occupancy: { type: DataTypes.INTEGER, defaultValue: 0 },
        waitTime: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    { sequelize, modelName: 'Department' }
);

Patient.init(
    {
        id: { type: DataTypes.STRING, primaryKey: true },
        name: { type: DataTypes.STRING, allowNull: false },
        room: { type: DataTypes.STRING, allowNull: false },
        floor: { type: DataTypes.INTEGER, allowNull: false },
        phoneNumber: { type: DataTypes.STRING, allowNull: true },
        ward: { type: DataTypes.STRING, allowNull: true },
    },
    { sequelize, modelName: 'Patient' }
);

const PATIENTS_JSON = path.join(DATASET_DIR, 'patients.json');

export const initDb = async () => {
    try {
        await sequelize.sync({ force: true });

        // Load Departments from Frontend JSON
        let departments = [];
        if (fs.existsSync(DEPARTMENTS_JSON)) {
            const rawData = fs.readFileSync(DEPARTMENTS_JSON, 'utf8');
            departments = JSON.parse(rawData);
            console.log('📖 Loading departments from frontend dataset...');
        } else {
            console.warn('⚠️ Frontend departments.json not found, using fallback data.');
            departments = [
                { id: "reception", name: "Reception", nameTA: "வரவேற்பு", floor: 0, block: "A", side: "Entrance", sideTA: "நுழைவாயில்", room: "G01", category: "General", keywords: "help", keywordsTA: "உதவி", x: 50, y: 30 }
            ];
        }

        await Department.bulkCreate(departments);

        // Load Patients from Frontend JSON
        let patients = [];
        if (fs.existsSync(PATIENTS_JSON)) {
            const rawData = fs.readFileSync(PATIENTS_JSON, 'utf8');
            patients = JSON.parse(rawData);
            console.log('📖 Loading patients from frontend dataset...');
        } else {
            console.warn('⚠️ Frontend patients.json not found, using internal fallback.');
            patients = [
                { id: "P101", name: "Arun Jaya", room: "201", floor: 2, phoneNumber: "9876543210", ward: "General Ward A" },
                { id: "P102", name: "Selvi Mani", room: "207", floor: 2, phoneNumber: "9876543211", ward: "General Ward A" }
            ];
        }

        await Patient.bulkCreate(patients);

        console.log(`✅ Database synced with frontend: ${departments.length} departments, ${patients.length} patients`);
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        throw error;
    }
};

export default sequelize;
