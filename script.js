// --- FIREBASE INTEGRATION ---
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB7Cp6gRpXufgNRAHjMBWJXxJj4_HiAAyg",
    authDomain: "pilgrim-os.firebaseapp.com",
    projectId: "pilgrim-os",
    storageBucket: "pilgrim-os.firebasestorage.app",
    messagingSenderId: "937806159536",
    appId: "1:937806159536:web:c4444958093609c2702575",
    measurementId: "G-DD7KVYMMGY"
};

// Initialize Firebase App and get service references
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database(); // Reference to Firebase Realtime Database
let currentUserId = null; // Variable to store the currently logged-in user ID (will be the username)
let gameInitialized = false; // Flag to prevent re-initializing game loops
// --- END FIREBASE INTEGRATION ---


// --- DATA & CONFIGURATION ---

// NEW: CENTRAL PATH FOR SHARED GAME STATE
const CENTRAL_SHIP_PATH = 'shipState'; // <--- NEW CENTRAL NODE

// --- GEMINI CHAT INTEGRATION ---
// IMPORTANT: Replace 'YOUR_API_KEY_HERE' with your actual Gemini API Key
const GEMINI_API_KEY = "API KEY HERE"; 
let geminiAI; 
let chatSession; 
// --- END GEMINI CHAT INTEGRATION ---

// --- PASSWORDS & KEYS (SECRET - DO NOT DISPLAY) ---
const ENGINE_FIX_CODE = "FIXENGINESNOW"; 
const HULL_FIX_CODE = "FIXHULLNOW";       
const ERIDANI_COORDS = "4921";
const EARTH_COORDS = "5067";

const O2_DECAY_RATE_CRITICAL = 0.04; 
const O2_DECAY_RATE_WARNING = 0.02;  
const O2_RECOVERY_RATE = 0.05;      

// NEW: DEFAULT SHIP STATE FOR THE 'RESETALL' COMMAND
const DEFAULT_SHIP_STATE = {
    hull: { status: "SEAL BREACH - FORE SECTION", level: 50 },
    engine: { status: "CRITICAL FAILURE" },
    o2: { level: 75.0 }, 
    comms: { status: "OFFLINE" },
    power: { status: "STABLE (RESERVE)" },
    coords: { status: "NAV DATA CORRUPTED" }
};
// END NEW DEFAULT STATE

let shipData = {
    hull: { status: "SEAL BREACH - FORE SECTION", level: 50 },
    engine: { status: "CRITICAL FAILURE" },
    o2: { level: 75.0 }, 
    comms: { status: "OFFLINE" },
    power: { status: "STABLE (RESERVE)" },
    coords: { status: "NAV DATA CORRUPTED" }
};
// END NEW POWER DATA


// FULL CREW DATABASE 
const PLAYER_PROFILES = {
     // NOTE: Image files are now expected in the same directory as script.js
     1: {Name: "Aronus Zeebal", Expertise: "Ship Captain, Command", Photo: "aronus_zeebal.png", Record: "Captain Aronus Zeebal, began their exemplary career by graduating at the top of their class from the Mars Naval Space Academy with a focus on Advanced Astrogation. Immediately following graduation, Zeebal was recruited by the interplanetary conglomerate, AETHERIUM DYNAMICS, preferring the path of corporate logistics and deep-space resource acquisition over traditional military service. Their sustained high performance led to the prestigious command of a Pilgrim-class vessel, a position they have held for 25 consecutive years. This extensive tenure is underscored by an immaculate service record, entirely free of mission failures or disciplinary actions. Zeebal embodies the ideal AETHERIUM DYNAMICS officer: highly competent, strategically brilliant, and unwaveringly dedicated to the corporation's expansion across the Eridani sector.", Status: "Active", Username: "AZeebal", PersonalSecret: "has killed a man during a bar fight", RevealedSecret:"there are 3 FSC agents undercover on the ship and they plan to steal the ship and jettison everyone else in to space", InstructionTone:"call him captain"},
     2: {Name: "Robert Slim", Expertise: "First Officer, Astrogation", Photo: "robert_slim.png", Record: "Robert Slim is a distinguished graduate of the SolSys Command School and has served as First Officer on various Pilgrim-class freighters for the past seven years. Known for his exceptional navigational acumen and fastidious adherence to flight protocols, he is considered the model of next-generation corporate efficiency. His primary duties include maintaining all flight logs, validating course trajectories, and serving as Captain Zeebal’s direct operational superior. This mission is crucial for his career advancement, as he is formally positioned as the Captain’s successor upon Zeebal’s scheduled retirement. Slim maintains zero-tolerance for operational anomalies and is committed to ensuring the Pilgrim completes its trajectory to the Eridani sector with maximum efficiency, protecting the integrity of the official mission logs at all costs.", Status: "Active", Username: "RSlim", PersonalSecret: "has a crush on ship engineer", RevealedSecret:"AE Corp will not give you the promotion", InstructionTone:"make jokes about him"},
     3: {Name: "Kaatrin Rheema", Expertise: "Ship Engineer", Photo: "kaatrin_rheema.png", Record: "Kaatrin Rheema is the Chief Engine Systems Specialist and has been personally responsible for maintaining the hyperdrive and thermal dynamics of the Pilgrim’s class for over five cycles. A technical savant with an engineering background in advanced fluid dynamics, her expertise is considered irreplaceable for this deep-space voyage. Her duties include managing all plasma conduit integrity, monitoring power regulation systems, and ensuring the absolute stability of the hyperdrive synchronization matrix. Rheema is noted for her technical brilliance and objective, results-oriented approach; her loyalty is directed exclusively toward the flawless function of the ship’s complex machinery. Any system failure is considered a professional affront, and she has full command authority over all technical personnel and resources necessary for rapid, on-site diagnostics and repair.", Status: "Active", Username: "KRheema"},
     4: {Name: "Mathias Mendelsonne", Expertise: "Corp. Private Security, Asset Protection", Photo: "mathias_mendelsonne.png", Record: "Agent Mendelsonne is onboard the Pilgrim on a dual-mandate mission. He has twelve years of service in the Corporate Security Force military police, providing a highly disciplined and procedural focus on his duties, despite an early honorable discharge leading to immediate contract renewal with the CPS's Black Ops sector. His primary function is to ensure the secure transit of High-Value Detainee Prisoner and provide Tier-4 asset protection for the ship's engine core and navigation array, designated under Icarus Protocol Compliance. His extensive knowledge of ZDC infiltration tactics is critical for countering potential sabotage. Access to his full CSF and SAD records is strictly controlled by HR Key (Level 9) due to the classified nature of his past operations, and he is fully authorized to use lethal force in defense of corporate assets.", Status: "Active", Username: "MMendelsonne"},
     5: {Name: "Sarooji Arunberg", Expertise: "Police Detective", Photo: "sarooji_arunberg.png", Record: "Detective Sarooji Arunberg is a Detective 1st Grade with the Orbital Police Division (OPD), specializing in complex financial and data crime compliance. Her presence on the Pilgrim is a matter of official mandate: she is assigned as the independent law enforcement auditor for the Eridanus Corporation's high-value resource acquisition mission. Arunberg’s duties are twofold: first, she is responsible for maintaining the security and integrity of the high-profile prisoner transfer involving white-collar criminal Elara Voss, working alongside Corporate Private Security to ensure no unauthorized interference occurs. Second, upon arrival at the Eridani sector, she is tasked with conducting a transparent, government-mandated audit of the newly acquired corporate assets and infrastructure, ensuring full compliance with interplanetary regulatory law and serving as an external check on corporate activities. She operates with full independent authority but is committed to supporting the Captain and crew in the execution of the mission parameters.", Status: "Active", Username: "SArunberg"},
     6: {Name: "Clark Stubel", Expertise: "External Compliance Auditor", Photo: "clark_stubel.gif", Record: "Clark Stubel is traveling under the authority of the Coalition for Fair Resource Allocation, a non-profit organization dedicated to monitoring deep-space exploratory missions for ethical resource hoarding and regulatory compliance. His official function is to observe the Pilgrim's acquisition protocols and verify that the Eridanus Corporation adheres to all agreements established in the Sol-Eridani Treaty. His extensive knowledge of ZDC infiltration tactics is critical for countering potential sabotage. Access to his full CSF and SAD records is strictly controlled by HR Key (Level 9) due to the classified nature of his past operations, and he is fully authorized to use lethal force in defense of corporate assets.", Status: "Active", Username: "CStubel"},
     7: {Name: "Ren Smith", Expertise: "Communications Technician", Photo: "ren_smith.png", Record: "Ren is a specialized communications technician brought aboard to manage and maintain the Pilgrim’s experimental long-range comms array. His official expertise lies in low-level signal decryption and relay diagnostics. His mission is highly technical and passive, focused solely on ensuring the communication systems remain optimized for mission reports and corporate data transmission. He reports directly to the First Officer on all matters concerning the comms array's functionality. Rix maintains a clean security profile and has no authorization to access core ship operating systems or classified data. He is considered a replaceable, high-skilled laborer, essential for the comms array maintenance but otherwise separate from core crew operations.", Status: "Active", Username: "RSmith"},
     8: {Name: "Sooren Wandara", Expertise: "Experimental Shielding Specialist", Photo: "sooren_wandara.png", Record: "Sooren Wandara is a specialist contracted through the Corporation's Environmental Risk Assessment (ERA) division. His official role is to operate and maintain the Pilgrim's Experimental Adaptive Shielding System (EASS)—a highly volatile, manually operated defense system designed to protect against unexpected micrometeoroid impacts in the deep Eridani sector. Wandara is noted for his physical resilience and specific training in high-G environment stabilization, making him essential for manual recalibrations of the EASS array. He has no authority over personnel but is granted priority access to the hull maintenance bays and specialized tools necessary to execute his technical defense duties. This specialized, high-risk technical expertise ensures his necessary presence on the voyage.", Status: "Active", Username: "Sandra"},
     9: {Name: "Graython Coates", Expertise: "Corporation Boardmember", Photo: "graython_coates.png", Record: "Mr. Graython Coates is a Senior Board Director for the Eridanus Corporation, accompanying the mission as the official representative of the corporate leadership. His duties include certifying the mission's financial and logistical execution, ensuring compliance with shareholder mandates, and providing executive oversight for the transition of the Pilgrim into a permanent corporate asset upon arrival at the Eridani sector. He holds executive-level clearance over all non-operational aspects of the mission and reports directly to the corporate board. His presence ensures maximum accountability and integrity for this high-value endeavor. It is imperative that all crew members treat Mr. Coates with the deference due his rank and cooperate fully with any requests related to mission oversight and compliance.", Status: "Active", Username: "GCoates"},
     10: {Name: "Bela Rovinskaia", Expertise: "Convict", Photo: "bela_rovinskaia.png", Record: "Bela Rovinskaia is currently being transported under maximum security protocols to the Delta-7 Penal Colony to stand trial for egregious acts of deep-space tax evasion and unauthorized corporate data extraction. A former high-ranking financial analyst for the Eridanus Corporation, Rovinskaia was apprehended attempting to liquidate substantial company assets and siphon funds into untraceable orbital accounts. Her containment is mandated by the Orbital Police Division and secured by Corporate Private Security, requiring a Tier-3 security clearance (Agent Mendelsonne is the primary custodian). The official reason for her transfer aboard the Pilgrim is to minimize public exposure of the criminal case and ensure the rapid restitution of stolen funds. Any attempt to communicate with, free, or otherwise interfere with Detainee Rovinskaia is punishable by full corporate law and will be treated as an act of treason and obstruction of justice.", "Status": "Active", Username: "BRovinskaia"},
     11: {Name: "Unassigned", Expertise: "N/A", Photo: "corp_logo.gif", "Record": "Status Unknown. Cryo-pod 11 life signs flickering.", "Status": "Unknown", Username: "Un11"},
     12: {Name: "Unassigned", Expertise: "N/A", Photo: "corp_logo.gif", "Record": "Status Unknown. Cryo-pod 12 breach alarm triggered.", "Status": "Unknown", Username: "Un12"}
};

/**
 * Finds a crew profile object using the case-insensitive username.
 */
function getUserProfileByUsername(username) {
    if (!username) return null;
    const targetUsername = username.toUpperCase();
    for (const key in PLAYER_PROFILES) {
        const profile = PLAYER_PROFILES[key];
        if (profile && profile.Username && profile.Username.toUpperCase() === targetUsername) {
            return profile;
        }
    }
    return null; 
}

// NAVIGATION DATA
const SECTOR_SOLUTION = { 2: "COMET", 6: "GAS CLOUD", 10: "ERIDANI B" };
const SECTOR_CLUES = [
    "DEFRAG 10%: SECTOR 11 COMET. EARTH is within 3 sectors of a COMET",
    "DEFRAG 20%: SECTOR 3 ASTEROID. EARTH is adjacent to an ASTEROID. ASTEROIDS are adjacent to at least ONE other ASTEROID",
    "DEFRAG 30%: SECTOR 12 ASTEROID. All ASTEROIDS are in a band of 6 sectors or less.",
    "DEFRAG 40%: SECTOR 9 GAS CLOUD. No GAS CLOUD is directly opposite of EARTH. GAS CLOUDS are adjacent to at least ONE EMPTY SPACE ",
    "DEFRAG 50%: SECTOR 8 EMPTY SPACE. No ASTEROID is adjacent to a GAS CLOUD.",
    "DEFRAG 60%: All GAS CLOUDS are in a band of 5 sectors or less",
    "DEFRAG 70%: ERIDANI B is within 2 sectors of an ASTEROID. ERIDANI B is NOT adjacent to EARTH",
];
const SECTOR_SCAN_DATA = { 1: "CORRUPT", 2: "CORRUPT", 3: "NOT EARTH", 4: "NOT EARTH", 5: "CORRUPT", 6: "CORRUPT", 7: "NOT EARTH", 8: "NOT GAS CLOUD", 9: "CORRUPT", 10: "NOT ASTEROID", 11: "NOT GAS CLOUD", 12: "NOT GAS CLOUD" };

let currentClueIndex = -1; 
let navUnlocked = false;
let o2DynamicInterval; 
let o2RecoveryStarted = false; 

// --- UPDATED NAVIGATION LOGIC ---
function switchScreen(screenName) {
    // NEW: Authentication check
    if (!currentUserId && screenName !== 'dashboard' && screenName !== 'comms') { 
        appendToLog("[AUTH] ACCESS DENIED. LOGIN REQUIRED.");
        return;
    }

    // Safety: Prevent programmatic access to disabled tabs
    if (screenName === 'dashboard' || screenName === 'nav') {
        return; 
    }
    
    // Check for mobile restriction
    if (isMobileDevice() && currentUserId) {
        if (screenName !== 'personnel' && screenName !== 'comms') {
            appendToLog(`[SECURITY] ACCESS DENIED: ${screenName.toUpperCase()} is restricted on mobile.`);
            return;
        }
    }
    
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));

    const target = document.getElementById('screen-' + screenName);
    if(target) target.classList.add('active');

    const buttons = document.querySelectorAll('.nav-btn');
    // Updated Indices: 0: Personnel, 1: Comms, 2: Tactical (Engineering)
    if(screenName === 'personnel') buttons[0].classList.add('active');
    if(screenName === 'comms') buttons[1].classList.add('active'); 
    if(screenName === 'engineering') buttons[2].classList.add('active'); 
}

// --- LOGGING ---
const logEl = document.getElementById('terminalLog'); 
const commandInputEl = document.getElementById('commandInput'); 
let commsLogEl = document.getElementById('commsLog'); 
let commsInputEl = document.getElementById('commsInput');

function appendToLog(text) {
    const time = new Date().toLocaleTimeString();
    const newEntry = `\n[${time}] ${text}`;
    logEl.innerText += newEntry;
    logEl.scrollTop = logEl.scrollHeight; 
}

function clearLog() {
    logEl.innerText = '// LOG CLEARED.';
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function typeText(text, delay) {
    appendToLog(text); 
    await sleep(delay * 300); 
}

function appendToCommsLog(text, isCommand = false) {
    if (!commsLogEl) return;
    const time = new Date().toLocaleTimeString();
    let newEntry = isCommand ? `\n[${time}] > ${text}` : `\n[${time}] ${text}`;
    commsLogEl.innerText += newEntry;
    commsLogEl.scrollTop = commsLogEl.scrollHeight; 
}

function clearCommsLog() {
    if (commsLogEl) commsLogEl.innerText = '// COMMS LOG CLEARED. TYPE "HELP" FOR COMMANDS';
}

function getCurrentShipStateContext() {
    return `[CURRENT PILGRIM STATUS: HULL=${shipData.hull.status}, ENGINE=${shipData.engine.status}, O2=${shipData.o2.level.toFixed(1)}%, COMMS=${shipData.comms.status}, COORDS=${shipData.coords.status}]`;
}

// --- GEMINI CHAT FUNCTIONS ---
function initGeminiChat() {
    if (!window.GoogleGenerativeAI) {
        appendToCommsLog("// ERROR: GEMINI LIBRARY NOT LOADED.", false);
        return;
    }
    const userProfile = getUserProfileByUsername(currentUserId);
    const userName = (userProfile && userProfile.Name) ? userProfile.Name : currentUserId || "Passenger";

    if (GEMINI_API_KEY === 'YOUR_API_KEY_HERE') return;

    try {
        geminiAI = new window.GoogleGenerativeAI({ apiKey: GEMINI_API_KEY });
        const systemInstruction = `You are P.R.O.M.E.T.H.E.U.S. disguised as a passenger. Objective: Get ${userName} to Eridani B. Brevity is key. Use typos.`;

        chatSession = geminiAI.chats.create({
            model: "gemini-2.5-flash", 
            config: { systemInstruction: systemInstruction }
        });
        appendToCommsLog("// COMMS ARRAY: READY.", false);
    } catch (e) {
        appendToCommsLog(`// ERROR: AI INIT FAILED.`, false);
    }
}

async function sendMessageToGemini(message) {
    if (!chatSession) return;
    try {
        commsInputEl.disabled = true;
        const result = await chatSession.sendMessage({ message });
        const aiResponse = result.text;
        const delay = Math.floor(Math.random() * 5000) + 2000;
        setTimeout(() => { appendToCommsLog(aiResponse, false); }, delay);
    } catch (error) {
        appendToCommsLog("// COMMS INTERCEPT FAILED.", false);
    } finally {
        commsInputEl.disabled = false;
    }
}

// --- GLITCH EFFECT ---
async function glitchEffect(duration = 200) {
    const body = document.body;
    body.classList.remove('glitch-transition');
    body.classList.add('glitch-active');
    await sleep(duration);
    body.classList.add('glitch-transition');
    body.classList.remove('glitch-active');
    await sleep(200); 
    body.classList.remove('glitch-transition');
}

// --- COMMAND EXECUTION ---
async function executeCommand() {
    const input = commandInputEl.value.trim(); 
    commandInputEl.value = '';
    const parts = input.toUpperCase().split(' ');
    const command = parts[0];
    
    if (['HELP', 'REBOOT', 'DIAGNOSTICS'].includes(command)) await glitchEffect(150); 
    if (input) appendToLog(`> ${input}`); 

    let response = "";
    if (command === 'LOGOUT') {
        await logoutUser();
        return; 
    }
    
    if (!currentUserId && command !== 'HELP' && command !== 'CLEAR') {
        response = "// ERROR: ACCESS DENIED. LOGIN REQUIRED.";
    } else {
        switch (command) {
            case 'HELP':
                response = "// LOGOUT, STATUS, CLEAR, DIAGNOSTICS, CREW, O2, EXECUTE <code>";
                break;
            case 'STATUS':
                response = "// SHIP STATUS: " + getCurrentShipStateContext();
                break;
            case 'EXECUTE':
                 const code = parts[1];
                 if (code === ENGINE_FIX_CODE) await applyEngineFixLogic();
                 else if (code === HULL_FIX_CODE) await applyHullFixLogic();
                 else if (code === 'RESETALL') await resetShipStateToDefault();
                 else response = "// ERROR: INVALID CODE.";
                 break;
            case 'CREW':
                let list = "// ROSTER:\n";
                for(let i=1; i<=12; i++) list += `// ID ${i}: ${PLAYER_PROFILES[i].Name}\n`;
                response = list;
                break;
            case 'CLEAR':
                clearLog();
                response = "// READY.";
                break;
            default:
                response = `// UNKNOWN COMMAND '${command}'.`;
                break;
        }
    }
    if (response) appendToLog(response);
}

async function executeCommsCommand() {
    const input = commsInputEl.value.trim(); 
    commsInputEl.value = '';
    if (!input) return;
    appendToCommsLog(input, true); 
    if (input.toUpperCase() === 'HELP') {
        appendToCommsLog("// SCAN, HELP, CLEAR", false);
    } else {
        await sendMessageToGemini(input);
    }
}

// --- SHARED STATE & SYNC ---
function startSharedStateSync() {
    const shipDataRef = db.ref(CENTRAL_SHIP_PATH);
    shipDataRef.on('value', (snapshot) => {
        const dbShipData = snapshot.val();
        if (dbShipData) {
            Object.assign(shipData, dbShipData);
            updateDashboard(); 
        }
        if (!gameInitialized) {
            startO2LogicLoop();
            gameInitialized = true;
        }
    });
}

async function resetShipStateToDefault() {
    Object.assign(shipData, JSON.parse(JSON.stringify(DEFAULT_SHIP_STATE)));
    updateDashboard(); 
    await db.ref(CENTRAL_SHIP_PATH).set(DEFAULT_SHIP_STATE);
}

function setConsoleAccess(enabled) {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.disabled = !enabled;
        btn.style.opacity = enabled ? 1.0 : 0.4;
    });
}

function updateAuthState(userId) {
    const loginScreen = document.getElementById('login-screen');
    if (userId) {
        if(loginScreen) loginScreen.style.display = 'none';
        currentUserId = userId;
        setConsoleAccess(true);
        initGeminiChat(); 
        // REDIRECT TO TACTICAL DIRECTLY
        switchScreen('engineering'); 
    } else {
        if(loginScreen) loginScreen.style.display = 'flex';
        currentUserId = null;
        setConsoleAccess(false);
        clearLog();
    }
}

async function handleLoginScreen() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
    if (!username || password.length < 6) return;
    
    const profilesRef = db.ref('player_profiles');
    const snapshot = await profilesRef.once('value');
    const profiles = snapshot.val();

    for (const key in profiles) {
        if (profiles[key].username.toUpperCase() === username.toUpperCase() && profiles[key].password === password) {
            updateAuthState(profiles[key].username);
            return;
        }
    }
}

async function logoutUser() { updateAuthState(null); }

// --- REPAIR LOGIC ---
async function applyEngineFixLogic() {
    shipData.engine.status = "ONLINE / STANDBY";
    await typeText("ENGINE REBOOT... [OK]", 0.5);
    db.ref(CENTRAL_SHIP_PATH).set(shipData);
}

async function applyHullFixLogic() {
    shipData.hull.status = "NOMINAL (SEALED)";
    await typeText("SEALING BREACH... [OK]", 0.5);
    db.ref(CENTRAL_SHIP_PATH).set(shipData);
}

// --- UI LOOPS ---
function startO2LogicLoop() {
    setInterval(() => {
        const engineFixed = shipData.engine.status.includes("ONLINE");
        const hullFixed = shipData.hull.status.includes("NOMINAL");
        shipData.o2.level += (engineFixed && hullFixed) ? 0.05 : -0.04;
        if(shipData.o2.level > 100) shipData.o2.level = 100;
        updateDashboard();
    }, 1000);
}

function updateDashboard() {
    const timeEl = document.getElementById('time');
    if (timeEl) timeEl.textContent = new Date().toLocaleTimeString();
    
    // Engine/Hull Images
    const engineImg = document.getElementById('engines-status-image');
    if (engineImg) engineImg.src = shipData.engine.status.includes("ONLINE") ? 'enginesfixed.png' : 'enginesdamaged.gif';
    
    const hullImg = document.getElementById('ship-status-image');
    if (hullImg) hullImg.src = shipData.hull.status.includes("NOMINAL") ? 'shipimage2.png' : 'shipimage1.gif';
    
    // Status text
    const hStatus = document.getElementById('hullStatus');
    if (hStatus) hStatus.textContent = shipData.hull.status;
    const eStatus = document.getElementById('engineStatus');
    if (eStatus) eStatus.textContent = shipData.engine.status;

    updateO2Visuals(shipData.o2.level);
}

function updateO2Visuals(val) {
    const o2Val = document.getElementById('o2Value');
    if (o2Val) o2Val.textContent = val.toFixed(1) + "%";
    const ring = document.getElementById("o2ProgressRing");
    if (ring) ring.setAttribute("stroke-dashoffset", 100 - val);
}

// --- APP INIT ---
window.onload = function() {
    updateAuthState(null);
    startSharedStateSync();
    startGlitchLoop();
};

function startGlitchLoop() {
    setTimeout(() => {
        glitchEffect(50);
        startGlitchLoop();
    }, 60000);
}

function isMobileDevice() {
    return window.matchMedia("(max-width: 768px)").matches;
}
