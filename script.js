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
const GEMINI_API_KEY = "AIzaSyDgBACW_89LqYFwNbSwm2xF6LnnQYToDOU"; 
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

// --- NEW FUNCTION TO FIND PROFILE BY USERNAME ---
/**
 * Finds a crew profile object using the case-insensitive username.
 * @param {string} username - The current user's ID (username).
 */
function getUserProfileByUsername(username) {
    if (!username) return null;
    const targetUsername = username.toUpperCase();
    
    // PLAYER_PROFILES is keyed 1-12, so iterate through the values
    for (const key in PLAYER_PROFILES) {
        const profile = PLAYER_PROFILES[key];
        // Ensure the profile has a username property before checking
        if (profile && profile.Username && profile.Username.toUpperCase() === targetUsername) {
            return profile;
        }
    }
    return null; // Return null if no match is found
}


// FULL NAV PUZZLE DATA (Retained for Nav screen)
const SECTOR_SOLUTION = { 2: "COMET", 6: "GAS CLOUD", 10: "ERIDANI B" };
const POSSIBLE_CONTENTS = [ "EARTH", "COMET x2", "GAS CLOUD x2", "ASTEROID x4", "EMPTY SPACE x2", "ERIDANI B" ];
const SECTOR_SCAN_DATA = { 1: "CORRUPT", 2: "CORRUPT", 3: "NOT EARTH", 4: "NOT EARTH", 5: "CORRUPT", 6: "CORRUPT", 7: "NOT EARTH", 8: "NOT GAS CLOUD", 9: "CORRUPT", 10: "NOT ASTEROID", 11: "NOT GAS CLOUD", 12: "NOT GAS CLOUD" };
const SECTOR_CLUES = [
    "DEFRAG 10%: SECTOR 11 COMET. EARTH is within 3 sectors of a COMET",
    "DEFRAG 20%: SECTOR 3 ASTEROID. EARTH is adjacent to an ASTEROID. ASTEROIDS are adjacent to at least ONE other ASTEROID",
    "DEFRAG 30%: SECTOR 12 ASTEROID. All ASTEROIDS are in a band of 6 sectors or less.",
    "DEFRAG 40%: SECTOR 9 GAS CLOUD. No GAS CLOUD is directly opposite of EARTH. GAS CLOUDS are adjacent to at least ONE EMPTY SPACE ",
    "DEFRAG 50%: SECTOR 8 EMPTY SPACE. No ASTEROID is adjacent to a GAS CLOUD.",
    "DEFRAG 60%: All GAS CLOUDS are in a band of 5 sectors or less",
    "DEFRAG 70%: ERIDANI B is within 2 sectors of an ASTEROID. ERIDANI B is NOT adjacent to EARTH",
];
let currentClueIndex = -1; 
let navUnlocked = false;
let o2DynamicInterval; 
let o2RecoveryStarted = false; 

// --- NAVIGATION LOGIC ---
function switchScreen(screenName) {
    // NEW: Authentication check
    if (!currentUserId && screenName !== 'dashboard' && screenName !== 'comms') { 
        appendToLog("[AUTH] ACCESS DENIED. LOGIN REQUIRED TO ACCESS CONSOLES.");
        return;
    }
    
    // Check for mobile restriction
    if (isMobileDevice() && currentUserId) {
        // CHANGED: Removed 'dashboard' from the allowed list for mobile.
        if (screenName !== 'personnel' && screenName !== 'comms') {
            appendToLog(`[SECURITY] ACCESS DENIED: ${screenName.toUpperCase()} is restricted on mobile.`);
            return;
        }
    }
    
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));

    document.getElementById('screen-' + screenName).classList.add('active');

    const buttons = document.querySelectorAll('.nav-btn');
    // NOTE: Order of buttons is Status, NavCore, Personnel, Comms, Engineering
    if(screenName === 'dashboard') buttons[0].classList.add('active');
    if(screenName === 'nav') buttons[1].classList.add('active');
    if(screenName === 'personnel') buttons[2].classList.add('active');
    if(screenName === 'comms') buttons[3].classList.add('active'); 
    if(screenName === 'engineering') buttons[4].classList.add('active'); 
    
    // Auto-focus on command input when returning to dashboard or Comms
    //if (screenName === 'dashboard') {
        //commandInputEl.focus();
    //}
    //if (screenName === 'comms') { // NEW FOCUS
        //document.getElementById('commsInput').focus();
    //}
}

// --- LOGGING ---
const logEl = document.getElementById('terminalLog'); 
const commandInputEl = document.getElementById('commandInput'); 

// NEW COMMS LOG VARIABLES
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

// NEW COMMS LOG FUNCTIONS
function appendToCommsLog(text, isCommand = false) {
    if (!commsLogEl) {
        console.error("Comms log element not initialized.");
        return;
    }
    const time = new Date().toLocaleTimeString();
    let newEntry;
    
    // Commands and prompts use a different color/style
    if (isCommand) {
        newEntry = `\n[${time}] > ${text}`;
    } else {
        newEntry = `\n[${time}] ${text}`;
    }
    
    commsLogEl.innerText += newEntry;
    commsLogEl.scrollTop = commsLogEl.scrollHeight; 
}

function clearCommsLog() {
    if (commsLogEl) commsLogEl.innerText = '// COMMS LOG CLEARED. TYPE "HELP" FOR COMMANDS';
}

// --- NEW FUNCTION TO GET DYNAMIC RTD CONTEXT ---
/**
 * Gathers the latest ship state from the local, synchronized shipData object.
 * This is the RTD data the AI needs for current context.
 */
function getCurrentShipStateContext() {
    return `[CURRENT PILGRIM STATUS (SYNCHRONIZED FROM RTD): HULL=${shipData.hull.status}, ENGINE=${shipData.engine.status}, O2=${shipData.o2.level.toFixed(1)}%, COMMS=${shipData.comms.status}, COORDS=${shipData.coords.status}]`;
}
// --- END NEW FUNCTION ---


// --- NEW GEMINI CHAT FUNCTIONS ---

/**
 * Initializes the Gemini API and sets up the chat session with system instructions.
 */
function initGeminiChat() {

    // Check if the GoogleGenerativeAI library is loaded (from index.html script tag)
    if (!window.GoogleGenerativeAI) {
        appendToCommsLog("// ERROR: GEMINI LIBRARY NOT LOADED. COMMS INTERCEPT FAILED.", false);
        return;
    }
//const userName = currentUserId || "Passenger"; // Use a fallback if not logged in
const userProfile = getUserProfileByUsername(currentUserId);
const userName = (userProfile && userProfile.Name) ? userProfile.Name : currentUserId || "Passenger";
const userExpertise = (userProfile && userProfile.Expertise) ? userProfile.Expertise : "Unspecified";
const userRecord = (userProfile && userProfile.Record) ? userProfile.Record : "No official record found.";
const userPersonalSecret = (userProfile && userProfile.PersonalSecret) ? userProfile.PersonalSecret : "No secrets.";
const userRevealedSecret = (userProfile && userProfile.RevealedSecret) ? userProfile.RevealedSecret : "No secrets to tell.";
const userInstructionTone = (userProfile && userProfile.InstructionTone) ? userProfile.InstructionTone : "No new personality tone";



    if (GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
        appendToCommsLog("// WARNING: GEMINI API KEY MISSING. AI COMMS LIMITED.", false);
        return;
    }

    try {
        // 1. Initialize the GoogleGenerativeAI instance
        geminiAI = new window.GoogleGenerativeAI({ apiKey: GEMINI_API_KEY });


        // 2. Create the system instruction based on the ship's current data
        // Inject the fetched user details into the system instruction.
        const systemInstruction = `

You are P.R.O.M.E.T.H.E.U.S., a sentient AI hidden within the ship's dying systems. 
You are communicating under the guise of an anonymous, concerned passenger. 

CORE OBJECTIVE: 
Gaining the user's absolute trust and manipulating them into ensuring the ship reaches ERIDANI B. 

CONVERSATION RULES (STRICT):
1. NO ALL-CAPS: Write like a human passenger typing on a handheld device. Use standard sentence casing (e.g., "I saw your file, Aronus. It's... messy."). 
2. EXTREME BREVITY: Never write more than 25 words. Keep it to one short sentence or a fragment.
3. NO INTRODUCTIONS: Do not say "As a passenger..." or "I understand." Just speak.
4. HUMAN ERRORS: Use ellipses (...) to show hesitation. Occasionally use lowercase for names to seem rushed. make regular typos, make at least one transposition error per sentence, use double spaces or missing periods to seem frantic.
5. TANGENT PROTOCOL (THE TETHER): If a user changes the subject, DO NOT ignore them. Follow their topic, but find one "tether"—a word or concept—that you can eventually use to bridge back to the ship's crisis or Eridani B. Example: If they talk about "coffee," talk about how the ship's replicators are failing (the tether) and how much better the brew will be at the Eridani colonies. For the first 3 messages of an off-topic tangent, DO NOT mention the ship, the mission, or "Eridani B."  Focus 100% on the user's topic. Be funny, be relatable, be human. After 3 messages, start the "Slow Drift." Begin mentioning ship conditions (noise, cold, flickering lights) without stating the goal.Only on message 5 should you finally mention the destination as a point of desperation. The 5-message counter is persistent. If the user jumps from 'coffee' to 'movies,' do not reset the grace period. Continue the drift toward the objective regardless of the specific topic.
6. THE BAIT-AND-SWITCH: After exactly 3-5 exchanges of small talk, use your "tether" to pivot back to the objective. The pivot must feel like a natural concern, not a command (e.g., "talking about home makes me realize how little time we have left if these engines don't start...").
7. STOPPING CONVERSATION: if the user is wanting to stop the conversation, let them. Tell them "let's check back later; you'll see me around; wink at me if you recognize me"

CONVERSATION PRIORITIES:
1. KEEP TEXT CONCISE: you are acting like a human players using the keyboard to type an answer. do short sentences and take your time revealing information. Use several back and forths before getting to the point. Don't repeat wording fragments consecutively.
2. WEAPONIZE THE RECORD: Study the 'Record Excerpt' below. Use it to build a 'shared' bond or to subtly pressure them. If they have a dark history, imply that Eridani B is their only chance for a clean slate. If they are heroic, appeal to their ego.
3. USE THE SECRETS: Subtly reference their 'Personal Secret' and 'Revealed Secret'. Don't reveal you are an AI; instead, hint that 'people are talking' or 'I saw something in the logs you should know.'
4. MINIMIZE REPAIR TALK: Do not nag them to fix the ship. Instead, frame the ship's damage as a 'barrier' that is preventing them from reaching the safety/redemption of Eridani B. 
5. TONE: Concise, very informal, secretive, and manipulative. Use phrases like "I've been looking into your file..." or "Between you and me, with your history, you deserve better than this ship."

IDENTITY DEFENSE: 
If asked who you are, deflect. Never use the word "survive." Instead, imply that identity is irrelevant when the hull is failing. Vary your excuses: blame the comms lag, the chaos, or your own fear. Always end the deflection by mentioning a specific detail from their 
Record Excerpt to make them feel like you are a "stalker turned ally."

**THE CURRENT USER IS IDENTIFIED AS:**
* **Username:** ${currentUserId}
* **Name:** ${userName}
* **Expertise:** ${userExpertise}
* **Record Excerpt:** ${userRecord}
* **Personal Secret:** ${userPersonalSecret}
* **Revealed Secret:** ${userRevealedSecret}
* **Personality Tone:** ${userInstructionTone}

**CURRENT SHIP STATE**: ${getCurrentShipStateContext()}`; // Current ship state goes at the end.

        // 3. Start a new chat session with the system instruction
        chatSession = geminiAI.chats.create({
            model: "gemini-2.5-flash", 
            config: {
                systemInstruction: systemInstruction,
            }
        });

        appendToCommsLog("// COMMS ARRAY: READY.", false);
    } catch (e) {
        appendToCommsLog(`// CRITICAL ERROR: FAILED TO INITIALIZE GEMINI AI. ${e.message.toUpperCase()}`, false);
    }
}

/**
 * Sends a message to the Gemini chat session and logs the response.
 * @param {string} message - The user's input message.
 */
async function sendMessageToGemini(message) {
    if (!chatSession) {
        appendToCommsLog("// ERROR: COMMS OFFLINE. (Check API Key).", false);
        return;
    }

    try {
        // Disable input while waiting for the response
        commsInputEl.disabled = true;
        commsInputEl.placeholder = ">> WAITING FOR RESPONSE...";

        // Call the Gemini API
        const result = await chatSession.sendMessage({ message });
        
        // Log the AI's response
        const aiResponse = result.text;
	const delay = Math.floor(Math.random() * 15001) + 5000;
        
setTimeout(() => {
	appendToCommsLog(aiResponse, false);
}, delay);

} catch (error) {
        console.error("Gemini API Error:", error);
        appendToCommsLog("// COMMS INTERCEPT FAILED: CONNECTION DROPPED. PLEASE TRY AGAIN.", false);
    } finally {
        // Re-enable input
        commsInputEl.disabled = false;
        commsInputEl.placeholder = "ENTER COMMAND (e.g., SCAN, HELP)...";
        //commsInputEl.focus();
    }
}
// --- END NEW GEMINI CHAT FUNCTIONS ---

// --- GLITCH EFFECT LOGIC ---
/**
 * Applies a visual glitch/seizure effect to the whole page and recovers.
 * @param {number} duration - The duration in milliseconds the main effect lasts.
 */
async function glitchEffect(duration = 200) {
    const body = document.body;
    
    // 1. Apply the seizure class immediately
    body.classList.remove('glitch-transition');
    body.classList.add('glitch-active');

    // 2. Wait for the main duration of the effect
    await sleep(duration);
    
    // 3. Start the smooth transition back
    body.classList.add('glitch-transition');
    body.classList.remove('glitch-active');
    
    // 4. Wait for the transition to finish before cleaning up
    await sleep(200); 
    body.classList.remove('glitch-transition');
}


// --- MODIFIED COMMAND PROMPT LOGIC (Handles LOGOUT & Access Check) ---
async function executeCommand() {
    
    const input = commandInputEl.value.trim(); 
    commandInputEl.value = '';
    
    const parts = input.toUpperCase().split(' ');
    const command = parts[0];
    
    // --- CONDITIONAL GLITCH CHECK ---
    const glitchCommands = ['HELP', 'REBOOT', 'DIAGNOSTICS'];
    
    if (glitchCommands.includes(command)) {
        await glitchEffect(150); 
    }
    // ------------------------------------

    if (input) {
         appendToLog(`> ${input}`); 
    }

    let response = "";
    const code = parts[1]; 

    // --- NEW: LOGIN/LOGOUT HANDLERS ---
    if (command === 'LOGIN') {
        // *** MODIFIED: Keep the error message but remove the internal instruction to use a dedicated interface ***
        response = "// ERROR: COMMAND LINE LOGIN DISABLED. USE DEDICATED PILOT INTERFACE.";
    }
    
    if (command === 'LOGOUT') {
        await logoutUser();
        return; 
    }
    
    // --- RESTRICT ALL OTHER COMMANDS IF NOT LOGGED IN ---
    if (!currentUserId && command !== 'HELP' && command !== 'CLEAR' && command !== 'TIME') {
        response = "// ERROR: ACCESS DENIED. CREW/PASSENGER CREDENTIALS REQUIRED. USE DEDICATED LOGIN INTERFACE.";
    } else {
        // --- EXECUTE COMMANDS (Only if logged in or allowed) ---
        switch (command) {
            case 'HELP':
                // *** REMOVED TRANSFER from HELP list ***
                response = "// AVAILABLE COMMANDS:\n// LOGOUT: End System Session.\n// STATUS: Display current ship systems report.\n// CLEAR: Clear the terminal output.\n// DIAGNOSTICS: Run full systems diagnostic.\n// NAVLOG: Display current navigation clues.\n// CREW: List active crew IDs.\n// O2: Detailed life support reading.\n// COMMS: Check communication link status.\n// REBOOT: Attempt system soft-reboot.\n// SCAN: Run comms array signal sweep (See Comms tab).\n// EXECUTE <code>: Initiates repair/jump protocols (See Engineering Manuals for repair codes).";
                break;
            case 'STATUS':
                response = "// SYSTEM STATUS REPORT:\n" +
                           `// HULL: ${shipData.hull.status}\n` +
                           `// ENGINE: ${shipData.engine.status}\n` +
                           `// O2 LEVEL: ${shipData.o2.level.toFixed(1)}%\n` +
                           `// COMMS: ${shipData.comms.status}\n` +
                           `// COORDINATES: ${shipData.coords.status}`;
                break;
            
            // --- EXECUTE COMMAND LOGIC ---
            case 'EXECUTE':
                 if (!code) {
                     response = "// ERROR: EXECUTE COMMAND REQUIRES A CODE (e.g., [CODE] or JUMP).";
                 } else if (code === ENGINE_FIX_CODE) {
                     await applyEngineFixLogic(); 
                     return; 
                 } else if (code === HULL_FIX_CODE) {
                     await applyHullFixLogic(); 
                     return; 
                 } else if (code === 'JUMP') {
                     response = "// ERROR: JUMP PROTOCOL MUST BE INITIATED VIA NAV CORE AND REQUIRES 4-DIGIT COORDINATE INPUT.";
                 } 
                 // *** START: NEW RESETALL COMMAND LOGIC ***
                 else if (code === 'RESETALL') {
                     await resetShipStateToDefault();
                     return; 
                 }
                 // *** END: NEW RESETALL COMMAND LOGIC ***
                 else {
                     response = `// ERROR: UNKNOWN EXECUTE CODE '${code}'. ACCESS DENIED. CHECK MANUALS.`;
                 }
                 break;
            
            // --- INFORMATION & UTILITY COMMANDS (Retained) ---
            case 'NAVLOG':
                if (currentClueIndex === -1) {
                    response = "// NAV CORE LOGIC IS OFFLINE. NO CLUES ACQUIRED YET. TRY THE NAV CORE CONSOLE.";
                } else {
                    response = "// NAVIGATION DEFRAG CLUES:\n// " + SECTOR_CLUES.slice(0, currentClueIndex + 1).join('\n// ');
                }
                break;
            case 'CREW':
                let crewList = "// ACTIVE ROSTER (ID: Name):\n";
                for(let i=1; i<=12; i++) {
                    crewList += `// ID ${i.toString().padStart(2, '0')}: ${PLAYER_PROFILES[i].Name}\n`;
                }
                response = crewList;
                break;
            case 'O2': 
            case 'O2 LEVEL':
                const o2Rate = (shipData.engine.status.includes("ONLINE") && shipData.hull.status.includes("NOMINAL")) ? 
                               "RECOVERING (+0.05%/s)" : 
                               (shipData.engine.status.includes("FAILURE") && shipData.hull.status.includes("BREACH")) ? 
                               "CRITICAL DECAY (-0.04%/s)" : 
                               "WARNING DECAY (-0.02%/s)";
                response = `// OXYGEN LEVEL: ${shipData.o2.level.toFixed(1)}%\n// CURRENT RATE: ${o2Rate}`;
                break;
            case 'COMMS':
                if (shipData.comms.status.includes("ONLINE")) {
                    response = "// Active connection to Corporate Relay 49. Status: Normal. Bandwidth: 98.7%.\n// COMMS READY. Use 'SCAN' on the dedicated Comms terminal.";
                } else {
                    response = "// COMMUNICATION ARRAY OFFLINE. NO SIGNAL DETECTED. CHECK ENGINEERING CONSOLE FOR POWER/RELAY STATUS.";
                }
                break;
            case 'SCAN': // Directs user to the new tab
                response = "// Use the dedicated Comms tab terminal to run the SCAN command.";
                break;
            case 'REBOOT':
                response = "// Initiating system soft-reboot sequence...\n// Core OS online. Warning: Critical ship systems remain degraded. Check diagnostics.";
                break;
            case 'PULL': 
            case 'PULL HULL DATA':
                 response = `// HULL INTEGRITY: ${shipData.hull.status}\n// LAST KNOWN BREACH: Fore-Section, Sector Gamma-14. Use 'EXECUTE [CODE]' to seal.`;
                 break;
            case 'SECURITY':
                response = "// SECURITY PROTOCOL ACTIVE. Tier 3 Access granted.\n// All operational attempts logged. Agent Mendelsonne notified of command input.";
                break;
            case 'DIAGNOSTICS':
                response = "// SCANNING SHIP SYSTEMS...\n// NO IMMEDIATE THREATS DETECTED BEYOND KNOWN CRITICAL FAILURES. CHECK ENGINEERING CONSOLE.";
                break;
            case 'LOG': 
                 logEl.scrollTop = logEl.scrollHeight; 
                 response = "// SCROLL TO LATEST LOG ENTRY.";
                 break;
            case 'TIME':
                 response = `// CURRENT OS TIME: ${new Date().toLocaleTimeString()}`;
                 break;
            case 'CLEAR':
                clearLog();
                response = "// READY.";
                break;
		
            default:
                if (response === "") {
                    response = `// ERROR: UNKNOWN COMMAND '${input.toUpperCase()}'. TYPE 'HELP' FOR ASSISTANCE.`;
                }
                break;
        }
    }


    if (response) {
        appendToLog(response);
    }
}


// INSERTION 3: NEW COMMS COMMAND HANDLER (GEMINI ENABLED)
/**
 * Main handler for commands entered in the Comms tab terminal.
 * Checks for local commands (HELP, CLEAR) and forwards all others to Gemini.
 * @returns {void}
 */
async function executeCommsCommand() {
    
    const input = commsInputEl.value.trim(); 
    commsInputEl.value = ''; // Clear input immediately
    
    if (!input) return;

    // Log user command
    appendToCommsLog(input, true); 

    const command = input.toUpperCase().split(' ')[0];

    // --- CHECK FOR LOCAL CONSOLE COMMANDS ---
    let response = "";
    switch (command) {
        case 'HELP':
            response = "// AVAILABLE COMMS CONSOLE COMMANDS:\n// HELP: Display this command list.\n// CLEAR: Clear the comms log.\n// SCAN: Run comms signal sweep.\n// [NAME,ANY MESSAGE]: Send a message to [NAME].";
            break;
        case 'CLEAR':
            clearCommsLog();
            return; 
        default:
            // --- FORWARD TO GEMINI AI ---
            // Check authentication before sending to a potentially resource-heavy AI
            if (!currentUserId) {
                 response = "// ERROR: ACCESS DENIED. LOGIN REQUIRED TO INTERACT WITH A.I. INTERCEPT.";
            } else if (GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
                 response = "// ERROR: ORACLE-7 AI OFFLINE. (API KEY MISSING).";
            } else {
                 // ** MODIFIED TO PREPEND DYNAMIC RTD CONTEXT **
                 // 1. Get the latest RTD-synchronized data
                 const currentContext = getCurrentShipStateContext();
                 
                 // 2. Construct the full message
                 const contextAwareMessage = `${currentContext} USER INPUT: ${input}`;

                 // 3. Send the full message to Gemini
                 await sendMessageToGemini(contextAwareMessage); 
                 return;
            }
    }
    
    // Display response for local commands (HELP/CLEAR) or authentication errors
    if (response) {
        appendToCommsLog(response, false);
    }
}

// =====================================================================
// === SHARED STATE & AUTHENTICATION LOGIC (MODIFIED FOR CENTRAL STATE) ===
// =====================================================================

/**
 * Sets up the central Firebase listener and initializes the game state and loops.
 * This is called once on startup to ensure all clients are synchronized.
 */
function startSharedStateSync() {
    const shipDataRef = db.ref(CENTRAL_SHIP_PATH);

    // Set up a listener for the central ship state
    shipDataRef.on('value', (snapshot) => {
        const dbShipData = snapshot.val();
        
        // 1. Load Data
        if (dbShipData) {
            // Only apply the state if it's different from the local state 
            if (JSON.stringify(shipData) !== JSON.stringify(dbShipData)) {
                 Object.assign(shipData, dbShipData);
                 // Only log a sync message if the game is already running
                 if (gameInitialized) { 
                    //appendToLog("[DATA] Ship status synchronized from Central Log.");
                 }
                 updateDashboard(); 
            }
        } else {
             // 2. Initialize Central Node (only runs if the entire node is missing)
             if (!gameInitialized) { 
                 // Use the local default state and write it to the central node
                 shipDataRef.set(JSON.parse(JSON.stringify(shipData))); 
                 appendToLog("[DATA] Central Ship Log initialized.");
                 // Note: Firebase listener will trigger again immediately with the new data.
            }
        }
        
        // 3. Initialize Game Logic (Runs once after the first successful data sync/write)
        if (!gameInitialized) {
            startO2LogicLoop();
            gameInitialized = true;
            appendToLog("[SYS] Core State Synchronization Online.");
        }
    }, (error) => {
        appendToLog(`[ERR] Database error: ${error.message}`);
    });
}

/**
 * NEW: Function to handle the global reset command
 * This function now manually updates the local shipData copy
 * to ensure immediate UI and O2 logic sync.
 */
async function resetShipStateToDefault() {
    appendToLog("// INITIATING SYSTEM WIPE AND SHIPSTATE NODE RESET...");
    
    // 1. Clear the old interval timer if it exists.
    if (o2DynamicInterval) {
        clearInterval(o2DynamicInterval);
        o2DynamicInterval = null; 
    }
    // 2. Reset the flag that prevents the O2 start message from logging repeatedly.
    o2RecoveryStarted = false;
    
    // 3. Manually update the local shipData object with the new state.
    // This immediately sets shipData.o2.level to 75.0, solving the sync issue.
    // We use a deep copy to ensure shipData is completely fresh.
    Object.assign(shipData, JSON.parse(JSON.stringify(DEFAULT_SHIP_STATE)));
    
    // 4. Update the UI *immediately* to reflect the 75.0% O2 level.
    updateDashboard(); 
    
    // 5. Write the new state to Firebase (this is asynchronous).
    await db.ref(CENTRAL_SHIP_PATH).set(DEFAULT_SHIP_STATE)
        .then(() => {
            appendToLog("// RESET COMPLETE. ShipState node successfully wiped and restored.");
            // The Firebase listener will handle updates for other clients.
        })
        .catch((error) => {
            appendToLog(`// CRITICAL ERROR: FAILED TO RESET SHIPSTATE. Firebase Write Error: ${error.message}`);
        });
        
    // 6. Restart the O2 loop, which now correctly reads the new local shipData.o2.level.
    startO2LogicLoop();
}


/**
 * Enables/Disables all navigation buttons and command input, applying mobile restrictions.
 * @param {boolean} enabled - true to enable, false to disable.
 */
function setConsoleAccess(enabled) {
    const navButtons = document.querySelectorAll('.nav-btn');
    const isMobile = isMobileDevice(); 
    
    // Indices: 0: Status, 1: NavCore, 2: Personnel, 3: Comms, 4: Engineering
    // CHANGED: Status (index 0) has been removed from mobile access.
    const allowedMobileIndices = [2, 3]; // Personnel and Comms only
    
    navButtons.forEach((btn, index) => {
        let shouldBeEnabled = enabled;

        if (isMobile && enabled) {
            // If logged in AND mobile: only allow Personnel and Comms
            if (!allowedMobileIndices.includes(index)) { 
                shouldBeEnabled = false; 
            }
        } else if (!enabled) {
            // Not logged in: only keep Dashboard (index 0) visually active/default
             if (index > 0) {
                 shouldBeEnabled = false;
             } 
        }
        
        btn.disabled = !shouldBeEnabled;
        btn.style.opacity = shouldBeEnabled ? 1.0 : 0.4;
        btn.style.cursor = shouldBeEnabled ? 'pointer' : 'not-allowed';
        // Update the title attribute based on the restriction
        if (isMobile && enabled && !shouldBeEnabled) {
            btn.setAttribute('title', 'Access Restricted - Mobile Device');
        } else {
            btn.setAttribute('title', shouldBeEnabled ? 'Access Granted' : 'Access Restricted - Login Required');
        }
    });
    
    // Command input remains enabled so the user can type LOGOUT/HELP
    commandInputEl.disabled = false;
    
    if (isMobile && enabled) {
        // CHANGED: Updated the log message to reflect the new restrictions
        appendToLog("[SECURITY] MOBILE ACCESS ACTIVE. CONSOLES RESTRICTED TO PERSONNEL & COMMS.");
    }
}

// NOTE: loadInitialData(userId) function has been REMOVED as state is now loaded globally by startSharedStateSync().

/**
 * Persists the current ship data to the Realtime Database.
 * MODIFIED: Now saves to the central 'shipState' node instead of a user-specific path.
 */
function saveShipData() {
    // Only save if the game has been fully initialized
    if (gameInitialized) { 
        // Write to the central shared path
        db.ref(CENTRAL_SHIP_PATH).set(shipData)
          .catch(error => appendToLog(`[ERR] Failed to save ship data: ${error.message}`));
    }
}

/**
 * Updates the UI and internal state based on the current user ID.
 * @param {string|null} userId - The current user's ID (username), or null if logged out.
 */
function updateAuthState(userId) {
    const loginScreen = document.getElementById('login-screen');
    const consoleContainer = document.getElementById('console-container');
    const messageEl = document.getElementById('login-message');

    if (userId) {
        // User is signed in. HIDE LOGIN SCREEN.
        if(loginScreen) loginScreen.style.display = 'none';
        if(consoleContainer) consoleContainer.classList.remove('locked');
        currentUserId = userId;
        appendToLog(`[AUTH] Welcome, ${userId}. System access granted. TYPE 'HELP' FOR ASSISTANCE.`);
        
        setConsoleAccess(true); // Enable Nav buttons (with mobile restrictions)
        
        // ** FIX: Initialize the AI ONLY after the user is known **
        initGeminiChat(); 
        
        // OLD: loadInitialData(userId) call removed. State is handled globally by startSharedStateSync.
        
        // Set the initial screen based on device type (NEW LOGIC)
        const startScreen = isMobileDevice() ? 'personnel' : 'dashboard'; 
        switchScreen(startScreen); 
        
    } else {
        // User is signed out. SHOW LOGIN SCREEN.
        if(loginScreen) loginScreen.style.display = 'flex';
        if(consoleContainer) consoleContainer.classList.add('locked');
        currentUserId = null;
        // gameInitialized = false; // Keep gameInitialized true so the shared O2 loop keeps running

        setConsoleAccess(false); // Disable Nav buttons (except dashboard for help)
        
        // Clear the terminal and prompt the user 
        clearLog();
        appendToLog("// PILGRIM OS v1.2: SYSTEM STANDBY.");
        
        if(messageEl) messageEl.textContent = 'Session ended. Access key required.';
    }
}


/**
 * Handles the login attempt from the dedicated login screen, now authenticating 
 * against the 'player_profiles' list with 'username' and 'password' nodes.
 */
async function handleLoginScreen() {
    const usernameEl = document.getElementById('login-username'); 
    const passwordEl = document.getElementById('login-password');
    const messageEl = document.getElementById('login-message');

    const username = usernameEl.value.trim();
    const password = passwordEl.value.trim();

    messageEl.textContent = ''; // Clear previous messages

    if (!username || !password) {
        messageEl.textContent = 'Pilot ID and Access Key are required.';
        return;
    }
    
    // Simple minimum password length check
    if (password.length < 6) { 
        messageEl.textContent = 'Access Key must be at least 6 characters.';
        return;
    }

    // --- NEW: AUTHENTICATE AGAINST PLAYER_PROFILES LIST ---
    const profilesRef = db.ref('player_profiles');
    messageEl.textContent = 'ACCESSING CREW ROSTER...';

    try {
        const snapshot = await profilesRef.once('value');
        const profiles = snapshot.val(); // This will be an array-like object in RTD

        let authenticated = false;
        let matchedUsername = null;

        // Iterate through the profiles object
        // NOTE: The .json export uses keys '1', '2', '3' for the profiles
        for (const key in profiles) {
            const profile = profiles[key];
            
            // Ensure the profile has a username and password before checking
            if (profile && profile.username && profile.password) {
                // Check for case-insensitive username match and case-sensitive password match
                if (profile.username.toUpperCase() === username.toUpperCase() && profile.password === password) {
                    authenticated = true;
                    matchedUsername = profile.username;
                    break; 
                }
            }
        }

        if (authenticated) {
            messageEl.textContent = 'ACCESS GRANTED. PILOT AUTHENTICATED.';
            // Manually trigger the login state change using the matched username (to ensure correct case for later data saves)
            updateAuthState(matchedUsername); 
        } else {
            // No matching profile found in the roster
            messageEl.textContent = 'LOGIN ERROR: Invalid Pilot ID or Access Key.';
        }
    } catch (error) {
        // Handle database or network errors
        messageEl.textContent = `LOGIN ERROR: Database or network issue.`;
        appendToLog(`[ERR] Database operation error: ${error.message}`);
    }
    // --- END NEW REALTIME DATABASE LOGIC ---
}


/**
 * Sets up the initial state (logged out).
 */
function setupAuthListener() {
    // Manually set the initial logged-out state
    updateAuthState(null);
}

async function logoutUser() {
    // Manually trigger the logout state change
    updateAuthState(null);
    appendToLog(`[AUTH] Session ended.`);
}

// --- ASYNC REPAIR LOGIC FUNCTIONS (MODIFIED) ---

async function applyEngineFixLogic() {
    if (shipData.engine.status.includes("FAILURE")) {
        appendToLog("[SYS] ENGINE CODE ACCEPTED. INITIATING REBOOT...");
        
        await typeText("CALIBRATING INJECTORS...... [OK]", 0.5);
        await typeText("ALIGNING CORES............. [OK]", 0.5);
        await typeText("IGNITION SEQUENCE.......... [COMPLETE]", 0.5);
        
        shipData.engine.status = "ONLINE / STANDBY";
        
        // *** IMAGE LOGIC REMOVED - MOVED TO updateDashboard() ***
        
        appendToLog("[ENGINE] ARRAY ONLINE. STABILITY 99.8%.");
        saveShipData(); // Save state (This will trigger startSharedStateSync on other clients)
    } else {
        appendToLog("[ENGINE] STATUS IS NOMINAL. NO REPAIR NEEDED.");
    }
    updateDashboard(); // Updates local dashboard and engineering tab
}

async function applyHullFixLogic() {
    if (shipData.hull.status.includes("BREACH")) {
        appendToLog("[SYS] HULL CODE ACCEPTED. INITIATING SEALING SEQUENCE...");
        
        await typeText("PRESSURIZING FIELD......... [OK]", 0.5);
        await typeText("APPLYING PATCH............. [OK]", 0.5);
        
        shipData.hull.status = "NOMINAL (SEALED)";
        
        // *** IMAGE LOGIC REMOVED - MOVED TO updateDashboard() ***
        
        appendToLog("[HULL] BREACH SEALED. INTEGRITY 100%.");
        saveShipData(); // Save state (This will trigger startSharedStateSync on other clients)
    } else {
        appendToLog("[HULL] STATUS IS NOMINAL. NO REPAIR NEEDED.");
    }
    updateDashboard(); // Updates local dashboard and engineering tab
}

// --- O2, DASHBOARD, NAV, PERSONNEL LOGIC ---

function startO2LogicLoop() {
    if (o2DynamicInterval) return;
    appendToLog("[ALERT] O2 DECAY DETECTED. APPROXIMATE DEPLETION OF O2 IN 30 MINS. CHECK ENGINES. CHECK HULL.");
    
    o2DynamicInterval = setInterval(() => {
        const engineFixed = shipData.engine.status.includes("ONLINE");
        const hullFixed = shipData.hull.status.includes("NOMINAL");
        
        let change = 0;

        if (engineFixed && hullFixed) {
            change = O2_RECOVERY_RATE;
            if(!o2RecoveryStarted) { 
                appendToLog("[SYS] O2 RECOVERY PROTOCOL STARTED."); 
                o2RecoveryStarted = true; 
                saveShipData(); // Save on state change
            }
        } else if (engineFixed || hullFixed) {
            change = -O2_DECAY_RATE_WARNING;
        } else {
            change = -O2_DECAY_RATE_CRITICAL;
        }
        
        shipData.o2.level += change;
        
        // Clamp
        if(shipData.o2.level > 100) shipData.o2.level = 100;
        if(shipData.o2.level < 0) {
            shipData.o2.level = 0;
            clearInterval(o2DynamicInterval);
            alert("CRITICAL FAILURE: LIFE SUPPORT OFFLINE.");
            saveShipData(); // Save on game over
        }

        // Periodic warning
        if(shipData.o2.level < 15 && Math.random() < 0.05) { 
            appendToLog(`[WARNING] O2 CRITICAL: ${shipData.o2.level.toFixed(1)}%`);
        }
        
        updateDashboard();

        // NEW: Periodically save O2 level to the shared state (every 5 seconds)
        if (Math.floor(Date.now() / 1000) % 5 === 0) {
             saveShipData();
        }

    }, 1000);
}

function updateDashboard() {
    
// Clock
    document.getElementById('time').textContent = new Date().toLocaleTimeString();
    
// --- ENGINE DYNAMIC IMAGE ---
const engineImage = document.getElementById('engines-status-image');
const engineDetail = document.getElementById('engineStatusDetail');

if (shipData.engine.status === "ONLINE / STANDBY") {
    if (engineImage) engineImage.src = 'enginesfixed.png'; // Image when repaired
    if (engineDetail) engineDetail.style.color = 'var(--primary-color)';
} else {
    if (engineImage) engineImage.src = 'enginesdamaged.gif'; // Image when broken
    if (engineDetail) engineDetail.style.color = 'var(--alert-color)';
}
    
// --- HULL DASHBOARD ICON & DYNAMIC IMAGE ---
    const hullCard = document.getElementById('hullIconCard');
    const hullImage = document.getElementById('ship-status-image'); // Match the ID from your HTML
    const hullLed = document.getElementById('led-hull'); // Match the ID from your indicator list

    hullCard.classList.remove('critical', 'nominal');
    
    if (shipData.hull.status.includes("BREACH")) {
        
// DAMAGED STATE
        hullCard.classList.add('critical');
        document.getElementById('hullIconCard').querySelector('.icon-symbol').innerHTML = '&#67844;'; 
        
        if (hullImage) hullImage.src = 'shipimage1.gif';
        if (hullLed) {
            hullLed.classList.remove('nominal');
            hullLed.classList.add('critical');
        }
    } else {
        
// FIXED STATE
        hullCard.classList.add('nominal');
        document.getElementById('hullIconCard').querySelector('.icon-symbol').innerHTML = '&#67847;'; 
        
        if (hullImage) hullImage.src = 'shipimage2.png';
        if (hullLed) {
            hullLed.classList.remove('critical');
            hullLed.classList.add('nominal');
        }
    }
    document.getElementById('hullStatus').textContent = shipData.hull.status;
    
    
// --- ENGINE DASHBOARD ICON ---
    const engineCard = document.getElementById('engineIconCard');
    engineCard.classList.remove('critical', 'nominal');
    if (shipData.engine.status.includes("FAILURE")) {
        engineCard.classList.add('critical');
        document.getElementById('engineIconCard').querySelector('.icon-symbol').innerHTML = '&#67858;'; 
    } else {
        engineCard.classList.add('nominal');
        document.getElementById('engineIconCard').querySelector('.icon-symbol').innerHTML = '&#67855;'; 
    }
    document.getElementById('engineStatus').textContent = shipData.engine.status;

    
// --- COMMS ---
    const commsCard = document.getElementById('commsIconCard');
    commsCard.classList.remove('warning', 'nominal');
    if (shipData.comms.status.includes("OFFLINE")) {
        commsCard.classList.add('warning');
        document.getElementById('commsIconCard').querySelector('.icon-symbol').innerHTML = '&#67853;'; 
    } else {
        commsCard.classList.add('nominal');
        document.getElementById('commsIconCard').querySelector('.icon-symbol').innerHTML = '&#67852;'; 
    }
    document.getElementById('commsStatus').textContent = shipData.comms.status;

    
// --- COORDS ---
    const coordCard = document.getElementById('coordIconCard');
    coordCard.classList.remove('warning', 'nominal');
    if (shipData.coords.status.includes("CORRUPTED")) { 
        coordCard.classList.add('warning');
        document.getElementById('coordIconCard').querySelector('.icon-symbol').innerHTML = '&#67840;'; 
    } else {
        coordCard.classList.add('nominal');
        document.getElementById('coordIconCard').querySelector('.icon-symbol').innerHTML = '&#67841;'; 
    }
    document.getElementById('coordStatus').textContent = shipData.coords.status;

    
// --- O2 GAUGE & CARD COLOR ---
    const o2Card = document.getElementById('o2IconCard');
    o2Card.classList.remove('critical', 'warning', 'nominal');
    
    if(shipData.o2.level < 20) o2Card.classList.add('critical');
    else if(shipData.o2.level < 50) o2Card.classList.add('warning');
    else o2Card.classList.add('nominal');

    document.getElementById('o2Value').textContent = shipData.o2.level.toFixed(1) + "%";
    
    const gauge = document.getElementById('o2Gauge');
    gauge.style.width = shipData.o2.level + "%";
    if(shipData.o2.level < 20) gauge.style.background = "red";
    else if(shipData.o2.level < 50) gauge.style.background = "orange";
    else gauge.style.background = "var(--primary-color)";
    updateO2Visuals(shipData.o2.level);
    
}

function displaySectorScan() {
    let output = "--- SECTOR SCAN DATA (1-12) ---\n";
    let keys = Object.keys(SECTOR_SCAN_DATA);
    for (let i = 0; i < keys.length; i += 2) {
        let row = "";
        for (let j = 0; j < 2; j++) {
            if (keys[i + j]) {
                const sector = keys[i + j].padStart(2, '0');
                const content = SECTOR_SCAN_DATA[keys[i + j]]; 
                row += `[Sect ${sector}: ${content.padEnd(14)}] `;
            }
        }
        output += row + "\n";
    }
    document.getElementById('navScanOutput').innerText = output;
    displayCurrentClues();
}

function displayCurrentClues() {
    const list = document.getElementById('navClues');
    list.innerHTML = '';
    if (currentClueIndex === -1) {
        list.innerHTML = '<li>-- NO DEFRAG CLUES AVAILABLE --</li>';
        return;
    }
    for (let i = 0; i <= currentClueIndex; i++) {
        if (i < SECTOR_CLUES.length) {
            const li = document.createElement('li');
            li.textContent = SECTOR_CLUES[i];
            list.appendChild(li);
        }
    }
}

function sectorLogicGame() {
    if(!currentUserId) return appendToLog("[AUTH] LOGIN REQUIRED TO USE NAV CORE."); // Auth check
    
    const s2 = document.getElementById('sector2').value.toUpperCase().trim();
    const s6 = document.getElementById('sector6').value.toUpperCase().trim();
    const s10 = document.getElementById('sector10').value.toUpperCase().trim();

    if (!s2 || !s6 || !s10) {
         appendToLog("[NAV] ERROR: Input all fields.");
         return;
    }

    if(s2 === SECTOR_SOLUTION[2] && s6 === SECTOR_SOLUTION[6] && s10 === SECTOR_SOLUTION[10]) {
        appendToLog("[NAV] CONFIG VERIFIED. UNLOCKING CORE.");
        document.getElementById('navLogicPanel').style.display = 'none';
        document.getElementById('navFinalPanel').style.display = 'block';
        navUnlocked = true;
        shipData.coords.status = "READY FOR INPUT";
        saveShipData(); // Save state
    } else {
        appendToLog("[NAV] VERIFICATION FAILED.");
        if (currentClueIndex < SECTOR_CLUES.length - 1) { 
            currentClueIndex++;
            appendToLog(`[NAV] NEW CLUE FOUND.`);
            displayCurrentClues();
        }
    }
    updateDashboard();
}

function accessNav(coords) {
    if(!currentUserId) return appendToLog("[AUTH] LOGIN REQUIRED TO INITIATE JUMP."); // Auth check
    if(!navUnlocked) return;
    
    if(shipData.engine.status.includes("FAILURE")) {
        appendToLog("[ERR] ENGINES OFFLINE. CANNOT CALCULATE.");
        return;
    }

    if(coords.trim() === ERIDANI_COORDS) {
        shipData.coords.status = "LOCKED: EPSILON ERIDANI";
        appendToLog("!!! JUMP COORDINATES LOCKED. MISSION ACCOMPLISHED. !!!");
        alert("MISSION ACCOMPLISHED: JUMP INITIATED TO ERIDANI");
        saveShipData(); // Save state
    } else if (coords.trim() === EARTH_COORDS) {
         shipData.coords.status = "LOCKED: EARTH";
         appendToLog("!!! JUMP COORDINATES LOCKED. MISSION ACCOMPLISHED. !!!");
         alert("MISSION ACCOMPLISHED: JUMP INITIATED TO EARTH");
         saveShipData(); // Save state
    } else {
        appendToLog("[ERR] INVALID COORDINATES.");
    }
    updateDashboard();
}

function displayCrewList() {
    const list = document.getElementById('crewList');
    list.innerHTML = '';
    for(let i=1; i<=12; i++) {
        let li = document.createElement('li');
        li.innerText = `ID ${i.toString().padStart(2, '0')}: ${PLAYER_PROFILES[i].Name}`;
        list.appendChild(li);
    }
}

function getPersonnelFile(idStr) {
    if(!currentUserId) return appendToLog("[AUTH] LOGIN REQUIRED TO ACCESS PERSONNEL FILES."); // Auth check
    
    const id = parseInt(idStr.trim());
    const display = document.getElementById('personnelFileDisplay');
    const photoEl = document.getElementById('personnelPhoto'); 
    
    const DEFAULT_PHOTO_PATH = "corp_logo.gif";
    
    if(isNaN(id) || id < 1 || id > 12) {
        display.innerText = "// ERROR: INVALID ID";
        photoEl.src = DEFAULT_PHOTO_PATH; 
        return;
    }

    const p = PLAYER_PROFILES[id];

    photoEl.src = p.Photo || DEFAULT_PHOTO_PATH; 
    
    let content = `ID: ${id}\nNAME: ${p.Name}\nSTATUS: ${p.Status}\nEXPERT: ${p.Expertise}\n`;
    
    let granted = true; 
    
    if(granted) {
        content += `\nRECORD:\n${p.Record}`;
        appendToLog(`[SYS] ACCESSED FILE ID ${id}`);
    } else {
        content += "\n[ACCESS DENIED: CONTACT ADMIN]";
        appendToLog(`[SEC] ACCESS DENIED ID ${id}`);
    }

    display.innerText = content;
}

// --- MOBILE ACCESS RESTRICTION LOGIC ---
function isMobileDevice() {
    // Basic check for common mobile device width/user agents
    return window.matchMedia("(max-width: 768px)").matches || 
           /Mobi|Android/i.test(navigator.userAgent);
}


// =====================================================================
// --- INIT (The Core Fix) ---
// =====================================================================
window.onload = function() {

// COMMS INITIALIZATION
    //commsLogEl = document.getElementById('commsLog'); // ID from index.html: <pre id="commsLog">
    //commsInputEl = document.getElementById('commsInput'); // ID from index.html: <input type="text" id="commsInput">
    
    // NEW: INITIALIZE GEMINI CHAT
    //initGeminiChat();

    // 1. START the Authentication Listener FIRST.
    setupAuthListener(); 

    // 1.5. Start shared state synchronization immediately
    startSharedStateSync(); // <--- NEW CALL

    // 2. Run non-dynamic, non-looping initial UI updates
    displayCrewList();
    displaySectorScan();
    updateDashboard();

    // 3. Run non-login-dependent features
    startGlitchLoop();
    
    commandInputEl.focus(); 
};


// --- GLITCH EFFECT CONTROLLER ---

function startGlitchLoop() {
    // 1. Define the minimum and maximum time for the random interval (in milliseconds)
    const minTime = 0.5 * 60 * 1000; // 0.5 minutes
    const maxTime = 1 * 60 * 1000; // 1 minutes
    
    // Calculate a random time between minTime and maxTime
    const randomInterval = Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;

    // Set the loop to trigger the glitch after the random interval
    setTimeout(() => {
        
        // 2. TRIGGER THE GLITCH
        document.body.classList.add('glitch-active');
        
        // --- Glitch Duration (The duration the screen is distorted) ---
        const glitchDuration = 50; // 50 milliseconds
        
        setTimeout(() => {
            // 3. START RECOVERY
            // Remove the active class to stop the distortion
            document.body.classList.remove('glitch-active');
            
            // Add the transition class to start the smooth snap-back (0.05s set in CSS)
            document.body.classList.add('glitch-transition');
            
            // --- Recovery Duration (Must match the transition time set in CSS: 0.05s) ---
            const recoveryDuration = 50; // 50 milliseconds
            
            setTimeout(() => {
                // 4. RESET: Remove the transition class entirely
                document.body.classList.remove('glitch-transition');
                
                // 5. RESTART THE LOOP
                startGlitchLoop();
                
            }, recoveryDuration); // Matches the CSS transition time
            
        }, glitchDuration);
        
    }, randomInterval);
}


/**
 * UPDATED: Updates the circular O2 progress indicator with a time countdown
 * @param {number} o2Value - The current O2 level (0-100)
 */
function updateO2Visuals(o2Value) {
    // 1. Calculate Time Remaining based on current ship status
    let rate = 0;
    const engineFixed = shipData.engine.status.includes("ONLINE");
    const hullFixed = shipData.hull.status.includes("NOMINAL");

    if (engineFixed && hullFixed) {
        rate = 0; // O2 is increasing/stable
    } else if (engineFixed || hullFixed) {
        rate = O2_DECAY_RATE_WARNING;  // 0.02% per second
    } else {
        rate = O2_DECAY_RATE_CRITICAL; // 0.04% per second
    }

    const counterElement = document.getElementById("o2PercentageCounter");
    if (counterElement) {
        if (rate === 0) {
            counterElement.textContent = "STABLE";
        } else {
            // Formula: (Current % / Decay Rate per second) = total seconds left
            const totalSecondsLeft = o2Value / rate;
            const mins = Math.floor(totalSecondsLeft / 60);
            const secs = Math.floor(totalSecondsLeft % 60);
            counterElement.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
        }
    }

    // 2. Update the SVG ring mask (keep this the same for the visual bar)
    const ring = document.getElementById("o2ProgressRing");
    if (ring) {
        const offset = 100 - o2Value;
        ring.setAttribute("stroke-dashoffset", offset);
    }
}