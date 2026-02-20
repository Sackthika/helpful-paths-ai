// Navigation Controller
import {
    getHospitalGraph,
    findPath,
    getRoomNode,
    getQRLocation,
    getAllNodes
} from '../models/navigationModel.js';
import { getPatientById } from '../models/patientModel.js';

// GET /api/navigation/graph — full hospital graph
export const fetchGraph = async (req, res) => {
    try {
        const graph = await getHospitalGraph();
        res.json({ success: true, data: graph });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/navigation/nodes — all nodes
export const fetchNodes = async (req, res) => {
    try {
        const nodes = await getAllNodes();
        res.json({ success: true, data: nodes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/navigation/path — compute shortest path
// Body: { startNode, endNode }
export const computePath = async (req, res) => {
    try {
        let { startNode, endNode } = req.body;
        if (!startNode || !endNode) {
            return res.status(400).json({ success: false, message: 'startNode and endNode are required.' });
        }

        // Resolve QR codes if passed instead of direct node IDs
        const qrStart = await getQRLocation(startNode);
        if (qrStart) startNode = qrStart.nodeId;

        const qrEnd = await getQRLocation(endNode);
        if (qrEnd) endNode = qrEnd.nodeId;

        const result = await findPath(startNode, endNode);

        if (result.error) {
            return res.status(404).json({ success: false, message: result.error });
        }

        res.json({
            success: true,
            startNode,
            endNode,
            totalDistance: result.totalDistance,
            totalSteps: result.totalSteps,
            path: result.path,
            voiceSteps: result.voiceSteps,
            destination: { label: 'Facility' }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/navigation/navigate-to-patient — full navigation for a patient
// Body: { patientId, qrCode (current location) }
export const navigateToPatient = async (req, res) => {
    try {
        const { patientId, qrCode } = req.body;

        if (!patientId || !qrCode) {
            return res.status(400).json({ success: false, message: 'patientId and qrCode are required.' });
        }

        // Get patient details
        const patient = await getPatientById(patientId);
        if (!patient) {
            return res.status(404).json({ success: false, message: `Patient '${patientId}' not found.` });
        }

        // Get starting node from QR scan
        const qrLocation = await getQRLocation(qrCode);
        if (!qrLocation) {
            return res.status(400).json({ success: false, message: `Invalid QR code '${qrCode}'.` });
        }

        // Determine destination based on role
        let destinationNodeId = null;
        let destinationLabel = "";
        let destinationLabelTamil = "";

        if (req.body.role === 'patient') {
            // Navigator to Doctor/Department
            const nodes = await getAllNodes();
            const deptNode = nodes.find(n =>
                n.id.toLowerCase().includes(patient.department.toLowerCase()) ||
                n.label.toLowerCase().includes(patient.department.toLowerCase())
            );
            if (deptNode) {
                destinationNodeId = deptNode.id;
                destinationLabel = `${patient.doctorName} (Department: ${patient.department})`;
                destinationLabelTamil = `${patient.doctorNameTamil} (${patient.department} பிரிவு)`;
            }
        }

        // Fallback to room if role is not patient or department node not found
        if (!destinationNodeId) {
            destinationNodeId = await getRoomNode(patient.room);
            destinationLabel = `Room ${patient.room} — ${patient.ward}`;
            destinationLabelTamil = `அறை ${patient.room} — ${patient.wardTamil}`;
        }

        if (!destinationNodeId) {
            return res.status(400).json({ success: false, message: `Destination for room '${patient.room}' not found.` });
        }

        // Compute path
        const result = await findPath(qrLocation.nodeId, destinationNodeId);

        if (result.error) {
            console.error(`Navigation Error: ${result.error}`);
            return res.status(404).json({ success: false, message: result.error });
        }

        // Build friendly greeting
        const greeting = `Welcome! You are looking for patient ${patient.name}, 
      who is admitted in ${patient.ward}, Room ${patient.room}, on Floor ${patient.floor}. 
      Your current location is ${qrLocation.label}. 
      Please follow the highlighted path on the map. Navigation has started.`;

        res.json({
            success: true,
            patient: {
                id: patient.id,
                name: patient.name,
                nameTamil: patient.nameTamil,
                ward: patient.ward,
                wardTamil: patient.wardTamil,
                room: patient.room,
                floor: patient.floor,
                bed: patient.bed,
                doctor: patient.doctorName,
                doctorNameTamil: patient.doctorNameTamil,
                condition: patient.condition,
                conditionTamil: patient.conditionTamil
            },
            currentLocation: qrLocation,
            destination: {
                nodeId: destinationNodeId,
                label: destinationLabel,
                labelTamil: destinationLabelTamil
            },
            totalDistance: result.totalDistance,
            totalSteps: result.totalSteps,
            path: result.path,
            voiceSteps: result.voiceSteps,
            greeting
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/navigation/qr/:code — get location info from QR scan
export const scanQR = async (req, res) => {
    try {
        const { code } = req.params;
        const location = await getQRLocation(code);
        if (!location) {
            return res.status(404).json({ success: false, message: `QR code '${code}' not recognized.` });
        }
        res.json({ success: true, data: location });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
