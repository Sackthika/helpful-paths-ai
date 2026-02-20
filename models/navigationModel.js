// Navigation Model — reads hospital graph and runs Dijkstra
import { readJSON } from '../utils/fileHelper.js';
import { dijkstra } from '../utils/dijkstra.js';

export const getHospitalGraph = async () => {
    return await readJSON('hospital_graph.json');
};

export const findPath = async (startNodeId, endNodeId) => {
    const graph = await readJSON('hospital_graph.json');
    return dijkstra(graph, startNodeId, endNodeId);
};

export const getRoomNode = async (roomCode) => {
    const graph = await readJSON('hospital_graph.json');
    return graph.roomToNode[roomCode] || null;
};

export const getQRLocation = async (qrCode) => {
    const graph = await readJSON('hospital_graph.json');
    return graph.qrLocations[qrCode] || null;
};

export const getAllNodes = async () => {
    const graph = await readJSON('hospital_graph.json');
    return graph.nodes;
};
