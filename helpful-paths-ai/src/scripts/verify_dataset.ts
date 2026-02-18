import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const datasetDir = path.resolve(__dirname, '../data/dataset');

const loadJson = (filename) => {
    const filePath = path.join(datasetDir, filename);
    if (!fs.existsSync(filePath)) {
        console.error(`Error: File ${filename} not found at ${filePath}`);
        process.exit(1);
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

const verify = () => {
    console.log('Verifying dataset...');

    const campus = loadJson('campus.json');
    const layout = loadJson('hospital_layout.json');
    const departments = loadJson('departments.json');
    const floorMaps = loadJson('floor_maps.json');

    console.log('Loaded all JSON files.');

    // Verify campus buildings
    const buildingIds = new Set(campus.buildings.map(b => b.id));
    console.log(`Buildings found: ${Array.from(buildingIds).join(', ')}`);

    // Verify layout blocks
    layout.forEach(floor => {
        floor.blocks.forEach(blockId => {
            if (!buildingIds.has(blockId)) {
                console.warn(`Warning: Block ${blockId} on floor ${floor.floor} is not defined in campus map.`);
            }
        });
    });

    // Verify departments
    const deptIds = new Set();
    departments.forEach(dept => {
        if (deptIds.has(dept.id)) {
            console.error(`Error: Duplicate department ID ${dept.id}`);
        }
        deptIds.add(dept.id);

        const deptFloor = layout.find(f => f.floor === dept.floor);
        if (!deptFloor) {
            console.error(`Error: Department ${dept.id} is on invalid floor ${dept.floor}`);
        } else {
            if (!deptFloor.blocks.includes(dept.block)) {
                console.error(`Error: Department ${dept.id} is in block ${dept.block} which does not exist on floor ${dept.floor}`);
            }
        }
    });

    // Verify floor maps
    Object.keys(floorMaps.floors).forEach(floorNum => {
        const floorConfig = floorMaps.floors[floorNum];
        const layoutFloor = layout.find(f => f.floor === parseInt(floorNum));

        if (!layoutFloor) {
            console.error(`Error: Floor map defines floor ${floorNum} which is not in layout.`);
        } else {
            floorConfig.blocks.forEach(block => {
                if (!layoutFloor.blocks.includes(block.id)) {
                    console.error(`Error: Floor map for floor ${floorNum} includes block ${block.id} which is not in layout for that floor.`);
                }
            });
        }
    });

    console.log('Verification complete.');
};

verify();
