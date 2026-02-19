import express from 'express';
import cors from 'cors';
import { Op } from 'sequelize';
import { Department, Patient, initDb } from './database.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Symptom to Department Mapping (AI Engine)
const SYMPTOM_MAP: Record<string, string> = {
    "heart": "cardiology",
    "chest pain": "cardiology",
    "breathing": "cardiology",
    "bone": "orthopedics",
    "fracture": "orthopedics",
    "leg pain": "orthopedics",
    "headache": "neurology",
    "seizure": "neurology",
    "brain": "neurology",
    "ear": "ent",
    "nose": "ent",
    "throat": "ent",
    "child": "pediatrics",
    "baby": "pediatrics",
    "kids": "pediatrics",
    "pregnancy": "gynecology",
    "women": "gynecology",
    "eye": "ophthalmology",
    "vision": "ophthalmology",
    "skin": "dermatology",
    "rash": "dermatology",
    "stomach": "gastroenterology",
    "digestion": "gastroenterology",
    "kidney": "nephrology",
    "dialysis": "nephrology",
    "urine": "urology",
    "bladder": "urology",
    "teeth": "dental",
    "tooth": "dental",
    "dentist": "dental",
    "gum": "dental",
    "blood test": "lab",
    "scan": "radiology",
    "x-ray": "radiology",
    "mri": "radiology",
    "diet": "dietetics",
    "food": "canteen"
};

const SYMPTOM_MAP_TA: Record<string, string> = {
    "இதயம்": "cardiology",
    "நெஞ்சு வலி": "cardiology",
    "மூச்சு": "cardiology",
    "எலும்பு": "orthopedics",
    "கை கால் வலி": "orthopedics",
    "தலைவலி": "neurology",
    "மூளை": "neurology",
    "காது": "ent",
    "மூக்கு": "ent",
    "தொண்டை": "ent",
    "குழந்தை": "pediatrics",
    "பெண்கள்": "gynecology",
    "கண்": "ophthalmology",
    "பார்வை": "ophthalmology",
    "தோல்": "dermatology",
    "வயிறு": "gastroenterology",
    "செரிமானம்": "gastroenterology",
    "சிறுநீரகம்": "nephrology",
    "இரத்தம்": "blood_bank",
    "பல்": "dental",
    "குழந்தை நலம்": "pediatrics",
    "பிரசவம்": "gynecology",
    "உணவு": "canteen",
    "எக்ஸ்ரே": "radiology",
    "ஸ்கேன்": "radiology"
};

// Get all departments
app.get('/api/departments', async (req, res) => {
    try {
        const depts = await Department.findAll();
        res.json(depts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch departments' });
    }
});

// Search patients
app.get('/api/patients/search', async (req, res) => {
    const { q, name, id, phone, ward } = req.query as { q?: string, name?: string, id?: string, phone?: string, ward?: string };

    try {
        let patient;

        if (name || id || phone || ward) {
            const orConditions: any[] = [];
            if (name) orConditions.push({ name: { [Op.like]: `%${name.trim()}%` } });
            if (id) orConditions.push({ id: { [Op.like]: `%${id.trim()}%` } });
            if (phone) orConditions.push({ phoneNumber: { [Op.like]: `%${phone.trim()}%` } });
            if (ward) orConditions.push({ ward: { [Op.like]: `%${ward.trim()}%` } });

            patient = await Patient.findOne({
                where: { [Op.or]: orConditions }
            });
        } else if (q) {
            const query = q.toLowerCase().trim();
            patient = await Patient.findOne({
                where: {
                    [Op.or]: [
                        { id: { [Op.like]: `%${query}%` } },
                        { name: { [Op.like]: `%${query}%` } },
                        { phoneNumber: { [Op.like]: `%${query}%` } },
                        { ward: { [Op.like]: `%${query}%` } }
                    ]
                }
            });
        } else {
            return res.status(400).json({ error: 'Search parameters required' });
        }

        if (patient) {
            const dept = await Department.findOne({
                where: { room: patient.room }
            });
            res.json({ ...patient.toJSON(), dept });
        } else {
            res.status(404).json({ error: 'Patient not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Patient search failed' });
    }
});

// Search departments
app.get('/api/search', async (req, res) => {
    const { q, lang } = req.query as { q: string, lang: string };

    if (!q) {
        return res.status(400).json({ error: 'Query parameter q is required' });
    }

    const query = q.toLowerCase().trim();
    const roomQuery = query.replace(/(ward|room|no|number|அறை|எண்|பிரிவு)\.?\s*/gi, "").trim();

    try {
        let deptId = null;
        for (const [symptom, id] of Object.entries(SYMPTOM_MAP)) {
            if (query.includes(symptom)) {
                deptId = id;
                break;
            }
        }
        if (!deptId) {
            for (const [symptom, id] of Object.entries(SYMPTOM_MAP_TA)) {
                if (query.includes(symptom)) {
                    deptId = id;
                    break;
                }
            }
        }

        if (deptId) {
            const dept = await Department.findByPk(deptId);
            if (dept) return res.json(dept);
        }

        let dept = await Department.findOne({
            where: {
                [Op.or]: [
                    { room: { [Op.like]: `%${roomQuery}%` } },
                    { id: { [Op.like]: `%${roomQuery}%` } }
                ]
            }
        });

        if (!dept) {
            dept = await Department.findOne({
                where: {
                    [Op.or]: [
                        { name: { [Op.like]: `%${query}%` } },
                        { nameTA: { [Op.like]: `%${query}%` } },
                        { id: { [Op.like]: `%${query}%` } }
                    ]
                }
            });
        }

        if (!dept) {
            const allDepts = await Department.findAll();
            dept = allDepts.find(d => {
                const keywords = d.keywords.split(',')
                    .concat(d.keywordsTA.split(','))
                    .concat([d.room.toLowerCase(), `ward ${d.room.toLowerCase()}`, `room ${d.room.toLowerCase()}`]);
                return keywords.some(k => query.includes(k.toLowerCase()) || k.toLowerCase().includes(query));
            }) || null;
        }

        if (dept) {
            res.json(dept);
        } else {
            res.status(404).json({ error: 'Department not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Search failed' });
    }
});

initDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to initialize database:', err);
});
