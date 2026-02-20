/* ============================================================
   MediNav — app.js  (Mobile-enhanced)
   Features:
   - 50-patient dataset support
   - Bottom tab bar navigation for mobile
   - Patient search by ID or name
   - Voice greeting (spoken aloud on load)
   - Voice search input via SpeechRecognition
   - QR location selection
   - Dijkstra route on Canvas with animated dot
   - Step-by-step spoken navigation
   - Condition-colored badges
   ============================================================ */

const API = 'http://localhost:3001/api';

// ── STATE ──
const state = {
    selectedPatient: null,
    selectedQR: null,
    navigationResult: null,
    currentFloor: -1,
    voiceEnabled: true,
    isListening: false,
    isSpeaking: false,
    graphData: null,
    speechSynth: window.speechSynthesis,
    currentStep: 0,
    recognition: null,
    animFrame: null,
    // Movement Control state
    navMode: 'auto', // 'auto', 'manual', 'live'
    currentPathIndex: 0,
    watchId: null,
    recordedData: [],
    isInitialized: false,
};

// ── QR LOCATIONS ──
const QR_LOCATIONS = [
    { code: 'entrance', label: '🚪 Main Entrance / நுழைவாயில்' },
    { code: 'lobby', label: '🏥 Reception Lobby / வரவேற்பு கூடம்' },
    { code: 'floor1', label: '📶 Floor 1 / தளம் 1' },
    { code: 'floor2', label: '📶 Floor 2 / தளம் 2' },
    { code: 'floor3', label: '📶 Floor 3 / தளம் 3' },
    { code: 'floor4', label: '📶 Floor 4 / தளம் 4' },
    { code: 'floor5', label: '📶 Floor 5 / தளம் 5' },
];

// ── DOM HELPERS ──
const $ = id => document.getElementById(id);
const isMobile = () => window.innerWidth <= 767;

// ── DOM ELEMENTS ──
const loadingScreen = $('loadingScreen');
const app = $('app');
const searchInput = $('searchInput');
const searchBtn = $('searchBtn');
const searchResults = $('searchResults');
const qrSection = $('qrSection');
const qrGrid = $('qrGrid');
const selectedLocEl = $('selectedLocation');
const navigateBtn = $('navigateBtn');
const patientCard = $('patientCard');
const voiceControls = $('voiceControls');
const directionsPanel = $('directionsPanel');
const directionsList = $('directionsList');
const navStats = $('navStats');
const navPlaceholder = $('navPlaceholder');
const voiceToggle = $('voiceToggle');
const voiceWave = $('voiceWave');
const voiceStatus = $('voiceStatus');
const repeatBtn = $('repeatBtn');
const stopVoiceBtn = $('stopVoiceBtn');
const speakGreetingBtn = $('speakGreeting');
const voiceSearchBtn = $('voiceSearchBtn');
const mapCanvas = $('mapCanvas');
const floorSelector = $('floorSelector');
const mobileTabBar = $('mobileTabBar');
const headerTime = $('headerTime');
const ctx = mapCanvas.getContext('2d');

// Movement Controls
const movementControls = $('movementControls');
const modeBtns = document.querySelectorAll('.mode-btn');
const manualBtns = $('manualBtns');
const liveStatus = $('liveStatus');
const prevStepBtn = $('prevStepBtn');
const nextStepBtn = $('nextStepBtn');
const stepProgress = $('stepProgress');
const collectDataBtn = $('collectDataBtn');

// ── INIT ──
window.addEventListener('load', async () => {
    setTimeout(async () => {
        loadingScreen.classList.add('hidden');
        // Show role selection after loading
        const roleSelection = $('roleSelection');
        if (roleSelection) {
            roleSelection.classList.remove('hidden');
        } else {
            app.classList.remove('hidden');
            await initApp();
        }
    }, 2200);
});

async function selectRole(role) {
    console.log('Selected role:', role);
    state.role = role;
    const roleSelection = $('roleSelection');
    const searchLabel = $('searchLabel');
    const searchInput = $('searchInput');

    if (roleSelection) roleSelection.classList.add('hidden');
    app.classList.remove('hidden');

    // Role-specific Search Customization
    if (role === 'doctor') {
        if (searchLabel) searchLabel.innerText = 'Patient Search (Medical View) / நோயாளி தேடல்';
        if (searchInput) searchInput.placeholder = 'e.g. Selvi or P001';
    } else if (role === 'patient') {
        if (searchLabel) searchLabel.innerText = 'Search by Disease / நோயின் மூலம் தேடல்';
        if (searchInput) searchInput.placeholder = 'e.g. Fever or Headache';
    } else {
        if (searchLabel) searchLabel.innerText = 'Search Labs, Patients or ID / ஆய்வகங்கள், நோயாளிகள் அல்லது ஐடி';
        if (searchInput) searchInput.placeholder = 'e.g. Pathology, Blood Bank or Meena';
    }

    await initApp();
    showToast(`Welcome ${role.charAt(0).toUpperCase() + role.slice(1)}!`, 'success');
}

async function goBackToRoles() {
    const roleSelection = document.getElementById('roleSelection');
    const app = document.getElementById('app');
    if (app) app.classList.add('hidden');
    if (roleSelection) {
        roleSelection.classList.remove('hidden');
    }
    showToast('Returned to Role Selection', 'info');
}

async function initApp() {
    // One-time initialization
    if (!state.isInitialized) {
        state.isInitialized = true;
        updateClock();
        setInterval(updateClock, 1000);
        bindEvents();
        initMobileTabs();
    }

    // Re-runnable initialization (when role changes)
    buildQRGrid();
    buildFloorSelector();
    await loadGraphData();
    drawEmptyMap();

    // Speak welcome greeting after short delay
    setTimeout(() => {
        let greeting = 'Welcome to MediNav, the Hospital Smart Navigation System.';
        if (state.role === 'doctor') {
            greeting += ' Hello Doctor, please search for your patient by name or ID.';
        } else if (state.role === 'patient') {
            greeting += ' Hello, please search for the location by entering your disease or symptoms.';
        } else {
            greeting += ' Hello visitor, please enter the patient name or ID to find them.';
        }
        speakText(greeting);
    }, 700);
}

// ── CLOCK ──
function updateClock() {
    const now = new Date();
    headerTime.textContent = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ── GRAPH DATA ──
async function loadGraphData() {
    try {
        const res = await fetch(`${API}/navigation/graph`);
        const json = await res.json();
        if (json.success) state.graphData = json.data;
    } catch (e) { console.warn('Graph load failed:', e); }
}

// ── MOBILE TABS ──
function initMobileTabs() {
    if (!mobileTabBar) return;

    // On mobile, only show the first tab (search) by default
    if (isMobile()) activateTab('tabSearch');

    mobileTabBar.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target;
            activateTab(target);
            // Update button active state
            mobileTabBar.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Also handle resize
    window.addEventListener('resize', () => {
        if (!isMobile()) {
            // Desktop: show all panels
            document.querySelectorAll('.panel').forEach(p => {
                p.classList.remove('tab-active');
                p.style.display = '';
            });
        }
    });
}

function activateTab(tabId) {
    if (!isMobile()) return;
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('tab-active'));
    const target = $(tabId);
    if (target) target.classList.add('tab-active');
}

// After navigation starts, switch to map on mobile
function mobileGoToMap() {
    if (!isMobile()) return;
    activateTab('tabMap');
    mobileTabBar?.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.target === 'tabMap');
    });
}
function mobileGoToGuide() {
    if (!isMobile()) return;
    activateTab('tabGuide');
    mobileTabBar?.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.target === 'tabGuide');
    });
}

// ── QR GRID ──
function buildQRGrid() {
    qrGrid.innerHTML = '';
    QR_LOCATIONS.forEach(loc => {
        const chip = document.createElement('button');
        chip.className = 'qr-chip';
        chip.textContent = loc.label;
        chip.dataset.code = loc.code;
        chip.addEventListener('click', () => selectQR(loc, chip));
        qrGrid.appendChild(chip);
    });
}

function selectQR(loc, chip) {
    document.querySelectorAll('.qr-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    state.selectedQR = loc.code;
    selectedLocEl.textContent = `✅ Current location: ${loc.label}`;
    selectedLocEl.classList.add('visible');
    if (state.selectedPatient) navigateBtn.style.display = 'flex';
    showToast(`📍 Location set: ${loc.label}`, 'info');
}

// ── FLOOR SELECTOR ──
function buildFloorSelector() {
    floorSelector.innerHTML = '';
    const floors = [
        { label: 'All / அனைத்தும்', val: -1 },
        { label: 'G / தரை', val: 0 },
        { label: '1 / 1', val: 1 },
        { label: '2 / 2', val: 2 },
        { label: '3 / 3', val: 3 },
        { label: '4 / 4', val: 4 },
        { label: '5 / 5', val: 5 },
    ];
    floors.forEach((f, i) => {
        const btn = document.createElement('button');
        btn.className = 'floor-btn' + (i === 0 ? ' active' : '');
        btn.textContent = `F${f.label}`;
        btn.addEventListener('click', () => {
            document.querySelectorAll('.floor-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.currentFloor = f.val;
            redrawMap();
        });
        floorSelector.appendChild(btn);
    });
}

// ── EVENTS ──
function bindEvents() {
    searchBtn.addEventListener('click', doSearch);
    searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
    navigateBtn.addEventListener('click', doNavigate);
    voiceToggle.addEventListener('change', () => { state.voiceEnabled = voiceToggle.checked; });
    repeatBtn.addEventListener('click', repeatNavigation);
    stopVoiceBtn.addEventListener('click', stopSpeech);
    speakGreetingBtn.addEventListener('click', () => {
        speakText('Welcome to MediNav, the Hospital Smart Navigation System. We have 50 patients registered. Please enter a disease, patient ID or patient name to begin.');
    });
    voiceSearchBtn.addEventListener('click', startVoiceSearch);

    // Movement Mode Events
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => setNavMode(btn.dataset.mode));
    });
    prevStepBtn.addEventListener('click', () => movePathStep(-1));
    nextStepBtn.addEventListener('click', () => movePathStep(1));
    collectDataBtn.addEventListener('click', saveCollectionData);
}

// ── SEARCH ──
async function doSearch() {
    const query = searchInput.value.trim();
    if (!query) {
        const msg = state.role === 'others' ? 'Please enter a disease, patient or laboratory' : 'Please enter a disease, patient ID or name';
        showToast(msg, 'error');
        return;
    }

    const searchHint = state.role === 'others' ? 'Searching patients and laboratories...' : 'Searching among 50 patients...';
    searchResults.innerHTML = `<div class="empty-hint"><span class="empty-icon">⏳</span><p>${searchHint}</p></div>`;

    try {
        const res = await fetch(`${API}/patients/search?q=${encodeURIComponent(query)}&role=${state.role}`);
        const json = await res.json();

        if (!json.success || json.count === 0) {
            const hint = state.role === 'others' ? 'Try P007, Meena, Pathology or Blood Bank.' : 'Try P007, Meena or Fever.';
            searchResults.innerHTML = `<div class="empty-hint"><span class="empty-icon">🔍</span><p>No results found for "<strong>${query}</strong>"<br>${hint}</p></div>`;
            speakText(`No results found for ${query}. Please check the search term and try again.`);
            return;
        }

        renderResults(json.data);
        speakText(`Found ${json.count} result${json.count > 1 ? 's' : ''} matching ${query}. Please tap a result to select.`);
    } catch (e) {
        searchResults.innerHTML = `<div class="empty-hint"><span class="empty-icon">⚠️</span><p>Server error. Make sure the server is running.</p></div>`;
    }
}

function renderResults(results) {
    searchResults.innerHTML = '';
    results.forEach(item => {
        const card = document.createElement('div');
        card.className = 'result-card';

        const isPatient = item.type === 'patient';
        let metaHtml = '';
        let extraHtml = '';
        let avatar = isPatient ? item.name.charAt(0) : '🔬';

        if (isPatient) {
            if (state.role === 'patient') {
                metaHtml = `<div class="result-meta">👨‍⚕️ Doctor Location: ${item.department} · ${item.doctorName} / ${item.doctorNameTamil}</div>`;
            } else {
                metaHtml = `<div class="result-meta">🏥 Patient Address: ${item.ward} / ${item.wardTamil} · ${item.room}</div>`;
            }
            extraHtml = `<div class="result-meta" style="color:var(--accent-cyan); font-weight:600;">Disease: ${item.disease || 'N/A'} / ${item.diseaseTamil || ''}</div>`;
        } else {
            metaHtml = `<div class="result-meta">🏥 ${item.ward} / ${item.wardTamil}</div>`;
            extraHtml = `<div class="result-meta" style="color:var(--accent-cyan); font-weight:600;">Facility: ${item.name} / ${item.nameTamil}</div>`;
        }

        card.innerHTML = `
      <div class="result-avatar">${avatar}</div>
      <div class="result-info">
        <div class="result-name">${item.name} / ${item.nameTamil || item.name}</div>
        ${metaHtml}
        ${extraHtml}
      </div>
      <div class="result-badges">
        <span class="result-badge">${item.id}</span>
        <span class="floor-badge">Floor ${item.floor} / தளம் ${item.floor}</span>
      </div>
    `;
        card.addEventListener('click', () => selectResult(item, card));
        searchResults.appendChild(card);
    });
}

function selectResult(item, cardEl) {
    document.querySelectorAll('.result-card').forEach(c => c.classList.remove('selected'));
    cardEl.classList.add('selected');
    state.selectedResult = item;
    state.selectedPatient = item.type === 'patient' ? item : null;

    qrSection.style.display = 'block';
    if (state.selectedQR) navigateBtn.style.display = 'flex';

    let greeting = '';
    let greetingTamil = '';

    if (item.type === 'patient') {
        if (state.role === 'patient') {
            greeting = `Hello! You are searching for ${item.disease}. Your doctor is ${item.doctorName}, located in the ${item.department} department on Floor ${item.floor}. Please scan the QR code at your current location to begin navigation to the doctor.`;
            greetingTamil = `வணக்கம்! நீங்கள் ${item.diseaseTamil || item.disease} சிகிச்சையைத் தேடுகிறீர்கள். உங்கள் மருத்துவர் ${item.doctorNameTamil}, ${item.floor} தளத்தில் உள்ள ${item.department} பிரிவில் உள்ளார். மருத்துவரிடம் செல்ல உங்கள் இருப்பிடத்தில் உள்ள QR குறியீட்டை ஸ்கேன் செய்யவும்.`;
        } else {
            greeting = `Hello! Patient ${item.name} has been found. ${item.name} is in ${item.ward}, Room ${item.room}, on Floor ${item.floor}. Their doctor is ${item.doctorName}. Please scan the QR code at your current location to begin navigation to the patient.`;
            greetingTamil = `வணக்கம்! நோயாளி ${item.nameTamil || item.name} கண்டறியப்பட்டார். ${item.nameTamil || item.name} அவர்கள் ${item.floor} தளத்தில், ${item.wardTamil}, அறை ${item.room}-ல் உள்ளார். வழிசெலுத்தலைத் தொடங்க உங்கள் இருப்பிடத்தில் உள்ள QR குறியீட்டை ஸ்கேன் செய்யவும்.`;
        }
    } else {
        greeting = `Facility found: ${item.name} on Floor ${item.floor}. Please scan the QR code to navigate to this hospital facility.`;
        greetingTamil = `வசதி கண்டறியப்பட்டது: ${item.nameTamil} (${item.floor} தளம்). இந்த வசதிக்குச் செல்ல உங்கள் இருப்பிடத்தில் உள்ள QR குறியீட்டை ஸ்கேன் செய்யவும்.`;
    }

    speakText(greeting + " " + greetingTamil);
    showToast(`✅ Selected: ${item.name} / ${item.nameTamil || item.name}`, 'success');
}

// ── NAVIGATE ──
async function doNavigate() {
    if (!state.selectedResult || !state.selectedQR) {
        const msg = state.role === 'others' ? 'Please select a result and your location' : 'Please select a patient and your location';
        showToast(msg, 'error');
        return;
    }

    navigateBtn.textContent = '⏳ Calculating route...';
    navigateBtn.disabled = true;

    try {
        let json;
        if (state.selectedResult.type === 'patient') {
            const res = await fetch(`${API}/navigation/navigate-to-patient`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patientId: state.selectedPatient.id,
                    qrCode: state.selectedQR,
                    role: state.role
                }),
            });
            json = await res.json();
        } else {
            // Facility navigation
            const res = await fetch(`${API}/navigation/path`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    startNode: state.selectedQR, // From QR locations
                    endNode: state.selectedResult.id
                }),
            });
            json = await res.json();
        }

        navigateBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg> Start Navigation`;
        navigateBtn.disabled = false;

        if (!json.success) {
            showToast(json.message, 'error');
            speakText(`Navigation error: ${json.message}`);
            return;
        }

        state.navigationResult = json;
        state.currentPathIndex = 0;
        state.recordedData = [];
        displayNavigation(json);

        // Reset movement mode to auto
        setNavMode('auto');
        movementControls.style.display = 'block';

        // On mobile: first show map, then guide after a moment
        mobileGoToMap();
        setTimeout(() => { if (isMobile()) mobileGoToGuide(); }, 1800);
        showToast('🧭 Navigation started! Follow the route on the map.', 'success');

    } catch (e) {
        showToast('Navigation failed: ' + e.message, 'error');
        navigateBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg> Start Navigation`;
        navigateBtn.disabled = false;
    }
}

function displayNavigation(json) {
    const { patient, totalDistance, path, voiceSteps, greeting } = json;

    // Patient card
    $('patientName').textContent = `${patient.name} / ${patient.nameTamil || patient.name}`;
    $('patientId').textContent = patient.id;
    $('patientWard').textContent = `${patient.ward} / ${patient.wardTamil || patient.ward}`;
    $('patientRoom').textContent = patient.room;
    $('patientFloor').textContent = `Floor ${patient.floor} / தளம் ${patient.floor}`;
    $('patientBed').textContent = patient.bed;
    $('patientDoctor').textContent = `${patient.doctor} / ${patient.doctorNameTamil || patient.doctor}`;
    $('patientAvatar').textContent = patient.name.charAt(0);

    // Condition badge
    const badge = $('conditionBadge');
    if (badge) {
        badge.textContent = `${patient.condition} / ${patient.conditionTamil || patient.condition}`;
        badge.className = `condition-badge ${patient.condition}`;
    }

    patientCard.style.display = 'block';

    // Stats
    $('statDistance').textContent = totalDistance;
    $('statSteps').textContent = path.length;
    $('statETA').textContent = `~${Math.ceil(totalDistance * 0.5)}m`;
    navStats.style.display = 'flex';

    // Voice + directions
    voiceControls.style.display = 'block';
    directionsPanel.style.display = 'block';
    $('stepCount').textContent = `${voiceSteps.length} steps`;
    renderDirections(voiceSteps);
    navPlaceholder.style.display = 'none';

    // Draw map
    drawNavigationMap(path);

    // Speak
    speakNavigationSequence(greeting, voiceSteps);
}

function renderDirections(steps) {
    directionsList.innerHTML = '';
    steps.forEach((step, i) => {
        const el = document.createElement('div');
        el.className = 'step-item' + (i === 0 ? ' active' : '');
        el.id = `step-${i}`;
        el.innerHTML = `
      <div class="step-number">${i + 1}</div>
      <div class="step-text">${step}</div>
    `;
        directionsList.appendChild(el);
    });
    state.currentStep = 0;
}

// ── MAP ──
function drawEmptyMap() {
    const W = mapCanvas.width, H = mapCanvas.height;
    ctx.clearRect(0, 0, W, H);
    drawGrid(W, H);
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.font = '700 52px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('FLOOR MAP', W / 2, H / 2 - 18);
    ctx.font = '400 15px Inter';
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillText('Search a patient to begin navigation', W / 2, H / 2 + 30);
}

function drawGrid(W, H) {
    ctx.strokeStyle = 'rgba(255,255,255,0.025)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 28) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 28) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
}

function drawNavigationMap(path) {
    if (!state.graphData) { drawEmptyMap(); return; }

    const W = mapCanvas.width, H = mapCanvas.height;
    const { nodes, edges } = state.graphData;

    ctx.clearRect(0, 0, W, H);
    drawGrid(W, H);

    const nodeMap = {};
    nodes.forEach(n => { nodeMap[n.id] = n; });

    const pathNodeIds = new Set(path.map(p => p.nodeId));
    const pathEdges = new Set();
    for (let i = 0; i < path.length - 1; i++) {
        pathEdges.add(`${path[i].nodeId}|${path[i + 1].nodeId}`);
        pathEdges.add(`${path[i + 1].nodeId}|${path[i].nodeId}`);
    }

    const sx = n => (n.x / 100) * W;
    const sy = n => (n.y / 100) * H;

    // Draw edges
    edges.forEach(edge => {
        const from = nodeMap[edge.from], to = nodeMap[edge.to];
        if (!from || !to) return;
        const isRoute = pathEdges.has(`${edge.from}|${edge.to}`);
        ctx.shadowBlur = isRoute ? 16 : 0;
        ctx.shadowColor = '#00d4ff';
        if (isRoute) {
            const grd = ctx.createLinearGradient(sx(from), sy(from), sx(to), sy(to));
            grd.addColorStop(0, 'rgba(0,212,255,0.95)');
            grd.addColorStop(1, 'rgba(123,47,247,0.95)');
            ctx.strokeStyle = grd; ctx.lineWidth = 4;
        } else {
            ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 1.5;
        }
        ctx.beginPath();
        ctx.moveTo(sx(from), sy(from));
        ctx.lineTo(sx(to), sy(to));
        ctx.stroke();
        ctx.shadowBlur = 0;
    });

    const first = path[0], last = path[path.length - 1];

    // Draw nodes
    nodes.forEach(node => {
        const isStart = first?.nodeId === node.id;
        const isEnd = last?.nodeId === node.id;
        const onPath = pathNodeIds.has(node.id);
        const x = sx(node), y = sy(node);

        if (isStart) {
            ctx.shadowColor = '#00e5a0'; ctx.shadowBlur = 22;
            ctx.fillStyle = '#00e5a0';
            ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#fff'; ctx.font = 'bold 9px Inter'; ctx.textAlign = 'center';
            ctx.fillText('YOU', x, y - 14);
        } else if (isEnd) {
            ctx.shadowColor = '#ff8c42'; ctx.shadowBlur = 22;
            ctx.fillStyle = '#ff8c42';
            ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#fff'; ctx.font = 'bold 9px Inter'; ctx.textAlign = 'center';
            ctx.fillText('DEST', x, y - 15);
        } else if (onPath) {
            ctx.shadowColor = '#00d4ff'; ctx.shadowBlur = 10;
            ctx.fillStyle = '#00d4ff';
            ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
        } else {
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
        }

        if (onPath || isStart || isEnd) {
            ctx.fillStyle = isStart ? '#00e5a0' : isEnd ? '#ff8c42' : 'rgba(255,255,255,0.65)';
            ctx.font = '500 8px Inter'; ctx.textAlign = 'center';
            const lbl = node.label.length > 13 ? node.label.slice(0, 13) + '…' : node.label;
            ctx.fillText(lbl, x, y + 16);
        }
    });

    // Animate dot
    if (state.animFrame) cancelAnimationFrame(state.animFrame);
    animateDot(path, nodeMap, sx, sy);
}

function animateDot(path, nodeMap, sx, sy) {
    if (path.length < 2) return;

    let autoT = 0;
    const speed = 0.003;

    const draw = () => {
        let dx, dy;

        if (state.navMode === 'auto') {
            autoT = (autoT + speed) % 1;
            const seg = Math.floor(autoT * (path.length - 1));
            const segT = (autoT * (path.length - 1)) - seg;
            const fn = nodeMap[path[seg]?.nodeId];
            const tn = nodeMap[path[Math.min(seg + 1, path.length - 1)]?.nodeId];
            if (fn && tn) {
                dx = sx(fn) + (sx(tn) - sx(fn)) * segT;
                dy = sy(fn) + (sy(tn) - sy(fn)) * segT;
            }
        } else {
            // Manual or Live: Dot stays at currentPathIndex
            const node = nodeMap[path[state.currentPathIndex]?.nodeId];
            if (node) {
                dx = sx(node);
                dy = sy(node);
            }
        }

        if (dx !== undefined && dy !== undefined) {
            ctx.save();
            ctx.shadowColor = '#ffffff'; ctx.shadowBlur = 12;
            ctx.fillStyle = 'white';
            ctx.beginPath(); ctx.arc(dx, dy, 7, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#00d4ff'; ctx.lineWidth = 2; ctx.stroke();
            ctx.restore();
        }

        state.animFrame = requestAnimationFrame(draw);
    };
    state.animFrame = requestAnimationFrame(draw);
}

// ── MOVEMENT LOGIC ──
function setNavMode(mode) {
    state.navMode = mode;
    modeBtns.forEach(b => b.classList.toggle('active', b.dataset.mode === mode));

    manualBtns.style.display = mode === 'manual' ? 'flex' : 'none';
    liveStatus.style.display = mode === 'live' ? 'flex' : 'none';

    if (mode === 'live') {
        startLiveTracking();
    } else {
        stopLiveTracking();
    }

    if (mode === 'manual') {
        updateManualUI();
    }

    showToast(`Mode switched to: ${mode.toUpperCase()}`, 'info');
}

function updateManualUI() {
    if (!state.navigationResult) return;
    const path = state.navigationResult.navigation.path;
    stepProgress.textContent = `Node ${state.currentPathIndex + 1} / ${path.length}`;
}

function movePathStep(dir) {
    if (!state.navigationResult) return;
    const path = state.navigationResult.navigation.path;
    const newIdx = Math.max(0, Math.min(path.length - 1, state.currentPathIndex + dir));

    if (newIdx !== state.currentPathIndex) {
        state.currentPathIndex = newIdx;
        updateManualUI();
        onNodeReached(newIdx);
    }
}

function onNodeReached(index) {
    if (!state.navigationResult) return;
    const path = state.navigationResult.navigation.path;
    const voiceSteps = state.navigationResult.navigation.voiceSteps;

    // Record data if in collection mode
    state.recordedData.push({
        nodeId: path[index].nodeId,
        timestamp: new Date().toISOString(),
        floor: path[index].floor
    });

    const node = state.graphData.nodes.find(n => n.id === path[index].nodeId);
    if (node) {
        const msg = `Reached ${node.label}. ${index === path.length - 1 ? 'You have arrived.' : ''}`;
        const msgTamil = `${node.labelTamil} வந்தடைந்தது. ${index === path.length - 1 ? 'நீங்கள் வந்துவிட்டீர்கள்.' : ''}`;
        speakText(msg + " " + msgTamil);

        // Highlight matching step in list
        document.querySelectorAll('.step-item').forEach((el, i) => {
            el.classList.toggle('active', i === index);
            if (i < index) el.classList.add('done');
        });
    }

    if (navigator.vibrate) navigator.vibrate(50);
}

function startLiveTracking() {
    if (state.watchId) return;
    if (!navigator.geolocation) {
        showToast('GPS not supported', 'error');
        setNavMode('manual');
        return;
    }

    state.watchId = navigator.geolocation.watchPosition(
        pos => {
            if (!state.navigationResult) return;
            const { latitude, longitude } = pos.coords;
            // Since we don't have real GPS mapping in hospital_graph.json,
            // we will simulate the mapping for demonstration OR
            // the user can click on the map.
            // But for a REAL app, we'd find the closest node.
            console.log('GPS Update:', latitude, longitude);
            // findClosestPathNode(latitude, longitude);
        },
        err => {
            console.warn('GPS Error:', err);
            showToast('GPS access denied or unavailable', 'error');
        },
        { enableHighAccuracy: true }
    );
}

function stopLiveTracking() {
    if (state.watchId) {
        navigator.geolocation.clearWatch(state.watchId);
        state.watchId = null;
    }
}

function saveCollectionData() {
    if (state.recordedData.length === 0) {
        showToast('No data collected yet', 'error');
        return;
    }

    const dataStr = JSON.stringify(state.recordedData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nav_collection_${new Date().getTime()}.json`;
    a.click();

    showToast(`✅ Collected ${state.recordedData.length} data points!`, 'success');
}

function redrawMap() {
    if (state.navigationResult) drawNavigationMap(state.navigationResult.navigation.path);
    else drawEmptyMap();
}

// ── VOICE ──
function speakText(text) {
    if (!state.voiceEnabled || !state.speechSynth) return;
    stopSpeech();

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-IN';
    utter.rate = 0.9;
    utter.pitch = 1.0;
    utter.volume = 1.0;

    const voices = state.speechSynth.getVoices();
    const voice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('India') || v.name.includes('Google') || v.name.includes('Female')))
        || voices.find(v => v.lang.startsWith('en'));
    if (voice) utter.voice = voice;

    utter.onstart = () => { state.isSpeaking = true; setWave(true); setVoiceStatus('Speaking...', true); };
    utter.onend = () => { state.isSpeaking = false; setWave(false); setVoiceStatus('Ready', false); };
    utter.onerror = () => { state.isSpeaking = false; setWave(false); setVoiceStatus('Ready', false); };

    state.currentUtterance = utter;
    state.speechSynth.speak(utter);
}

function speakNavigationSequence(greeting, steps) {
    // 1. Speak greeting
    speakText(greeting);

    // If not auto, we stop here and let the user move manually
    if (state.navMode !== 'auto') return;

    // 2. Then speak steps sequentially (ONLY for Auto mode)
    let idx = 0;
    const next = () => {
        if (!state.voiceEnabled || idx >= steps.length || state.navMode !== 'auto') return;

        // Highlight step
        document.querySelectorAll('.step-item').forEach((el, i) => {
            el.classList.remove('active');
            if (i < idx) el.classList.add('done');
        });
        const stepEl = $(`step-${idx}`);
        if (stepEl) { stepEl.classList.add('active'); stepEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }

        const utter = new SpeechSynthesisUtterance(steps[idx]);
        utter.lang = 'en-IN'; utter.rate = 0.9;

        const voices = state.speechSynth.getVoices();
        const voice = voices.find(v => v.lang.startsWith('en') && v.name.includes('India'))
            || voices.find(v => v.lang.startsWith('en'));
        if (voice) utter.voice = voice;

        utter.onstart = () => { setWave(true); setVoiceStatus(`Step ${idx + 1} of ${steps.length}`, true); };
        utter.onend = () => {
            idx++;
            if (idx < steps.length) setTimeout(next, 550);
            else {
                setWave(false); setVoiceStatus('Navigation complete!', false);
                setTimeout(() => speakText('You have reached your destination. Thank you for using MediNav.'), 400);
            }
        };

        state.currentUtterance = utter;
        setTimeout(() => state.speechSynth.speak(utter), idx === 0 ? 3200 : 0);
        idx++;
    };
    setTimeout(next, 3200);
}

function repeatNavigation() {
    if (!state.navigationResult) return;
    const { greeting, navigation } = state.navigationResult;
    speakNavigationSequence(greeting, navigation.voiceSteps);
}

function stopSpeech() {
    if (state.speechSynth?.speaking) state.speechSynth.cancel();
    setWave(false); setVoiceStatus('Stopped', false);
    state.isSpeaking = false;
}

function setWave(on) {
    if (on) voiceWave?.classList.add('speaking');
    else voiceWave?.classList.remove('speaking');
}
function setVoiceStatus(msg, active) {
    if (!voiceStatus) return;
    voiceStatus.textContent = msg;
    if (active) voiceStatus.classList.add('speaking');
    else voiceStatus.classList.remove('speaking');
}

// ── VOICE SEARCH INPUT ──
function startVoiceSearch() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { showToast('Voice input not supported in this browser', 'error'); return; }

    if (state.isListening) {
        state.recognition?.stop();
        voiceSearchBtn?.classList.remove('active');
        state.isListening = false;
        return;
    }

    const rec = new SR();
    rec.lang = 'en-IN'; rec.continuous = false; rec.interimResults = false;

    rec.onstart = () => {
        state.isListening = true;
        voiceSearchBtn?.classList.add('active');
        setVoiceStatus('🎤 Listening... / கவனித்தல்...', true);
        speakText('Please say the patient ID or patient name. நோயாளியின் பெயர் அல்லது ஐடி-யைச் சொல்லவும்.');
    };
    rec.onresult = e => {
        const transcript = e.results[0][0].transcript;
        if (searchInput) searchInput.value = transcript;
        setVoiceStatus(`Heard: "${transcript}"`, false);
        state.isListening = false;
        voiceSearchBtn?.classList.remove('active');
        setTimeout(() => doSearch(), 500);
    };
    rec.onerror = e => {
        showToast('Voice error: ' + e.error, 'error');
        state.isListening = false;
        voiceSearchBtn?.classList.remove('active');
    };
    rec.onend = () => {
        state.isListening = false;
        voiceSearchBtn?.classList.remove('active');
    };

    state.recognition = rec;
    rec.start();
}

// ── TOAST ──
function showToast(message, type = 'info') {
    let toast = document.querySelector('.toast');
    if (!toast) { toast = document.createElement('div'); toast.className = 'toast'; document.body.appendChild(toast); }
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Pre-load voices
window.speechSynthesis?.addEventListener('voiceschanged', () => { });

/* ================================================================
   LIVE CAMERA OCR LOGIC
   ================================================================ */
async function openElderlyMode() {
    const cameraModal = $("cameraModal");
    const cameraVideo = $("cameraVideo");

    console.log("Starting Live Camera Scanner...");
    state.role = "others"; // Use others for general scanning
    cameraModal.classList.remove("hidden");

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" }
        });
        cameraVideo.srcObject = stream;
        speakText("Live camera scanner activated. Please align the prescription or ward number within the frame. நேரடி கேமரா ஸ்கேனர் இயக்கப்பட்டது. மருந்துச்சீட்டு அல்லது வார்டு எண்ணை சட்டத்திற்குள் சீரமைக்கவும்.");
    } catch (err) {
        console.error("Camera error:", err);
        showToast("Camera access denied. Please check permissions.", "error");
        cameraModal.classList.add("hidden");
    }
}

// Bind camera events after window load
window.addEventListener('DOMContentLoaded', () => {
    const cameraModal = $("cameraModal");
    const cameraVideo = $("cameraVideo");
    const cameraCanvas = $("cameraCanvas");
    const captureBtn = $("captureBtn");
    const closeCameraBtn = $("closeCameraBtn");
    const ocrStatus = $("ocrStatus");

    if (!closeCameraBtn) return;

    closeCameraBtn.addEventListener("click", () => {
        const stream = cameraVideo.srcObject;
        if (stream) stream.getTracks().forEach(track => track.stop());
        cameraVideo.srcObject = null;
        cameraModal.classList.add("hidden");
    });

    captureBtn.addEventListener("click", async () => {
        captureBtn.disabled = true;
        captureBtn.innerHTML = "⏳ Scanning... / ஸ்கேன் செய்யப்படுகிறது...";
        ocrStatus.textContent = "Processing image / படம் செயலாக்கப்படுகிறது...";

        const width = cameraVideo.videoWidth;
        const height = cameraVideo.videoHeight;
        cameraCanvas.width = width;
        cameraCanvas.height = height;
        const cctx = cameraCanvas.getContext("2d");
        cctx.drawImage(cameraVideo, 0, 0, width, height);

        try {
            const result = await Tesseract.recognize(cameraCanvas, "eng", {
                logger: m => {
                    if (m.status === "recognizing text") {
                        ocrStatus.textContent = `Reading: ${Math.round(m.progress * 100)}% / வாசிக்கப்படுகிறது...`;
                    }
                }
            });

            const text = result.data.text.trim();
            console.log("OCR Match:", text);

            if (text.length < 2) throw new Error("Could not read text clearly. Try better lighting.");

            ocrStatus.textContent = `Found: "${text.slice(0, 15)}..."`;
            processLiveText(text);

        } catch (err) {
            showToast(err.message, "error");
            ocrStatus.textContent = "Ready / தயார்";
        } finally {
            captureBtn.disabled = false;
            captureBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg> Scan Now / இப்போது ஸ்கேன் செய்`;
        }
    });
});

async function processLiveText(text) {
    const cleaned = text.replace(/[^a-zA-Z0-9\s]/g, " ").trim();
    const idMatch = cleaned.match(/P\d{3,4}/i);
    const query = idMatch ? idMatch[0] : cleaned.split(/\s+/)[0];

    showToast(`Searching for: ${query}`, "info");

    // Hide UI
    $("roleSelection").classList.add("hidden");
    $("app").classList.remove("hidden");

    const searchInput = $("searchInput");
    if (searchInput) searchInput.value = query;

    // Stop camera
    const cameraVideo = $("cameraVideo");
    const stream = cameraVideo.srcObject;
    if (stream) stream.getTracks().forEach(track => track.stop());
    cameraVideo.srcObject = null;
    $("cameraModal").classList.add("hidden");

    await doSearch();
}


