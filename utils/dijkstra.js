// =========================================
// Dijkstra's Algorithm Implementation
// Finds shortest path in hospital graph
// =========================================

export const dijkstra = (graph, startNode, endNode) => {
    const nodes = graph.nodes;
    const edges = graph.edges;

    // Build adjacency list
    const adjacency = {};
    nodes.forEach(node => {
        adjacency[node.id] = [];
    });

    edges.forEach(edge => {
        adjacency[edge.from].push({ node: edge.to, weight: edge.weight });
        adjacency[edge.to].push({ node: edge.from, weight: edge.weight }); // bidirectional
    });

    // Distance map
    const distances = {};
    const previous = {};
    const visited = new Set();

    nodes.forEach(node => {
        distances[node.id] = Infinity;
        previous[node.id] = null;
    });

    distances[startNode] = 0;

    // Priority Queue (simple min-heap simulation)
    const unvisited = new Set(nodes.map(n => n.id));

    while (unvisited.size > 0) {
        // Get node with minimum distance
        let current = null;
        let minDist = Infinity;

        unvisited.forEach(nodeId => {
            if (distances[nodeId] < minDist) {
                minDist = distances[nodeId];
                current = nodeId;
            }
        });

        if (current === null || current === endNode) break;

        unvisited.delete(current);
        visited.add(current);

        // Update distances for neighbors
        const neighbors = adjacency[current] || [];
        neighbors.forEach(({ node: neighbor, weight }) => {
            if (!visited.has(neighbor)) {
                const newDist = distances[current] + weight;
                if (newDist < distances[neighbor]) {
                    distances[neighbor] = newDist;
                    previous[neighbor] = current;
                }
            }
        });
    }

    // Reconstruct path
    const path = [];
    let current = endNode;

    if (distances[endNode] === Infinity) {
        return { path: [], totalDistance: Infinity, error: 'No path found' };
    }

    while (current !== null) {
        path.unshift(current);
        current = previous[current];
    }

    // Annotate path with node labels and directions
    const nodeMap = {};
    nodes.forEach(n => { nodeMap[n.id] = n; });

    const annotatedPath = path.map((nodeId, index) => {
        const node = nodeMap[nodeId];
        return {
            nodeId,
            label: node?.label || nodeId,
            x: node?.x,
            y: node?.y,
            floor: node?.floor,
            step: index + 1
        };
    });

    // Generate voice instructions
    const voiceSteps = generateVoiceInstructions(annotatedPath);

    return {
        path: annotatedPath,
        totalDistance: distances[endNode],
        totalSteps: path.length,
        voiceSteps
    };
};

// Generate human-readable voice navigation steps
const generateVoiceInstructions = (annotatedPath) => {
    const steps = [];

    for (let i = 0; i < annotatedPath.length; i++) {
        const current = annotatedPath[i];
        const next = annotatedPath[i + 1];

        if (i === 0) {
            steps.push(`Starting navigation from ${current.label}.`);
        }

        if (next) {
            if (next.floor !== undefined && current.floor !== undefined && next.floor !== current.floor) {
                const direction = next.floor > current.floor ? 'up' : 'down';
                steps.push(`Take the elevator or stairs ${direction} to Floor ${next.floor}.`);
            } else if (next.label.toLowerCase().includes('corridor')) {
                steps.push(`Continue through the ${next.label}.`);
            } else if (next.label.toLowerCase().includes('ward')) {
                steps.push(`Proceed to the ${next.label}.`);
            } else if (next.label.toLowerCase().includes('room') || next.label.toLowerCase().includes('icu')) {
                steps.push(`Your destination is ${next.label}. You have arrived!`);
            } else {
                steps.push(`Head towards ${next.label}.`);
            }
        }

        if (i === annotatedPath.length - 1) {
            steps.push(`You have reached your destination: ${current.label}.`);
        }
    }

    return steps;
};
