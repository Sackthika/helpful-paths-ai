import express from 'express';
import cors from 'cors';
import { Op } from 'sequelize';
import { Department, initDb } from './database.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Get all departments
app.get('/api/departments', async (req, res) => {
    try {
        const depts = await Department.findAll();
        res.json(depts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch departments' });
    }
});

// Search departments
app.get('/api/search', async (req, res) => {
    const { q, lang } = req.query as { q: string, lang: string };

    if (!q) {
        return res.status(400).json({ error: 'Query parameter q is required' });
    }

    const query = q.toLowerCase().trim();
    const roomQuery = query.replace(/^(room|ward|அறை)\s*/i, "").trim();

    try {
        // 1. Try room/ward match
        let dept = await Department.findOne({
            where: {
                room: { [Op.like]: roomQuery }
            }
        });

        if (!dept) {
            // 2. Try name/id match
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
            // 3. Try keywords match
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
