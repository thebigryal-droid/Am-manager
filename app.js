/* =========================================================
   RYAL MANAGEMENT OS — CORE ARCHITECTURE CONTROLLER (V9.6)
   Facility: Ashar Arize Executive Facility OS
   ========================================================= */

// 1. Unified Navigation Mapping
const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
    { id: 'daily_report', label: 'Executive Report', icon: 'fa-file-alt' },
    { id: 'amenities', label: 'Amenity Master', icon: 'fa-building' },
    { id: 'control', label: 'Daily Checklist', icon: 'fa-check-double' },
    { id: 'issues', label: 'Smart Helpdesk', icon: 'fa-tools' },
    { id: 'bookings', label: 'Smart Bookings', icon: 'fa-calendar-alt' },
    { id: 'hk_schedule', label: 'HK Schedule', icon: 'fa-broom' },
    { id: 'inventory', label: 'Inventory', icon: 'fa-boxes' },
    { id: 'pool', label: 'Pool Logs', icon: 'fa-swimming-pool' },
    { id: 'staff_master', label: 'Staff Master', icon: 'fa-users' },
    { id: 'attendance', label: 'Staff Attendance', icon: 'fa-user-clock' }
];

// 2. Canonical 41 Amenity Master Dataset (Ashar Arize)
const DEFAULT_AMENITIES = [
    { id: "US-01", name: "Club Lobby", category: "Upper Stilt", status: "Operational" },
    { id: "US-02", name: "Gym", category: "Upper Stilt", status: "Operational" },
    { id: "US-03", name: "Cross Fit Area", category: "Upper Stilt", status: "Operational" },
    { id: "US-04", name: "Experience Room", category: "Upper Stilt", status: "Operational" },
    { id: "US-05", name: "Mini Theatre", category: "Upper Stilt", status: "Operational" },
    { id: "US-06", name: "Infinity Pool with Kids Pool", category: "Upper Stilt", status: "Operational" },
    { id: "US-07", name: "Changing Rooms and Massage Room", category: "Upper Stilt", status: "Operational" },
    { id: "US-08", name: "Sundowner Party Zone", category: "Upper Stilt", status: "Operational" },
    { id: "US-09", name: "Viewing Deck", category: "Upper Stilt", status: "Operational" },
    { id: "US-10", name: "Senior Citizen Corner", category: "Upper Stilt", status: "Operational" },
    { id: "US-11", name: "Skating Rink", category: "Upper Stilt", status: "Operational" },
    { id: "US-12", name: "Box Cricket", category: "Upper Stilt", status: "Operational" },
    { id: "US-13", name: "Mini Golf", category: "Upper Stilt", status: "Operational" },
    { id: "US-14", name: "Celebration Area with Pantry", category: "Upper Stilt", status: "Operational" },
    { id: "US-15", name: "Banquet Hall", category: "Upper Stilt", status: "Operational" },
    { id: "US-16", name: "Party Celebration Lawn with Barbeque Area", category: "Upper Stilt", status: "Operational" },
    { id: "US-17", name: "Guest Bedrooms", category: "Upper Stilt", status: "Operational" },
    { id: "P2-01", name: "Main Entrance", category: "P2 Level", status: "Operational" },
    { id: "P2-02", name: "Multipurpose Court", category: "P2 Level", status: "Operational" },
    { id: "P2-03", name: "Spectator Plaza", category: "P2 Level", status: "Operational" },
    { id: "P2-04", name: "Seating Area", category: "P2 Level", status: "Operational" },
    { id: "P2-05", name: "Indoor Badminton", category: "P2 Level", status: "Operational" },
    { id: "P2-06", name: "Amphitheatre", category: "P2 Level", status: "Operational" },
    { id: "P2-07", name: "Adventure Play Area", category: "P2 Level", status: "Operational" },
    { id: "P2-08", name: "Toddler's Play Area", category: "P2 Level", status: "Operational" },
    { id: "P2-09", name: "Kids Play Area", category: "P2 Level", status: "Operational" },
    { id: "P2-10", name: "Trampoline", category: "P2 Level", status: "Operational" },
    { id: "P2-11", name: "Parents Seating", category: "P2 Level", status: "Operational" },
    { id: "P2-12", name: "Open Turf", category: "P2 Level", status: "Operational" },
    { id: "P2-13", name: "Floral Gardens", category: "P2 Level", status: "Operational" },
    { id: "SKY-01", name: "Yoga & Meditation Deck", category: "Skyzone 40th Floor", status: "Operational" },
    { id: "SKY-02", name: "Cocktail Plaza", category: "Skyzone 40th Floor", status: "Operational" },
    { id: "SKY-03", name: "The Star Gazing Deck + Party Deck and Bar Counter", category: "Skyzone 40th Floor", status: "Operational" },
    { id: "SKY-04", name: "Ball Pool Area", category: "Skyzone 40th Floor", status: "Operational" },
    { id: "SKY-05", name: "Air Hockey", category: "Skyzone 40th Floor", status: "Operational" },
    { id: "SKY-06", name: "Playstation Zone", category: "Skyzone 40th Floor", status: "Operational" },
    { id: "SKY-07", name: "Party Deck Area", category: "Skyzone 40th Floor", status: "Operational" },
    { id: "SKY-08", name: "Indoor Games Area", category: "Skyzone 40th Floor", status: "Operational" },
    { id: "SKY-09", name: "Dance Studio", category: "Skyzone 40th Floor", status: "Operational" },
    { id: "SKY-10", name: "Arts & Craft Room", category: "Skyzone 40th Floor", status: "Operational" },
    { id: "SKY-11", name: "Toddlers Play Area/Creche", category: "Skyzone 40th Floor", status: "Operational" }
];

const BASE_ZONE_QUESTIONS = {
    "Upper Stilt": ["Pool water clear & sanitized?", "Gym machinery wiped & calibrated?", "Audio/Visuals operating properly?", "Floors polished, mopped and dry?", "Restrooms restocked & sanitized?"],
    "P2 Level": ["Turf clear of debris?", "Sports netting & line markings intact?", "Children play apparatus bolts secure?", "Gardens pruned and watered?"],
    "Skyzone 40th Floor": ["Glass perimeter facades clean & clear?", "Deck furniture aligned & dry?", "Arcade & gaming hardware operational?", "Waste receptacles empty?"]
};

// Global Reactive Caches
let ALL_AMENITIES_CACHE = [];
let MASTER_CHECKLIST_LOGS = [];
let MASTER_COMPLAINTS_CACHE = [];
let MASTER_BOOKINGS_CACHE = [];
let MASTER_HK_CACHE = [];
let MASTER_INV_CACHE = [];
let MASTER_POOL_CACHE = [];
let MASTER_ATT_CACHE = [];
let MASTER_STAFF_CACHE = [];
let CUSTOM_POINTS_CACHE = [];

// =========================================================
// 3. APPLICATION BOOTSTRAPPER & IMAGE COMPRESSION (NEW)
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    buildNavigation();
    setupAuthListeners();

    // Module Initializations
    initAmenityMaster();
    initCustomPointsEngine();
    initSmartChecklist();
    initComplaintsLog();
    initSmartBookings();
    initHKSchedule();
    initInventorySystem();
    initPoolLogs();
    initStaffSystem();
    initLayoutCarousel();
    initModalHandlers();

    setReportRange('daily');
    runDataRetentionPolicy();
});

// HTML Canvas Base64 Image Compressor (Offline-Resilient)
async function compressImage(file) {
    return new Promise((resolve, reject) => {
        if (!file) return resolve(null);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(event) {
            const img = new Image();
            img.src = event.target.result;
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800; // Cap width to prevent massive Firestore docs
                const MAX_HEIGHT = 800;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                } else {
                    if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                // Compress to 60% Quality JPEG Base64 String
                resolve(canvas.toDataURL('image/jpeg', 0.6));
            };
            img.onerror = (e) => reject(e);
        };
        reader.onerror = (e) => reject(e);
    });
}

// =========================================================
// 4. FIREBASE AUTH & USER CONTEXT
// =========================================================
function setupAuthListeners() {
    const auth = firebase.auth();
    auth.onAuthStateChanged(user => {
        const btn = document.getElementById('auth-btn');
        const badge = document.getElementById('syncStatus');
        if (user) {
            badge.innerText = "DB Connected";
            badge.className = "text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-100 text-emerald-800";
            btn.innerHTML = `<i class="fas fa-sign-out-alt mr-1"></i> Sign Out`;
            btn.className = "bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition";
            btn.onclick = () => auth.signOut();
            verifyAndSeedCanonicalAmenities();
        } else {
            badge.innerText = "Offline Cache";
            badge.className = "text-xs px-2.5 py-1 rounded-full font-semibold bg-amber-100 text-amber-800";
            btn.innerHTML = `<i class="fas fa-user-circle mr-1"></i> Sign In`;
            btn.className = "bg-accent hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition";
            btn.onclick = () => {
                const email = prompt("Operator Email:");
                if (!email) return;
                const pass = prompt("Password:");
                if (!pass) return;
                auth.signInWithEmailAndPassword(email, pass).catch(e => alert("Login Notice: " + e.message));
            };
        }
    });
}

// =========================================================
// 5. AMENITY MASTER ENGINE
// =========================================================
function initAmenityMaster() {
    const db = firebase.firestore();

    const amForm = document.getElementById('amenity-form');
    if (amForm) {
        amForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const id = document.getElementById('am-id').value.toUpperCase() || `GEN-${Date.now().toString().slice(-4)}`;
            const name = document.getElementById('am-name').value;
            const category = document.getElementById('am-category').value;
            const status = document.getElementById('am-status').value;

            db.collection("amenities").doc(id).set({
                id: id, name: name, category: category, status: status,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true }).then(() => {
                this.reset();
                document.getElementById('add-amenity-modal').classList.add('hidden');
            });
        });
    }

    db.collection("amenities").onSnapshot(snap => {
        ALL_AMENITIES_CACHE = [];
        let html = '';
        let opts = '<option value="">Select an Amenity...</option>';
        let stiltHtml = '', p2Html = '', skyHtml = '';

        snap.forEach(doc => {
            const d = doc.data();
            d.docId = doc.id;
            ALL_AMENITIES_CACHE.push(d);

            let statusColor = d.status === 'Maintenance' ? 'text-amber-700 bg-amber-100' :
                d.status === 'Closed' ? 'text-rose-700 bg-rose-100' : 'text-emerald-700 bg-emerald-100';

            let mTimings = d.mOpen && d.mClose ? `${d.mOpen} - ${d.mClose}` : 'Not scheduled';
            let eTimings = d.eOpen && d.eClose ? `${d.eOpen} - ${d.eClose}` : 'Not scheduled';

            html += `
                <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between">
                    <div>
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <span class="text-[10px] font-mono font-bold text-accent">${d.id || d.docId}</span>
                                <h4 class="font-bold text-sm text-gray-900">${d.name}</h4>
                                <p class="text-[10px] text-gray-500">${d.category}</p>
                            </div>
                            <span class="${statusColor} text-[9px] px-2 py-0.5 rounded font-black uppercase">${d.status}</span>
                        </div>
                        <div class="bg-slate-50 rounded-lg p-2.5 border border-slate-100 grid grid-cols-2 gap-2 text-[10px] text-gray-600 mt-2">
                            <div><strong class="uppercase text-gray-400 block text-[8px]">Morning Slot</strong> ${mTimings}</div>
                            <div><strong class="uppercase text-gray-400 block text-[8px]">Evening Slot</strong> ${eTimings}</div>
                        </div>
                    </div>
                    <button onclick="openAmenityModal('${d.docId}')" class="mt-3 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-1.5 rounded-lg border border-slate-200 transition">
                        <i class="fas fa-clock mr-1"></i> Edit Hours & Status
                    </button>
                </div>
            `;

            opts += `<option value="${d.name}">${d.name} (${d.category})</option>`;

            let badge = `<span class="bg-slate-100 text-slate-800 text-[10px] px-2.5 py-1 rounded-md border border-slate-200 font-medium">${d.name}</span>`;
            if (d.category === 'Upper Stilt') stiltHtml += badge;
            else if (d.category === 'P2 Level') p2Html += badge;
            else if (d.category === 'Skyzone 40th Floor') skyHtml += badge;
        });

        const listEl = document.getElementById('amenities-list');
        if (listEl) listEl.innerHTML = html;

        ['cl-amenity', 'iss-amenity', 'bk-amenity', 'hk-amenity', 'pl-amenity'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                const currentVal = el.value;
                el.innerHTML = opts;
                if (currentVal) el.value = currentVal;
            }
        });

        const dashCount = document.getElementById('dash-amenities');
        if (dashCount) dashCount.innerText = ALL_AMENITIES_CACHE.length;

        const zStilt = document.getElementById('zone-stilt-list');
        if (zStilt) zStilt.innerHTML = stiltHtml;
        const zP2 = document.getElementById('zone-p2-list');
        if (zP2) zP2.innerHTML = p2Html;
        const zSky = document.getElementById('zone-skyzone-list');
        if (zSky) zSky.innerHTML = skyHtml;
    });
}

window.verifyAndSeedCanonicalAmenities = function () {
    const db = firebase.firestore();
    DEFAULT_AMENITIES.forEach(item => {
        db.collection("amenities").doc(item.id).set({
            id: item.id, name: item.name, category: item.category, status: item.status,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
    });
};

window.deduplicateAndReseedAmenities = async function () {
    if (!confirm("Run self-healing pass to clean legacy duplicate records and restore the 41 canonical amenities?")) return;
    const db = firebase.firestore();
    const snap = await db.collection("amenities").get();

    const validCanonicalIds = DEFAULT_AMENITIES.map(a => a.id);
    const seenNames = new Set();
    const batch = db.batch();

    snap.forEach(doc => {
        const d = doc.data();
        if (!validCanonicalIds.includes(doc.id) || seenNames.has(d.name)) {
            batch.delete(doc.ref);
        } else {
            seenNames.add(d.name);
        }
    });

    await batch.commit();
    verifyAndSeedCanonicalAmenities();
    alert("Amenity Master sanitized: Canonical 41 active.");
};

window.openAmenityModal = function (docId) {
    const am = ALL_AMENITIES_CACHE.find(a => a.docId === docId);
    if (!am) return;
    document.getElementById('eam-id').value = am.docId;
    document.getElementById('eam-name').value = am.name || '';
    document.getElementById('eam-status').value = am.status || 'Operational';
    document.getElementById('eam-m-open').value = am.mOpen || '';
    document.getElementById('eam-m-close').value = am.mClose || '';
    document.getElementById('eam-e-open').value = am.eOpen || '';
    document.getElementById('eam-e-close').value = am.eClose || '';
    document.getElementById('edit-amenity-modal').classList.remove('hidden');
};


// =========================================================
// 6. SMART DAILY CHECKLIST & GLOBAL POINTS ENGINE
// =========================================================
let currentActiveQuestions = [];

function initCustomPointsEngine() {
    const db = firebase.firestore();
    
    document.getElementById('custom-point-form').addEventListener('submit', function(e) {
        e.preventDefault();
        db.collection("checklist_points").add({
            zone: document.getElementById('cp-zone').value,
            text: document.getElementById('cp-text').value,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            document.getElementById('cp-text').value = '';
        });
    });

    db.collection("checklist_points").orderBy("createdAt", "desc").onSnapshot(snap => {
        CUSTOM_POINTS_CACHE = [];
        let html = '';
        snap.forEach(doc => {
            const d = doc.data();
            d.docId = doc.id;
            CUSTOM_POINTS_CACHE.push(d);
            html += `
                <div class="bg-white border border-gray-200 rounded p-3 flex justify-between items-center shadow-sm">
                    <div>
                        <span class="text-[10px] font-bold text-accent uppercase block">${d.zone}</span>
                        <span class="text-xs font-medium text-gray-800">${d.text}</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button onclick="editCustomPoint('${d.docId}', '${d.text}')" class="text-blue-500 hover:text-blue-700 text-xs bg-blue-50 px-2 py-1 rounded"><i class="fas fa-edit"></i></button>
                        <button onclick="deleteCustomPoint('${d.docId}')" class="text-rose-500 hover:text-rose-700 text-xs bg-rose-50 px-2 py-1 rounded"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
            `;
        });
        document.getElementById('manage-points-list').innerHTML = html || '<div class="text-xs text-gray-400 italic text-center py-4">No custom points added.</div>';
        
        // Re-trigger checklist UI if currently open
        const clAmenity = document.getElementById('cl-amenity');
        if(clAmenity && clAmenity.value) clAmenity.dispatchEvent(new Event('change'));
    });
}

window.editCustomPoint = function(id, currentText) {
    const newText = prompt("Edit Inspection Point:", currentText);
    if(newText && newText.trim() !== "") firebase.firestore().collection("checklist_points").doc(id).update({ text: newText.trim() });
};

window.deleteCustomPoint = function(id) {
    if(confirm("Delete this custom point permanently?")) firebase.firestore().collection("checklist_points").doc(id).delete();
};


function initSmartChecklist() {
    const db = firebase.firestore();
    const clAmenitySelect = document.getElementById('cl-amenity');
    const dynamicSection = document.getElementById('cl-dynamic-section');
    const autoComplaintBox = document.getElementById('cl-auto-complaint-box');

    if (clAmenitySelect) {
        clAmenitySelect.addEventListener('change', function () {
            autoComplaintBox.classList.add('hidden');
            const selectedName = this.value;
            if (!selectedName) {
                dynamicSection.classList.add('hidden');
                return;
            }
            dynamicSection.classList.remove('hidden');

            const amenityObj = ALL_AMENITIES_CACHE.find(a => a.name === selectedName);
            const category = amenityObj ? amenityObj.category : "Upper Stilt";
            document.getElementById('cl-zone-label').innerText = category;

            const baseQs = BASE_ZONE_QUESTIONS[category] || ["Cleanliness verified?", "Lighting operational?"];
            const customQs = CUSTOM_POINTS_CACHE.filter(p => p.zone === category).map(p => p.text);
            
            currentActiveQuestions = [...baseQs, ...customQs];
            renderChecklistQuestions();
        });
    }

    const clForm = document.getElementById('checklist-form');
    if (clForm) {
        clForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const btn = document.getElementById('cl-submit-btn');
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Committing Audit...';
            btn.disabled = true;

            const amenityName = document.getElementById('cl-amenity').value;
            const inspector = document.getElementById('cl-inspector').value;
            let hasFailures = false;
            let failureNotes = [];
            let questionResults = {};

            currentActiveQuestions.forEach((q, idx) => {
                const selected = document.querySelector(`input[name="cl_q_${idx}"]:checked`);
                const val = selected ? selected.value : "Pass";
                questionResults[`point_${idx}`] = { question: q, result: val };
                if (val === "Fail") {
                    hasFailures = true;
                    failureNotes.push(q);
                }
            });

            const issueDesc = document.getElementById('cl-issue-desc').value;

            if (hasFailures) {
                const finalDesc = issueDesc || `Automated audit failure: ${failureNotes.join('; ')}`;
                await db.collection("complaints").add({
                    amenity: amenityName,
                    department: document.getElementById('cl-issue-dept').value,
                    description: `[AUDIT DISPATCH] ${finalDesc}`,
                    priority: document.getElementById('cl-issue-priority').value,
                    informedTo: 'Auto Dispatch System',
                    status: 'Open',
                    photoBase64: null,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            await db.collection("daily_logs").add({
                amenity: amenityName,
                inspector: inspector,
                hasIssues: hasFailures,
                failedPoints: failureNotes.join(', '),
                results: questionResults,
                notes: issueDesc,
                dateString: new Date().toISOString().split('T')[0],
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            this.reset();
            dynamicSection.classList.add('hidden');
            autoComplaintBox.classList.add('hidden');
            btn.innerHTML = '<i class="fas fa-check-double"></i> Submit & Log Inspection';
            btn.disabled = false;
        });
    }

    db.collection("daily_logs").orderBy("createdAt", "desc").onSnapshot(snap => {
        MASTER_CHECKLIST_LOGS = [];
        let todayCount = 0;
        const todayStr = new Date().toISOString().split('T')[0];

        snap.forEach(doc => {
            const d = doc.data();
            d.docId = doc.id;
            MASTER_CHECKLIST_LOGS.push(d);
            if (d.dateString === todayStr) todayCount++;
        });

        const dashDone = document.getElementById('dash-completed');
        if (dashDone) dashDone.innerText = todayCount;
        const badge = document.getElementById('history-count-badge');
        if (badge) badge.innerText = MASTER_CHECKLIST_LOGS.length;

        renderChecklistHistory(MASTER_CHECKLIST_LOGS);
    });
}

function renderChecklistQuestions() {
    const container = document.getElementById('cl-questions-container');
    let html = '';
    currentActiveQuestions.forEach((q, idx) => {
        html += `
            <div class="flex justify-between items-center border-b border-gray-100 py-2.5">
                <span class="text-xs font-medium text-gray-700 leading-tight w-2/3 pr-2">${q}</span>
                <div class="flex space-x-1.5 w-1/3 justify-end">
                    <label class="cursor-pointer">
                        <input type="radio" name="cl_q_${idx}" value="Pass" class="smart-radio pass-radio hidden" checked onchange="checkAutoComplaintTrigger()">
                        <div class="bg-gray-100 text-gray-500 px-2.5 py-1 rounded text-[10px] font-bold transition-all text-center">Pass</div>
                    </label>
                    <label class="cursor-pointer">
                        <input type="radio" name="cl_q_${idx}" value="Fail" class="smart-radio fail-radio hidden" onchange="checkAutoComplaintTrigger()">
                        <div class="bg-gray-100 text-gray-500 px-2.5 py-1 rounded text-[10px] font-bold transition-all text-center">Fail</div>
                    </label>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

window.checkAutoComplaintTrigger = function () {
    let hasFail = false;
    currentActiveQuestions.forEach((_, idx) => {
        const selected = document.querySelector(`input[name="cl_q_${idx}"]:checked`);
        if (selected && selected.value === "Fail") hasFail = true;
    });
    const box = document.getElementById('cl-auto-complaint-box');
    if (box) {
        if (hasFail) box.classList.remove('hidden');
        else box.classList.add('hidden');
    }
};

function renderChecklistHistory(logs) {
    let html = '';
    logs.forEach(d => {
        const dateObj = d.createdAt ? d.createdAt.toDate() : new Date();
        const dStr = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
        const tStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const badge = d.hasIssues ?
            `<span class="bg-rose-100 text-rose-700 text-[9px] px-2 py-0.5 rounded font-black uppercase">Failed</span>` :
            `<span class="bg-emerald-100 text-emerald-700 text-[9px] px-2 py-0.5 rounded font-black uppercase">Passed</span>`;

        html += `
            <div class="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex justify-between items-center text-xs">
                <div>
                    <div class="font-bold text-gray-900">${d.amenity}</div>
                    <div class="text-[10px] text-gray-400">Inspector: ${d.inspector || 'Staff'} • ${dStr} at ${tStr}</div>
                </div>
                <div class="flex items-center space-x-2">
                    ${badge}
                    <button onclick="openChecklistModal('${d.docId}')" class="text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded text-xs font-bold transition hover:bg-blue-100"><i class="fas fa-edit"></i> Edit</button>
                    <button onclick="deleteChecklistLog('${d.docId}')" class="text-rose-500 hover:text-rose-700 p-1.5"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
        `;
    });
    const container = document.getElementById('checklist-history-list');
    if (container) container.innerHTML = html || '<div class="text-center text-gray-400 py-3 text-xs">No records logged.</div>';
}

window.toggleHistoryDrawer = function () {
    const drawer = document.getElementById('history-drawer');
    const chevron = document.getElementById('history-chevron');
    if (drawer.classList.contains('hidden')) {
        drawer.classList.remove('hidden');
        chevron.classList.add('rotate-180');
    } else {
        drawer.classList.add('hidden');
        chevron.classList.remove('rotate-180');
    }
};

window.openChecklistModal = function (docId) {
    const log = MASTER_CHECKLIST_LOGS.find(l => l.docId === docId);
    if (!log) return;
    
    document.getElementById('ecl-id').value = log.docId;
    document.getElementById('ecl-amenity').value = log.amenity || '';
    document.getElementById('ecl-notes').value = log.notes || '';

    // Reconstruct the Dynamic Questionnaire Full-Editor
    let qHtml = '';
    if (log.results && Object.keys(log.results).length > 0) {
        Object.keys(log.results).forEach(key => {
            const pointData = log.results[key];
            const isPass = pointData.result === 'Pass';
            const isFail = pointData.result === 'Fail';
            
            qHtml += `
                <div class="flex justify-between items-center border-b border-gray-100 py-2">
                    <span class="text-[10px] font-medium text-gray-700 w-2/3 pr-2">${pointData.question}</span>
                    <div class="flex space-x-1 w-1/3 justify-end ecl-radio-group">
                        <label class="cursor-pointer">
                            <input type="radio" name="ecl_${key}" data-question="${pointData.question}" value="Pass" class="smart-radio pass-radio hidden" ${isPass ? 'checked' : ''}>
                            <div class="bg-gray-100 text-gray-400 px-2 py-1 rounded text-[9px] font-bold transition-all text-center">Pass</div>
                        </label>
                        <label class="cursor-pointer">
                            <input type="radio" name="ecl_${key}" data-question="${pointData.question}" value="Fail" class="smart-radio fail-radio hidden" ${isFail ? 'checked' : ''}>
                            <div class="bg-gray-100 text-gray-400 px-2 py-1 rounded text-[9px] font-bold transition-all text-center">Fail</div>
                        </label>
                    </div>
                </div>
            `;
        });
    } else {
        qHtml = '<div class="text-[10px] text-gray-400 italic py-2">No detailed points recorded in legacy log.</div>';
    }
    
    document.getElementById('ecl-dynamic-questions-container').innerHTML = qHtml;
    document.getElementById('edit-checklist-modal').classList.remove('hidden');
};

window.deleteChecklistLog = function (docId) {
    if (confirm("Delete this checklist record?")) firebase.firestore().collection("daily_logs").doc(docId).delete();
};


// =========================================================
// 7. SMART HELPDESK & BASE64 IMAGE COMPRESSION
// =========================================================
function initComplaintsLog() {
    const db = firebase.firestore();
    const issueForm = document.getElementById('issue-form');
    
    if (issueForm) {
        issueForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const btn = document.getElementById('iss-submit-btn');
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Creating Work Order...';
            btn.disabled = true;
            
            const fileInput = document.getElementById('iss-photo');
            let base64Photo = null;
            if(fileInput.files.length > 0) {
                try {
                    base64Photo = await compressImage(fileInput.files[0]);
                } catch(err) {
                    console.error("Image processing error", err);
                }
            }

            db.collection("complaints").add({
                amenity: document.getElementById('iss-amenity').value,
                department: document.getElementById('iss-dept').value,
                description: document.getElementById('iss-desc').value,
                priority: document.getElementById('iss-priority').value,
                informedTo: document.getElementById('iss-informed').value || '',
                photoBase64: base64Photo,
                status: 'Open',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                this.reset();
                btn.innerHTML = '<i class="fas fa-ticket-alt"></i> Create Work Order Ticket';
                btn.disabled = false;
            });
        });
    }

    db.collection("complaints").orderBy("createdAt", "desc").onSnapshot(snap => {
        MASTER_COMPLAINTS_CACHE = [];
        let openCount = 0;

        snap.forEach(doc => {
            const d = doc.data();
            d.docId = doc.id;
            MASTER_COMPLAINTS_CACHE.push(d);
            if (d.status !== 'Resolved') openCount++;
        });

        const dashIssues = document.getElementById('dash-issues');
        if (dashIssues) dashIssues.innerText = openCount;

        renderComplaints(MASTER_COMPLAINTS_CACHE);
    });
}

function renderComplaints(logs) {
    let html = '';
    logs.forEach(d => {
        const isResolved = d.status === 'Resolved';
        html += `
            <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-2 text-xs ${isResolved ? 'opacity-60' : ''}">
                <div class="flex justify-between items-start">
                    <div>
                        <span class="text-[9px] font-bold text-rose-600 uppercase tracking-wider">${d.department} • ${d.priority}</span>
                        <h4 class="font-bold text-gray-900 text-sm">${d.amenity}</h4>
                        ${d.informedTo ? `<div class="text-[9px] text-gray-500 mt-0.5"><i class="fas fa-info-circle mr-1"></i>Informed: <strong>${d.informedTo}</strong></div>` : ''}
                    </div>
                    <span class="text-[9px] font-black uppercase px-2 py-0.5 rounded border ${isResolved ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-rose-100 text-rose-700 border-rose-200'}">${d.status}</span>
                </div>
                <p class="text-gray-700 text-xs bg-slate-50 p-2 rounded border border-slate-100">${d.description}</p>
                ${d.photoBase64 ? `<div class="mt-2"><img src="${d.photoBase64}" class="h-24 rounded border border-gray-300 object-cover shadow-sm"></div>` : ''}
                <div class="flex justify-between items-center pt-3 mt-2 border-t border-gray-100">
                    ${!isResolved ? `<button onclick="resolveTicket('${d.docId}')" class="text-emerald-600 font-bold hover:underline text-xs bg-emerald-50 px-2 py-1.5 rounded"><i class="fas fa-check-circle mr-1"></i> Resolve</button>` : '<span class="text-[10px] text-gray-400 font-bold"><i class="fas fa-check mr-1"></i> Resolved</span>'}
                    <div class="flex gap-2">
                        <button onclick="openTicketModal('${d.docId}')" class="text-blue-600 font-bold hover:bg-blue-100 bg-blue-50 px-3 py-1.5 rounded text-xs transition"><i class="fas fa-edit mr-1"></i> Edit</button>
                        <button onclick="deleteTicket('${d.docId}')" class="text-rose-500 hover:text-rose-700 bg-rose-50 px-2 py-1.5 rounded text-xs"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
            </div>
        `;
    });
    const container = document.getElementById('issues-list');
    if (container) container.innerHTML = html || '<div class="text-center text-gray-400 py-4 text-xs">No tickets logged.</div>';
}

window.resolveTicket = function (id) {
    const note = prompt("Enter resolution notes:");
    if (note) {
        firebase.firestore().collection("complaints").doc(id).update({
            status: 'Resolved',
            resolutionNote: note,
            resolvedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    }
};

window.deleteTicket = function (id) {
    if (confirm("Delete ticket?")) firebase.firestore().collection("complaints").doc(id).delete();
};

window.openTicketModal = function (docId) {
    const ticket = MASTER_COMPLAINTS_CACHE.find(t => t.docId === docId);
    if (!ticket) return;
    document.getElementById('etk-id').value = ticket.docId;
    document.getElementById('etk-amenity').value = ticket.amenity || '';
    document.getElementById('etk-dept').value = ticket.department || 'General';
    document.getElementById('etk-priority').value = ticket.priority || 'Medium';
    document.getElementById('etk-status').value = ticket.status || 'Open';
    document.getElementById('etk-informed').value = ticket.informedTo || '';
    document.getElementById('etk-desc').value = ticket.description || '';
    document.getElementById('etk-resnote').value = ticket.resolutionNote || '';
    document.getElementById('etk-existing-photo').value = ticket.photoBase64 || '';
    document.getElementById('etk-photo').value = ''; // Reset file input
    document.getElementById('edit-ticket-modal').classList.remove('hidden');
};


// =========================================================
// 8. SMART BOOKINGS
// =========================================================
function initSmartBookings() {
    const db = firebase.firestore();

    ['bk-rent', 'bk-deposit', 'bk-gst', 'bk-paid'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', calculateBookingFinancials);
    });

    const bkForm = document.getElementById('booking-form');
    if (bkForm) {
        bkForm.addEventListener('submit', function (e) {
            e.preventDefault();
            db.collection("bookings").add({
                amenity: document.getElementById('bk-amenity').value,
                reqDate: document.getElementById('bk-req-date').value,
                bookingDate: document.getElementById('bk-date').value,
                timeFrom: document.getElementById('bk-time-from').value,
                timeTo: document.getElementById('bk-time-to').value,
                resident: document.getElementById('bk-name').value,
                contact: document.getElementById('bk-contact').value,
                wing: document.getElementById('bk-wing').value,
                flat: document.getElementById('bk-flat').value,
                rent: parseFloat(document.getElementById('bk-rent').value) || 0,
                deposit: parseFloat(document.getElementById('bk-deposit').value) || 0,
                gst: parseFloat(document.getElementById('bk-gst').value) || 0,
                total: parseFloat(document.getElementById('bk-total').value) || 0,
                paid: parseFloat(document.getElementById('bk-paid').value) || 0,
                balance: parseFloat(document.getElementById('bk-balance').value) || 0,
                status: document.getElementById('bk-status').value,
                notes: document.getElementById('bk-notes').value,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                this.reset();
            });
        });
    }

    db.collection("bookings").orderBy("bookingDate", "desc").onSnapshot(snap => {
        MASTER_BOOKINGS_CACHE = [];
        let todayCount = 0;
        const todayStr = new Date().toISOString().split('T')[0];

        snap.forEach(doc => {
            const d = doc.data();
            d.docId = doc.id;
            MASTER_BOOKINGS_CACHE.push(d);
            if (d.bookingDate === todayStr && d.status !== 'Cancelled') todayCount++;
        });

        const dashBk = document.getElementById('dash-bookings');
        if (dashBk) dashBk.innerText = todayCount;

        renderBookings(MASTER_BOOKINGS_CACHE);
    });
}

function calculateBookingFinancials() {
    const rent = parseFloat(document.getElementById('bk-rent').value) || 0;
    const dep = parseFloat(document.getElementById('bk-deposit').value) || 0;
    const gst = parseFloat(document.getElementById('bk-gst').value) || 0;
    const paid = parseFloat(document.getElementById('bk-paid').value) || 0;

    const total = rent + dep + gst;
    const balance = Math.max(0, total - paid);

    document.getElementById('bk-total').value = total;
    document.getElementById('bk-balance').value = balance;
}

function renderBookings(logs) {
    let html = '';
    logs.forEach(d => {
        let statusBadge = d.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                          d.status === 'Cancelled' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                          'bg-amber-100 text-amber-800 border-amber-200';
                          
        html += `
            <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-xs space-y-1.5 ${d.status === 'Cancelled' ? 'opacity-60' : ''}">
                <div class="flex justify-between items-start">
                    <span class="font-bold text-gray-900 text-sm">${d.amenity}</span>
                    <span class="text-[9px] font-black uppercase px-2 py-0.5 rounded border ${statusBadge}">${d.status}</span>
                </div>
                <div class="text-gray-600 font-medium">${d.resident} (Wing ${d.wing} - Flat ${d.flat}) • ${d.contact}</div>
                <div class="text-[10px] text-gray-500 font-bold bg-slate-50 px-2 py-1 rounded inline-block"><i class="far fa-calendar-alt text-blue-500 mr-1"></i> ${d.bookingDate} (${d.timeFrom} - ${d.timeTo})</div>
                <div class="bg-slate-50 p-2 rounded border border-gray-200 flex justify-between font-bold text-[10px] mt-2">
                    <span>Total: ₹${d.total}</span>
                    <span class="text-emerald-700">Paid: ₹${d.paid}</span>
                    <span class="${d.balance > 0 ? 'text-rose-600' : 'text-gray-500'}">Balance: ₹${d.balance}</span>
                </div>
                <div class="flex justify-between items-center pt-2 mt-2 border-t border-gray-100">
                    <button onclick="editBookingModal('${d.docId}')" class="text-blue-600 font-bold bg-blue-50 px-3 py-1.5 rounded hover:bg-blue-100 transition flex items-center gap-1"><i class="fas fa-edit"></i> Edit Booking</button>
                    <button onclick="deleteBooking('${d.docId}')" class="text-rose-500 hover:text-rose-700 bg-rose-50 px-3 py-1.5 rounded"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
        `;
    });
    const container = document.getElementById('bookings-list');
    if (container) container.innerHTML = html || '<div class="text-center text-gray-400 py-4 text-xs">No bookings logged.</div>';
}

window.deleteBooking = function (id) {
    if (confirm("Cancel and delete booking?")) firebase.firestore().collection("bookings").doc(id).delete();
};

window.editBookingModal = function(docId) {
    const booking = MASTER_BOOKINGS_CACHE.find(b => b.docId === docId);
    if(!booking) return;
    document.getElementById('eb-id').value = booking.docId;
    document.getElementById('eb-name').value = booking.resident || '';
    document.getElementById('eb-contact').value = booking.contact || '';
    document.getElementById('eb-date').value = booking.bookingDate || '';
    document.getElementById('eb-total').value = booking.total || 0;
    document.getElementById('eb-paid').value = booking.paid || 0;
    document.getElementById('eb-balance').value = booking.balance || 0;
    document.getElementById('eb-status').value = booking.status || 'Pending';
    document.getElementById('eb-mess').checked = booking.checkoutMess || false;
    document.getElementById('eb-damage').checked = booking.checkoutDamage || false;
    document.getElementById('eb-deducted').value = booking.checkoutDeducted || 0;
    document.getElementById('eb-refunded').value = booking.checkoutRefunded || 0;
    document.getElementById('eb-checkout-notes').value = booking.checkoutNotes || '';
    document.getElementById('edit-booking-modal').classList.remove('hidden');
};


// =========================================================
// 9. HOUSEKEEPING & DEEP CLEANING
// =========================================================
function initHKSchedule() {
    const db = firebase.firestore();
    const hkForm = document.getElementById('hk-form');
    if (hkForm) {
        hkForm.addEventListener('submit', function (e) {
            e.preventDefault();
            db.collection("hk_tasks").add({
                amenity: document.getElementById('hk-amenity').value,
                taskType: document.getElementById('hk-type').value,
                staffAssigned: document.getElementById('hk-staff').value,
                date: document.getElementById('hk-date').value,
                timeSlot: document.getElementById('hk-time').value || '',
                instructions: document.getElementById('hk-instructions').value || '',
                status: 'Pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                this.reset();
            });
        });
    }

    db.collection("hk_tasks").orderBy("createdAt", "desc").onSnapshot(snap => {
        MASTER_HK_CACHE = [];
        snap.forEach(doc => {
            const d = doc.data();
            d.docId = doc.id;
            MASTER_HK_CACHE.push(d);
        });
        renderHKTasks(MASTER_HK_CACHE);
    });
}

function renderHKTasks(logs) {
    let html = '';
    logs.forEach(d => {
        const isDone = d.status === 'Completed';
        html += `
            <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col text-xs ${isDone ? 'opacity-60' : ''}">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h4 class="font-bold text-gray-900 text-sm">${d.amenity}</h4>
                        <p class="text-[10px] text-gray-500 font-bold uppercase mt-0.5">${d.taskType}</p>
                    </div>
                    <span class="text-[9px] font-black uppercase px-2 py-0.5 rounded border ${isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}">${d.status}</span>
                </div>
                
                <div class="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded mb-2 border border-slate-100">
                    <div><span class="text-[8px] uppercase text-gray-400 block">Assigned To</span><span class="font-bold">${d.staffAssigned}</span></div>
                    <div><span class="text-[8px] uppercase text-gray-400 block">Schedule</span><span class="font-bold">${d.date} ${d.timeSlot ? '('+d.timeSlot+')' : ''}</span></div>
                </div>
                
                ${d.instructions ? `<div class="text-[10px] text-gray-600 mb-2 italic"><strong>Note:</strong> ${d.instructions}</div>` : ''}

                <div class="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                    ${!isDone ? `<button onclick="completeHKTask('${d.docId}')" class="text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded hover:bg-emerald-100 transition"><i class="fas fa-check mr-1"></i> Mark Done</button>` : '<span></span>'}
                    <div class="flex gap-2">
                        <button onclick="openHKModal('${d.docId}')" class="text-blue-600 bg-blue-50 px-3 py-1.5 rounded hover:bg-blue-100 font-bold"><i class="fas fa-edit"></i> Edit</button>
                        <button onclick="deleteHKTask('${d.docId}')" class="text-rose-500 bg-rose-50 px-2 py-1.5 rounded hover:text-rose-700"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
            </div>
        `;
    });
    const container = document.getElementById('hk-list');
    if (container) container.innerHTML = html || '<div class="text-center text-gray-400 py-4 text-xs">No cleaning tasks scheduled.</div>';
}

window.completeHKTask = function (id) {
    firebase.firestore().collection("hk_tasks").doc(id).update({ status: 'Completed' });
};

window.deleteHKTask = function (id) {
    if (confirm("Delete cleaning task?")) firebase.firestore().collection("hk_tasks").doc(id).delete();
};

window.openHKModal = function(docId) {
    const task = MASTER_HK_CACHE.find(t => t.docId === docId);
    if(!task) return;
    document.getElementById('ehk-id').value = task.docId;
    document.getElementById('ehk-amenity').value = task.amenity || '';
    document.getElementById('ehk-type').value = task.taskType || 'Routine Cleaning';
    document.getElementById('ehk-status').value = task.status || 'Pending';
    document.getElementById('ehk-staff').value = task.staffAssigned || '';
    document.getElementById('ehk-date').value = task.date || '';
    document.getElementById('ehk-time').value = task.timeSlot || '';
    document.getElementById('ehk-instructions').value = task.instructions || '';
    document.getElementById('edit-hk-modal').classList.remove('hidden');
};


// =========================================================
// 10. INVENTORY SYSTEM WITH FULL ORDER LIFECYCLE
// =========================================================
function initInventorySystem() {
    const db = firebase.firestore();

    const invForm = document.getElementById('inventory-form');
    if (invForm) {
        invForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const btn = document.getElementById('inv-submit-btn');
            btn.disabled = true;

            db.collection("inventory").add({
                name: document.getElementById('inv-name').value,
                category: document.getElementById('inv-category').value,
                unit: document.getElementById('inv-unit').value,
                quantity: parseInt(document.getElementById('inv-qty').value) || 0,
                threshold: parseInt(document.getElementById('inv-threshold').value) || 5,
                orderedQty: 0,
                receivedQty: 0,
                remainingQty: 0,
                orderStatus: 'None',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                this.reset();
                btn.disabled = false;
            });
        });
    }

    const orderForm = document.getElementById('order-form');
    if (orderForm) {
        orderForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const docId = document.getElementById('ord-item-id').value;
            const orderQty = parseInt(document.getElementById('ord-qty').value) || 0;
            const supplier = document.getElementById('ord-supplier').value;
            const orderDate = document.getElementById('ord-date').value;

            db.collection("inventory").doc(docId).update({
                orderedQty: orderQty,
                receivedQty: 0,
                remainingQty: orderQty,
                orderStatus: 'Pending',
                supplier: supplier,
                orderDate: orderDate
            }).then(() => {
                this.reset();
                document.getElementById('add-order-modal').classList.add('hidden');
            });
        });
    }

    const receiveForm = document.getElementById('receive-stock-form');
    if (receiveForm) {
        receiveForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const docId = document.getElementById('rec-item-id').value;
            const qtyReceivedNow = parseInt(document.getElementById('rec-qty').value) || 0;

            const item = MASTER_INV_CACHE.find(i => i.docId === docId);
            if (!item) return;

            const newReceivedTotal = (item.receivedQty || 0) + qtyReceivedNow;
            const newRemaining = Math.max(0, (item.orderedQty || 0) - newReceivedTotal);
            const newStock = (item.quantity || 0) + qtyReceivedNow;
            const newStatus = newRemaining === 0 ? 'Fulfilled' : 'Partially Received';

            await db.collection("inventory").doc(docId).update({
                quantity: newStock,
                receivedQty: newReceivedTotal,
                remainingQty: newRemaining,
                orderStatus: newStatus,
                lastReceivedDate: new Date().toISOString().split('T')[0]
            });

            this.reset();
            document.getElementById('receive-stock-modal').classList.add('hidden');
        });
    }

    db.collection("inventory").orderBy("name").onSnapshot(snap => {
        MASTER_INV_CACHE = [];
        let lowStockCount = 0;
        let orderOpts = '<option value="">Select inventory item...</option>';

        snap.forEach(doc => {
            const d = doc.data();
            d.docId = doc.id;
            MASTER_INV_CACHE.push(d);
            if (d.quantity <= d.threshold) lowStockCount++;
            orderOpts += `<option value="${d.docId}">${d.name} (Current: ${d.quantity} ${d.unit})</option>`;
        });

        const dashLow = document.getElementById('dash-low-stock');
        if (dashLow) dashLow.innerText = lowStockCount;
        const countBadge = document.getElementById('inv-tracker-count');
        if (countBadge) countBadge.innerText = `${MASTER_INV_CACHE.length} Items`;

        const ordSelect = document.getElementById('ord-item-id');
        if (ordSelect) ordSelect.innerHTML = orderOpts;

        renderInventory(MASTER_INV_CACHE);
    });
}

function renderInventory(logs) {
    let html = '';
    logs.forEach(d => {
        const isLow = d.quantity <= d.threshold;
        const hasActiveOrder = d.orderStatus && d.orderStatus !== 'None' && d.orderStatus !== 'Fulfilled';

        html += `
            <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative space-y-2">
                <div class="flex justify-between items-start">
                    <div>
                        <h4 class="font-bold text-gray-900 text-sm leading-tight">${d.name}</h4>
                        <p class="text-[9px] uppercase font-bold text-gray-400">${d.category} • Alert at ${d.threshold} ${d.unit}</p>
                    </div>
                    <span class="${isLow ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'} text-[9px] font-black uppercase px-2 py-0.5 rounded">
                        ${isLow ? 'Low Stock' : 'Optimal'}
                    </span>
                </div>

                <div class="bg-slate-50 p-2.5 rounded-lg border border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
                    <div>
                        <span class="text-[8px] uppercase font-bold text-gray-400 block">On Hand</span>
                        <span class="font-black text-sm text-gray-800">${d.quantity} ${d.unit}</span>
                    </div>
                    <div>
                        <span class="text-[8px] uppercase font-bold text-gray-400 block">Order Status</span>
                        <span class="font-bold text-[10px] ${hasActiveOrder ? 'text-amber-600' : 'text-gray-500'}">${d.orderStatus || 'None'}</span>
                    </div>
                </div>

                ${hasActiveOrder ? `
                    <div class="bg-amber-50 p-2 rounded border border-amber-200 text-[10px] space-y-1">
                        <div class="flex justify-between text-amber-800 font-bold">
                            <span>Ordered: ${d.orderedQty}</span>
                            <span>Recv: ${d.receivedQty}</span>
                            <span>Remaining: ${d.remainingQty}</span>
                        </div>
                        <button onclick="openReceiveModal('${d.docId}')" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1 rounded text-[10px] transition">
                            <i class="fas fa-truck-loading mr-1"></i> Receive Pending Delivery
                        </button>
                    </div>
                ` : ''}

                <div class="flex justify-between items-center pt-2 border-t border-gray-100">
                    <button onclick="openOrderModalFor('${d.docId}')" class="text-blue-600 hover:text-blue-800 text-xs font-bold bg-blue-50 px-3 py-1.5 rounded">
                        <i class="fas fa-cart-plus mr-1"></i> Order
                    </button>
                    <button onclick="deleteInvItem('${d.docId}')" class="text-rose-500 hover:text-rose-700 text-xs bg-rose-50 px-2 py-1.5 rounded">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        `;
    });
    const container = document.getElementById('inventory-list');
    if (container) container.innerHTML = html || '<div class="text-center text-gray-400 py-4 text-xs">No stock items found.</div>';
}

window.openOrderModalFor = function (docId) {
    document.getElementById('ord-item-id').value = docId;
    document.getElementById('ord-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('add-order-modal').classList.remove('hidden');
};

window.openReceiveModal = function (docId) {
    const item = MASTER_INV_CACHE.find(i => i.docId === docId);
    if (!item) return;
    document.getElementById('rec-item-id').value = item.docId;
    document.getElementById('rec-item-name').value = item.name;
    document.getElementById('rec-remaining-qty').value = item.remainingQty || 0;
    document.getElementById('rec-qty').value = item.remainingQty || 1;
    document.getElementById('receive-stock-modal').classList.remove('hidden');
};

window.deleteInvItem = function (id) {
    if (confirm("Delete item record?")) firebase.firestore().collection("inventory").doc(id).delete();
};


// =========================================================
// POOL LOGS MODULE (Missing Block)
// =========================================================
function initPoolLogs() {
    const db = firebase.firestore();
    const pForm = document.getElementById('pool-form');
    if (pForm) {
        pForm.addEventListener('submit', function (e) {
            e.preventDefault();
            db.collection("pool_logs").add({
                amenity: document.getElementById('pl-amenity').value,
                chlorine: parseFloat(document.getElementById('pl-chlorine').value) || 1.5,
                ph: parseFloat(document.getElementById('pl-ph').value) || 7.4,
                temp: parseFloat(document.getElementById('pl-temp').value) || 28.0,
                clarity: document.getElementById('pl-clarity').value,
                dateString: new Date().toISOString().split('T')[0],
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                this.reset();
            });
        });
    }

    db.collection("pool_logs").orderBy("createdAt", "desc").onSnapshot(snap => {
        MASTER_POOL_CACHE = [];
        let todayCount = 0;
        const todayStr = new Date().toISOString().split('T')[0];

        snap.forEach(doc => {
            const d = doc.data();
            d.docId = doc.id;
            MASTER_POOL_CACHE.push(d);
            if (d.dateString === todayStr) todayCount++;
        });

        const dashPool = document.getElementById('dash-pool');
        if (dashPool) dashPool.innerText = todayCount;

        renderPoolLogs(MASTER_POOL_CACHE);
    });
}

window.filterPoolLogs = function() {
    const dateVal = document.getElementById('pl-date-filter').value;
    const searchVal = document.getElementById('pl-search').value.toLowerCase();
    let filtered = MASTER_POOL_CACHE.filter(d => {
        let matchesDate = !dateVal || d.dateString === dateVal;
        let matchesSearch = !searchVal || d.amenity.toLowerCase().includes(searchVal);
        return matchesDate && matchesSearch;
    });
    renderPoolLogs(filtered);
};

function renderPoolLogs(logs) {
    let html = '';
    logs.forEach(d => {
        const isSafe = (d.ph >= 7.2 && d.ph <= 7.8 && d.chlorine >= 1.0 && d.chlorine <= 3.0 && d.clarity === 'Clear');
        html += `
            <div class="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center text-xs">
                <div>
                    <h4 class="font-bold text-gray-900">${d.amenity}</h4>
                    <p class="text-[10px] text-gray-500">Cl: ${d.chlorine} ppm | pH: ${d.ph} | ${d.temp}°C | ${d.clarity}</p>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="text-[9px] font-black uppercase px-2 py-0.5 rounded border ${isSafe ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'}">
                        ${isSafe ? 'Balanced' : 'Action Req'}
                    </span>
                    <button onclick="openPoolModal('${d.docId}')" class="text-blue-500 hover:text-blue-700 p-1"><i class="fas fa-edit"></i></button>
                    <button onclick="deletePoolLog('${d.docId}')" class="text-rose-500 hover:text-rose-700 p-1"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
        `;
    });
    const container = document.getElementById('pool-list');
    if (container) container.innerHTML = html || '<div class="text-center text-gray-400 py-3 text-xs">No pool readings logged.</div>';
}

window.deletePoolLog = function (id) {
    if (confirm("Delete chemistry record?")) firebase.firestore().collection("pool_logs").doc(id).delete();
};

window.openPoolModal = function (docId) {
    const log = MASTER_POOL_CACHE.find(p => p.docId === docId);
    if (!log) return;
    document.getElementById('epl-id').value = log.docId;
    document.getElementById('epl-amenity').value = log.amenity || '';
    document.getElementById('epl-chlorine').value = log.chlorine || 1.5;
    document.getElementById('epl-ph').value = log.ph || 7.4;
    document.getElementById('epl-temp').value = log.temp || 28;
    document.getElementById('epl-clarity').value = log.clarity || 'Clear';
    document.getElementById('epl-date').value = log.dateString || '';
    document.getElementById('edit-pool-modal').classList.remove('hidden');
};



// =========================================================
// 11. STAFF MASTER & ATTENDANCE
// =========================================================
function initStaffSystem() {
    const db = firebase.firestore();

    const staffForm = document.getElementById('staff-form');
    if (staffForm) {
        staffForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const btn = document.getElementById('st-submit-btn');
            btn.disabled = true;

            db.collection("staff").add({
                staffId: document.getElementById('st-id').value.toUpperCase(),
                name: document.getElementById('st-name').value,
                contact: document.getElementById('st-contact').value,
                role: document.getElementById('st-role').value,
                shift: document.getElementById('st-shift').value,
                weeklyOff: document.getElementById('st-off').value,
                joiningDate: document.getElementById('st-joining').value,
                status: document.getElementById('st-status').value,
                responsibilities: document.getElementById('st-resp').value,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                this.reset();
                btn.disabled = false;
            });
        });
    }

    db.collection("staff").orderBy("name").onSnapshot(snap => {
        MASTER_STAFF_CACHE = [];
        let opts = '<option value="">Select Staff Member...</option>';

        snap.forEach(doc => {
            const d = doc.data();
            d.docId = doc.id;
            MASTER_STAFF_CACHE.push(d);
            opts += `<option value="${d.name}">${d.name} (${d.role} - Off: ${d.weeklyOff})</option>`;
        });

        ['att-staff', 'hk-staff'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = opts;
        });

        const tracker = document.getElementById('staff-tracker-count');
        if (tracker) tracker.innerText = `${MASTER_STAFF_CACHE.length} Personnel`;

        renderStaff(MASTER_STAFF_CACHE);
    });

    const attForm = document.getElementById('attendance-form');
    if (attForm) {
        attForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const staffName = document.getElementById('att-staff').value;
            const status = document.getElementById('att-status').value;
            const reason = document.getElementById('att-reason').value;
            const todayStr = new Date().toISOString().split('T')[0];

            const staffObj = MASTER_STAFF_CACHE.find(s => s.name === staffName);

            db.collection("attendance").add({
                staffName: staffName,
                staffId: staffObj ? staffObj.staffId : 'STF-00',
                role: staffObj ? staffObj.role : 'General',
                status: status,
                reason: reason,
                dateString: todayStr,
                timeIn: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                this.reset();
            });
        });
    }

    db.collection("attendance").orderBy("timeIn", "desc").onSnapshot(snap => {
        MASTER_ATT_CACHE = [];
        let presentCount = 0;
        const todayStr = new Date().toISOString().split('T')[0];

        snap.forEach(doc => {
            const d = doc.data();
            d.docId = doc.id;
            MASTER_ATT_CACHE.push(d);
            if (d.dateString === todayStr && d.status === 'Present') presentCount++;
        });

        const dashStaff = document.getElementById('dash-staff');
        if (dashStaff) dashStaff.innerText = presentCount;

        renderAttendance(MASTER_ATT_CACHE);
    });
}

function renderStaff(logs) {
    let html = '';
    logs.forEach(d => {
        html += `
            <div class="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center text-xs">
                <div>
                    <div class="flex items-center gap-2">
                        <span class="font-mono font-bold text-accent">${d.staffId || 'STF'}</span>
                        <h4 class="font-bold text-gray-900">${d.name}</h4>
                        <span class="text-[9px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold">${d.role}</span>
                    </div>
                    <div class="text-[10px] text-gray-500 mt-1">Shift: ${d.shift} • Off: <strong>${d.weeklyOff}</strong> • Phone: ${d.contact}</div>
                </div>
                <div class="flex items-center space-x-2">
                    <button onclick="openStaffModal('${d.docId}')" class="text-blue-500 hover:text-blue-700 p-1"><i class="fas fa-user-edit"></i></button>
                    <button onclick="deleteStaffMember('${d.docId}')" class="text-rose-500 hover:text-rose-700 p-1"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
        `;
    });
    const container = document.getElementById('staff-list');
    if (container) container.innerHTML = html || '<div class="text-center text-gray-400 py-3 text-xs">No staff registered.</div>';
}

function renderAttendance(logs) {
    let html = '';
    logs.forEach(d => {
        let statusBadge = d.status === 'Present' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
            d.status === 'Week Off' ? 'bg-blue-100 text-blue-700 border-blue-200' :
            d.status === 'Late' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-rose-100 text-rose-700 border-rose-200';

        html += `
            <div class="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex justify-between items-center text-xs">
                <div>
                    <div class="font-bold text-gray-900">${d.staffName}</div>
                    <div class="text-[10px] text-gray-400">${d.dateString} ${d.reason ? '• Reason: ' + d.reason : ''}</div>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="text-[10px] font-black uppercase px-2 py-0.5 rounded border ${statusBadge}">${d.status}</span>
                    <button onclick="openAttModal('${d.docId}')" class="text-blue-500 hover:text-blue-700 p-1"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteAttRecord('${d.docId}')" class="text-rose-500 hover:text-rose-700 p-1"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
        `;
    });
    const container = document.getElementById('attendance-list');
    if (container) container.innerHTML = html || '<div class="text-center text-gray-400 py-3 text-xs">No attendance logs.</div>';
}


// =========================================================
// STAFF & ATTENDANCE UTILITIES (Missing Block)
// =========================================================
window.filterStaff = function () {
    const roleVal = document.getElementById('st-role-filter').value;
    const searchVal = document.getElementById('st-search').value.toLowerCase();
    let filtered = MASTER_STAFF_CACHE.filter(d => {
        let matchesRole = !roleVal || d.role === roleVal;
        let matchesSearch = !searchVal || d.name.toLowerCase().includes(searchVal) || (d.staffId && d.staffId.toLowerCase().includes(searchVal));
        return matchesRole && matchesSearch;
    });
    renderStaff(filtered);
};

window.openStaffModal = function (docId) {
    const s = MASTER_STAFF_CACHE.find(item => item.docId === docId);
    if (!s) return;
    document.getElementById('est-docid').value = s.docId;
    document.getElementById('est-id').value = s.staffId || '';
    document.getElementById('est-name').value = s.name || '';
    document.getElementById('est-contact').value = s.contact || '';
    document.getElementById('est-role').value = s.role || 'Housekeeping';
    document.getElementById('est-shift').value = s.shift || 'Morning';
    document.getElementById('est-off').value = s.weeklyOff || 'Monday';
    document.getElementById('est-status').value = s.status || 'Active';
    document.getElementById('est-resp').value = s.responsibilities || '';
    document.getElementById('edit-staff-modal').classList.remove('hidden');
};

window.deleteStaffMember = function (id) {
    if (confirm("Remove staff member?")) firebase.firestore().collection("staff").doc(id).delete();
};

window.filterAttendance = function () {
    const dateVal = document.getElementById('att-date-filter').value;
    const searchVal = document.getElementById('att-search').value.toLowerCase();
    let filtered = MASTER_ATT_CACHE.filter(d => {
        let matchesDate = !dateVal || d.dateString === dateVal;
        let matchesSearch = !searchVal || d.staffName.toLowerCase().includes(searchVal);
        return matchesDate && matchesSearch;
    });
    renderAttendance(filtered);
};

window.openAttModal = function (docId) {
    const a = MASTER_ATT_CACHE.find(item => item.docId === docId);
    if (!a) return;
    document.getElementById('eatt-id').value = a.docId;
    document.getElementById('eatt-staff').value = a.staffName || '';
    document.getElementById('eatt-date').value = a.dateString || '';
    document.getElementById('eatt-status').value = a.status || 'Present';
    document.getElementById('eatt-reason').value = a.reason || '';
    document.getElementById('edit-att-modal').classList.remove('hidden');
};

window.deleteAttRecord = function (id) {
    if (confirm("Delete attendance entry?")) firebase.firestore().collection("attendance").doc(id).delete();
};



// =========================================================
// 12. UPGRADED EXECUTIVE REPORT (8-SECTION SINGLE WORKFLOW)
// =========================================================
window.setReportRange = function (type) {
    const end = new Date();
    let start = new Date();
    if (type === 'daily') {
        // start remains today
    } else if (type === 'weekly') {
        start.setDate(end.getDate() - 7);
    } else if (type === 'monthly') {
        start.setMonth(end.getMonth() - 1);
    }
    document.getElementById('rep-start').value = start.toISOString().split('T')[0];
    document.getElementById('rep-end').value = end.toISOString().split('T')[0];
};

window.executeCompleteReportWorkflow = async function () {
    const startVal = document.getElementById('rep-start').value;
    const endVal = document.getElementById('rep-end').value;
    if (!startVal || !endVal) return alert("Please select date range.");

    const btn = document.getElementById('btn-generate-report');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Compiling & Archiving...';
    btn.disabled = true;

    // Filter datasets
    const isWithinRange = (dateStr) => dateStr >= startVal && dateStr <= endVal;
    const checklistLogs = MASTER_CHECKLIST_LOGS.filter(c => isWithinRange(c.dateString));
    const openIssues = MASTER_COMPLAINTS_CACHE.filter(c => c.status !== 'Resolved');
    const bookings = MASTER_BOOKINGS_CACHE.filter(b => isWithinRange(b.bookingDate) && b.status !== 'Cancelled');
    const attendance = MASTER_ATT_CACHE.filter(a => isWithinRange(a.dateString));
    const inventory = MASTER_INV_CACHE;
    const poolLogs = MASTER_POOL_CACHE.filter(p => isWithinRange(p.dateString));
    const customRemarks = document.getElementById('rep-custom-notes').value.trim();

    // 1. Amenities Overview
    document.getElementById('rep-am-stilt').innerText = ALL_AMENITIES_CACHE.filter(a => a.category === 'Upper Stilt').length;
    document.getElementById('rep-am-p2').innerText = ALL_AMENITIES_CACHE.filter(a => a.category === 'P2 Level').length;
    document.getElementById('rep-am-sky').innerText = ALL_AMENITIES_CACHE.filter(a => a.category === 'Skyzone 40th Floor').length;

    // 2. Tasks Done
    let tasksHtml = '';
    checklistLogs.forEach(c => {
        const symbol = c.hasIssues ? '☐' : '☑';
        const color = c.hasIssues ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold';
        tasksHtml += `
            <div class="flex justify-between items-center py-1 border-b border-gray-100">
                <span class="text-gray-800">${symbol} <strong>${c.amenity}</strong></span>
                <span class="text-[10px] ${color}">${c.hasIssues ? 'Audit Failed (' + c.failedPoints + ')' : 'Audit Verified'}</span>
            </div>
        `;
    });
    document.getElementById('rep-tasks-container').innerHTML = tasksHtml || '<div class="text-gray-400 italic">No checklist inspections recorded in this period.</div>';

    // 3. Open Issues (Includes Base64 Images)
    let issuesHtml = '';
    openIssues.forEach(i => {
        issuesHtml += `
            <div class="p-2 bg-rose-50 rounded border border-rose-200">
                <div class="flex justify-between font-bold text-rose-800">
                    <span>${i.amenity} — ${i.department}</span>
                    <span class="text-[9px] uppercase">${i.priority}</span>
                </div>
                <p class="text-gray-700 text-[10px] mt-0.5">${i.description}</p>
                ${i.photoBase64 ? `<div class="mt-1"><img src="${i.photoBase64}" class="h-16 rounded border border-gray-300 object-cover"></div>` : ''}
            </div>
        `;
    });
    document.getElementById('rep-issues-container').innerHTML = issuesHtml || '<div class="text-gray-400 italic">All work orders resolved. No open tickets.</div>';

    // 4. Bookings Table
    let bkHtml = '';
    bookings.forEach(b => {
        bkHtml += `
            <tr class="border-b border-gray-200">
                <td class="p-1.5">${b.bookingDate} (${b.timeFrom}-${b.timeTo})</td>
                <td class="p-1.5 font-bold">${b.amenity}</td>
                <td class="p-1.5">${b.resident} (${b.contact})</td>
                <td class="p-1.5">₹${b.total}</td>
                <td class="p-1.5">₹${b.paid} / ₹${b.balance}</td>
                <td class="p-1.5 font-bold">${b.status}</td>
            </tr>
        `;
    });
    document.getElementById('rep-bookings-tbody').innerHTML = bkHtml || '<tr><td colspan="6" class="p-2 text-center text-gray-400">No facility reservations.</td></tr>';

    // 5. Staff Attendance Table
    let attHtml = '';
    attendance.forEach(a => {
        let statusStyle = a.status === 'Week Off' ? 'text-blue-600 font-bold' : a.status === 'Absent' ? 'text-rose-600 font-bold' : 'text-emerald-600';
        attHtml += `
            <tr class="border-b border-gray-200">
                <td class="p-1.5 font-medium">${a.staffName}</td>
                <td class="p-1.5">${a.role || 'Staff'}</td>
                <td class="p-1.5 ${statusStyle}">${a.status}</td>
                <td class="p-1.5 text-gray-500">${a.reason || '—'}</td>
            </tr>
        `;
    });
    document.getElementById('rep-attendance-tbody').innerHTML = attHtml || '<tr><td colspan="4" class="p-2 text-center text-gray-400">No attendance records.</td></tr>';

    // 6. Inventory Lifecycle Table
    let invHtml = '';
    inventory.forEach(i => {
        invHtml += `
            <tr class="border-b border-gray-200">
                <td class="p-1.5 font-medium">${i.name}</td>
                <td class="p-1.5 font-bold text-gray-900">${i.quantity} ${i.unit}</td>
                <td class="p-1.5">${i.orderedQty || 0}</td>
                <td class="p-1.5">${i.receivedQty || 0}</td>
                <td class="p-1.5 font-bold ${i.remainingQty > 0 ? 'text-amber-600' : 'text-gray-500'}">${i.remainingQty || 0}</td>
                <td class="p-1.5 font-bold text-[9px] uppercase">${i.orderStatus || 'None'}</td>
            </tr>
        `;
    });
    document.getElementById('rep-inventory-tbody').innerHTML = invHtml || '<tr><td colspan="6" class="p-2 text-center text-gray-400">No inventory logged.</td></tr>';

    // 7. Pool Chemistry Table
    let poolHtml = '';
    poolLogs.forEach(p => {
        let isSafe = (p.ph >= 7.2 && p.ph <= 7.8 && p.chlorine >= 1.0 && p.chlorine <= 3.0 && p.clarity === 'Clear');
        poolHtml += `
            <tr class="border-b border-gray-200">
                <td class="p-1.5 font-bold">${p.amenity}</td>
                <td class="p-1.5">${p.chlorine}</td>
                <td class="p-1.5">${p.ph}</td>
                <td class="p-1.5">${p.temp}</td>
                <td class="p-1.5">${p.clarity}</td>
                <td class="p-1.5 font-bold ${isSafe ? 'text-emerald-600' : 'text-amber-600'}">${isSafe ? 'Safe' : 'Action Req'}</td>
            </tr>
        `;
    });
    document.getElementById('rep-pool-tbody').innerHTML = poolHtml || '<tr><td colspan="6" class="p-2 text-center text-gray-400">No pool logs recorded.</td></tr>';

    // 8. Executive Remarks
    const remarksEl = document.getElementById('rep-remarks-display');
    if (customRemarks) {
        remarksEl.innerText = customRemarks;
        remarksEl.classList.remove('italic', 'text-gray-400');
    } else {
        remarksEl.innerText = "No operational exceptions noted for this executive reporting cycle.";
        remarksEl.classList.add('italic', 'text-gray-400');
    }

    document.getElementById('rep-doc-daterange').innerText = `Period: ${startVal} to ${endVal}`;
    document.getElementById('rep-doc-generatedat').innerText = `Generated: ${new Date().toLocaleString()}`;

    // Idempotent Database Archiving
    const reportDocId = `rep_${startVal}_${endVal}`;
    const reportData = {
        title: `Operations Summary (${startVal} to ${endVal})`,
        startDate: startVal,
        endDate: endVal,
        amenitiesCount: ALL_AMENITIES_CACHE.length,
        tasksCompleted: checklistLogs.length,
        openIssues: openIssues.length,
        totalBookings: bookings.length,
        remarks: customRemarks,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    await firebase.firestore().collection("executive_reports").doc(reportDocId).set(reportData, { merge: true });

    btn.innerHTML = '<i class="fas fa-file-pdf text-rose-400"></i> Generate, Archive & Print Executive Report';
    btn.disabled = false;

    window.print();
};

window.toggleReportDrawer = function () {
    const drawer = document.getElementById('rep-drawer');
    const chevron = document.getElementById('rep-drawer-chevron');
    if (drawer.classList.contains('hidden')) {
        drawer.classList.remove('hidden');
        chevron.classList.add('rotate-180');
        loadReportArchive();
    } else {
        drawer.classList.add('hidden');
        chevron.classList.remove('rotate-180');
    }
};

function loadReportArchive() {
    firebase.firestore().collection("executive_reports").orderBy("createdAt", "desc").onSnapshot(snap => {
        let html = '';
        snap.forEach(doc => {
            const d = doc.data();
            html += `
                <div class="bg-white p-3 rounded-lg border border-gray-200 shadow-sm text-xs">
                    <div class="font-bold text-gray-900">${d.title}</div>
                    <div class="text-[10px] text-gray-400">Tasks: ${d.tasksCompleted} | Issues: ${d.openIssues} | Bookings: ${d.totalBookings}</div>
                </div>
            `;
        });
        document.getElementById('report-history-list').innerHTML = html || '<div class="text-gray-400 text-xs text-center py-2">No archived reports.</div>';
    });
}

// =========================================================
// 13. AUTOMATED 45 + 30-DAY DATA RETENTION STRATEGY
// =========================================================
function runDataRetentionPolicy() {
    const db = firebase.firestore();
    const now = Date.now();
    const operationalBoundary = new Date(now - (45 * 24 * 60 * 60 * 1000));
    const reportArchiveBoundary = new Date(now - (75 * 24 * 60 * 60 * 1000));

    const purgeCollectionOlderThan = (collectionName, dateField, boundaryDate) => {
        db.collection(collectionName).where(dateField, "<", boundaryDate).get()
            .then(snapshot => {
                if (snapshot.empty) return;
                const batch = db.batch();
                snapshot.forEach(doc => batch.delete(doc.ref));
                batch.commit().then(() => {
                    console.log(`Retention Engine: Purged ${snapshot.size} expired records from ${collectionName}.`);
                });
            })
            .catch(err => console.warn(`Retention notice for ${collectionName}:`, err));
    };

    purgeCollectionOlderThan("daily_logs", "createdAt", operationalBoundary);
    purgeCollectionOlderThan("pool_logs", "createdAt", operationalBoundary);
    purgeCollectionOlderThan("hk_tasks", "createdAt", operationalBoundary);
    purgeCollectionOlderThan("attendance", "timeIn", operationalBoundary);
    purgeCollectionOlderThan("complaints", "resolvedAt", operationalBoundary);
    purgeCollectionOlderThan("executive_reports", "createdAt", reportArchiveBoundary);
}


// =========================================================
// MISSING SEARCH & FILTER UTILITIES
// =========================================================

window.filterChecklistHistory = function() {
    const dateVal = document.getElementById('history-date-filter').value;
    const searchVal = document.getElementById('history-search').value.toLowerCase();
    let filtered = MASTER_CHECKLIST_LOGS.filter(d => {
        const isoDate = d.createdAt ? d.createdAt.toDate().toISOString().split('T')[0] : d.dateString;
        let matchesDate = !dateVal || isoDate === dateVal || d.dateString === dateVal;
        let matchesSearch = !searchVal || (d.amenity && d.amenity.toLowerCase().includes(searchVal)) || (d.inspector && d.inspector.toLowerCase().includes(searchVal));
        return matchesDate && matchesSearch;
    });
    renderChecklistHistory(filtered);
};

window.filterComplaints = function() {
    const dateVal = document.getElementById('iss-date-filter').value;
    const searchVal = document.getElementById('iss-search').value.toLowerCase();
    let filtered = MASTER_COMPLAINTS_CACHE.filter(d => {
        const isoDate = d.createdAt ? d.createdAt.toDate().toISOString().split('T')[0] : '';
        let matchesDate = !dateVal || isoDate === dateVal;
        let matchesSearch = !searchVal || (d.amenity && d.amenity.toLowerCase().includes(searchVal)) || (d.description && d.description.toLowerCase().includes(searchVal));
        return matchesDate && matchesSearch;
    });
    renderComplaints(filtered);
};

window.filterBookings = function() {
    const dateVal = document.getElementById('bk-date-filter').value;
    const searchVal = document.getElementById('bk-search').value.toLowerCase();
    let filtered = MASTER_BOOKINGS_CACHE.filter(d => {
        let matchesDate = !dateVal || d.bookingDate === dateVal;
        let matchString = `${d.resident} ${d.flat} ${d.wing} ${d.amenity} ${d.contact}`.toLowerCase();
        let matchesSearch = !searchVal || matchString.includes(searchVal);
        return matchesDate && matchesSearch;
    });
    renderBookings(filtered);
};

window.filterHKTasks = function() {
    const dateVal = document.getElementById('hk-date-filter').value;
    const searchVal = document.getElementById('hk-search').value.toLowerCase();
    let filtered = MASTER_HK_CACHE.filter(d => {
        let matchesDate = !dateVal || d.date === dateVal;
        let matchesSearch = !searchVal || (d.amenity && d.amenity.toLowerCase().includes(searchVal)) || (d.staffAssigned && d.staffAssigned.toLowerCase().includes(searchVal));
        return matchesDate && matchesSearch;
    });
    renderHKTasks(filtered);
};

window.filterInventory = function() {
    const catVal = document.getElementById('inv-category-filter').value;
    const searchVal = document.getElementById('inv-search').value.toLowerCase();
    let filtered = MASTER_INV_CACHE.filter(d => {
        let matchesCat = !catVal || d.category === catVal;
        let matchesSearch = !searchVal || (d.name && d.name.toLowerCase().includes(searchVal));
        return matchesCat && matchesSearch;
    });
    renderInventory(filtered);
};



// =========================================================
// 14. UI NAVIGATION & MODAL SUBMISSION HANDLERS
// =========================================================
function buildNavigation() {
    const navMenu = document.getElementById('nav-menu');
    if (!navMenu) return;
    navMenu.innerHTML = menuItems.map(item => `
        <button onclick="switchTab('${item.id}', '${item.label}')" id="nav-btn-${item.id}" class="nav-btn w-full flex items-center text-left px-3.5 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-xs font-semibold">
            <i class="fas ${item.icon} w-5 text-center mr-2 text-slate-400"></i>
            <span>${item.label}</span>
        </button>
    `).join('');

    const defBtn = document.getElementById('nav-btn-dashboard');
    if (defBtn) {
        defBtn.classList.add('bg-accent', 'text-white');
        defBtn.classList.remove('text-slate-300', 'hover:bg-slate-800');
    }
}

window.switchTab = function (tabId, tabLabel) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    const target = document.getElementById(`tab-${tabId}`);
    if (target) target.classList.add('active');

    const title = document.getElementById('current-page-title');
    if (title) title.innerText = tabLabel;

    document.querySelectorAll('.nav-btn').forEach(b => {
        b.classList.remove('bg-accent', 'text-white');
        b.classList.add('text-slate-300', 'hover:bg-slate-800');
    });

    const activeBtn = document.getElementById(`nav-btn-${tabId}`);
    if (activeBtn) {
        activeBtn.classList.remove('text-slate-300', 'hover:bg-slate-800');
        activeBtn.classList.add('bg-accent', 'text-white');
    }

    if (window.innerWidth < 768) toggleSidebar();
};

window.toggleSidebar = function () {
    const s = document.getElementById('sidebar');
    const o = document.getElementById('sidebar-overlay');
    if (s && o) {
        s.classList.toggle('-translate-x-full');
        o.classList.toggle('hidden');
    }
};

let currentPlanIndex = 0;
const plans = ['plan-stilt', 'plan-p2', 'plan-skyzone'];
let carouselInterval;

function startCarousel() {
    carouselInterval = setInterval(() => {
        currentPlanIndex = (currentPlanIndex + 1) % plans.length;
        const nextPlan = plans[currentPlanIndex];
        const selector = document.getElementById('floorSelector');
        if (selector) {
            selector.value = nextPlan;
            changeFloorPlan(nextPlan);
        }
    }, 8000);
}

function initLayoutCarousel() {
    startCarousel();
    const container = document.getElementById('layout-carousel-container');
    if (container) {
        container.addEventListener('mouseenter', () => clearInterval(carouselInterval));
        container.addEventListener('mouseleave', () => startCarousel());
    }
}

window.changeFloorPlan = function (planId) {
    document.querySelectorAll('.floor-plan-view').forEach(view => view.classList.add('hidden'));
    const target = document.getElementById(planId);
    if (target) target.classList.remove('hidden');
};

function initModalHandlers() {
    const db = firebase.firestore();

    // 1. FULL RECORD CHECKLIST EDIT SUBMISSION
    document.getElementById('edit-checklist-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const docId = document.getElementById('ecl-id').value;
        const notes = document.getElementById('ecl-notes').value;
        
        let hasFailures = false;
        let failureNotes = [];
        let updatedResults = {};

        // Recalculate results from dynamically generated radio buttons
        const questionElements = document.querySelectorAll('#ecl-dynamic-questions-container input[type="radio"]:checked');
        questionElements.forEach((radio, idx) => {
            const questionText = radio.getAttribute('data-question');
            const resultVal = radio.value;
            updatedResults[`point_${idx}`] = { question: questionText, result: resultVal };
            if(resultVal === 'Fail') {
                hasFailures = true;
                failureNotes.push(questionText);
            }
        });

        db.collection("daily_logs").doc(docId).update({
            hasIssues: hasFailures,
            failedPoints: failureNotes.join(', '),
            results: updatedResults,
            notes: notes
        }).then(() => {
            document.getElementById('edit-checklist-modal').classList.add('hidden');
        });
    });

    // 2. HELPDESK EDIT SUBMISSION (Supports Re-uploading Photo Base64)
    document.getElementById('edit-ticket-form').addEventListener('submit', async function (e) {
        e.preventDefault();
        const docId = document.getElementById('etk-id').value;
        const status = document.getElementById('etk-status').value;
        const existingPhoto = document.getElementById('etk-existing-photo').value;
        const fileInput = document.getElementById('etk-photo');
        
        let newPhotoBase64 = existingPhoto;
        if(fileInput.files.length > 0) {
            try { newPhotoBase64 = await compressImage(fileInput.files[0]); } catch(err) { console.error(err); }
        }

        const data = {
            amenity: document.getElementById('etk-amenity').value,
            department: document.getElementById('etk-dept').value,
            priority: document.getElementById('etk-priority').value,
            informedTo: document.getElementById('etk-informed').value,
            description: document.getElementById('etk-desc').value,
            resolutionNote: document.getElementById('etk-resnote').value,
            status: status,
            photoBase64: newPhotoBase64
        };

        if(status === 'Resolved') data.resolvedAt = firebase.firestore.FieldValue.serverTimestamp();

        db.collection("complaints").doc(docId).update(data).then(() => {
            document.getElementById('edit-ticket-modal').classList.add('hidden');
        });
    });
    
    // 3. HK SCHEDULE EDIT SUBMISSION
    document.getElementById('edit-hk-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const docId = document.getElementById('ehk-id').value;
        db.collection("hk_tasks").doc(docId).update({
            amenity: document.getElementById('ehk-amenity').value,
            taskType: document.getElementById('ehk-type').value,
            staffAssigned: document.getElementById('ehk-staff').value,
            date: document.getElementById('ehk-date').value,
            timeSlot: document.getElementById('ehk-time').value,
            instructions: document.getElementById('ehk-instructions').value,
            status: document.getElementById('ehk-status').value
        }).then(() => {
            document.getElementById('edit-hk-modal').classList.add('hidden');
        });
    });

    // 4. BOOKING EDIT SUBMISSION
    document.getElementById('edit-booking-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const docId = document.getElementById('eb-id').value;
        db.collection("bookings").doc(docId).update({
            resident: document.getElementById('eb-name').value,
            contact: document.getElementById('eb-contact').value,
            bookingDate: document.getElementById('eb-date').value,
            status: document.getElementById('eb-status').value,
            paid: parseFloat(document.getElementById('eb-paid').value) || 0,
            checkoutMess: document.getElementById('eb-mess').checked,
            checkoutDamage: document.getElementById('eb-damage').checked,
            checkoutDeducted: parseFloat(document.getElementById('eb-deducted').value) || 0,
            checkoutRefunded: parseFloat(document.getElementById('eb-refunded').value) || 0,
            checkoutNotes: document.getElementById('eb-checkout-notes').value
        }).then(() => {
            document.getElementById('edit-booking-modal').classList.add('hidden');
        });
    });

    // 5. STAFF EDIT SUBMISSION
    document.getElementById('edit-staff-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const docId = document.getElementById('est-docid').value;
        db.collection("staff").doc(docId).update({
            staffId: document.getElementById('est-id').value.toUpperCase(),
            name: document.getElementById('est-name').value,
            contact: document.getElementById('est-contact').value,
            role: document.getElementById('est-role').value,
            shift: document.getElementById('est-shift').value,
            weeklyOff: document.getElementById('est-off').value,
            status: document.getElementById('est-status').value,
            responsibilities: document.getElementById('est-resp').value
        }).then(() => {
            document.getElementById('edit-staff-modal').classList.add('hidden');
        });
    });

    // 6. ATTENDANCE EDIT SUBMISSION
    document.getElementById('edit-att-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const docId = document.getElementById('eatt-id').value;
        db.collection("attendance").doc(docId).update({
            staffName: document.getElementById('eatt-staff').value,
            dateString: document.getElementById('eatt-date').value,
            status: document.getElementById('eatt-status').value,
            reason: document.getElementById('eatt-reason').value
        }).then(() => {
            document.getElementById('edit-att-modal').classList.add('hidden');
        });
    });

    // 7. AMENITY EDIT SUBMISSION
    document.getElementById('edit-amenity-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const docId = document.getElementById('eam-id').value;
        db.collection("amenities").doc(docId).update({
            status: document.getElementById('eam-status').value,
            mOpen: document.getElementById('eam-m-open').value,
            mClose: document.getElementById('eam-m-close').value,
            eOpen: document.getElementById('eam-e-open').value,
            eClose: document.getElementById('eam-e-close').value
        }).then(() => {
            document.getElementById('edit-amenity-modal').classList.add('hidden');
        });
    });
}
