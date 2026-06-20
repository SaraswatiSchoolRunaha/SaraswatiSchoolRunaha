import { sheetUrls } from './config.js';

// 📢 एडमिन पैनल के लिए एनिमेटेड अलर्ट दिखाने का यूटिलिटी फंक्शन
function showAdminAlert(type, message) {
    const statusAlert = document.getElementById('admin-status-alert');
    if (!statusAlert) return;

    let bgClass = `alert-${type}`;
    if (type === 'primary') bgClass = 'bg-primary text-white';
    if (type === 'success') bgClass = 'bg-success text-white';
    if (type === 'danger') bgClass = 'bg-danger text-white';
    
    statusAlert.className = `alert ${bgClass} d-block fw-bold shadow-sm border-0 p-3 mb-4 alert-animated`;
    statusAlert.innerHTML = message;
}

// 🌅/🌇 मैन्युअल उपस्थिति दर्ज करने का मुख्य फंक्शन
export async function markManualAttendance(type) {
    const selectElement = document.getElementById('admin-teacher-select');
    const btnCheckIn = document.getElementById('btn-admin-checkin');
    const btnCheckOut = document.getElementById('btn-admin-checkout');
    
    if (!selectElement) return;
    const teacherId = selectElement.value;
    const teacherName = selectElement.options[selectElement.selectedIndex]?.text;

    if (!teacherId) {
        showAdminAlert("danger", "⚠️ कृपया पहले शिक्षक का नाम चुनें!");
        return;
    }

    if (btnCheckIn) btnCheckIn.disabled = true;
    if (btnCheckOut) btnCheckOut.disabled = true;

    showAdminAlert("primary", `⏳ ${teacherName} की ${type} दर्ज की जा रही है...`);

    try {
        const response = await fetch(sheetUrls['TeacherAttendance'], {
            method: "POST",
            mode: 'cors', // CORS सपोर्ट के लिए अनिवार्य
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action: "adminManualMark",
                teacher_id: teacherId,
                teacher_name: teacherName,
                attendance_type: type 
            })
        });

        // रिस्पॉन्स की जाँच करें कि क्या वह सही (OK) है
        if (!response.ok) throw new Error("सर्वर से कोई प्रतिक्रिया नहीं मिली।");

        const result = await response.json();

        if (result.status === "success") {
            showAdminAlert("success", `✅ ${result.message}`);
            if (typeof loadTeacherAttendanceDashboard === 'function') loadTeacherAttendanceDashboard();
        } else {
            showAdminAlert("danger", `⚠️ ${result.message}`);
        }
    } catch (e) {
        console.error("Manual Attendance Error:", e); // कंसोल में असल एरर देखने के लिए
        showAdminAlert("danger", "❌ सर्वर से जुड़ने में समस्या आई।");
    } finally {
        if (btnCheckIn) btnCheckIn.disabled = false;
        if (btnCheckOut) btnCheckOut.disabled = false;
    }
}

// 🎛️ एडमिन उपस्थिति पैनल लोड करने का आर्किटेक्चरल फंक्शन
export function loadAdminAttendancePanel(mode) {
    const container = document.getElementById('contentArea');
    if (!container) return;

    // स्टाइल्स को डुप्लीकेट होने से रोकने के लिए यूनिक आईडी गार्ड (ग्लोबल हैंडलिंग)
    if (!document.getElementById('admin-attendance-global-styles')) {
        const style = document.createElement('style');
        style.id = 'admin-attendance-global-styles';
        style.innerHTML = `
            @media print {
                body * { visibility: hidden; }
                #admin-qr-print-zone, #admin-qr-print-zone * { visibility: visible; }
                #admin-qr-print-zone { 
                    position: absolute; left: 50%; top: 50%; 
                    transform: translate(-50%, -50%); 
                    width: 100%; border: none !important;
                }
            }
            .qr-card { max-width: 450px; margin: 2rem auto; border-radius: 20px; border: 1px solid #dee2e6; }
            .btn-action { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border-radius: 15px; }
            .btn-action:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.1); }
            .form-select-custom:focus { border-color: #198754 !important; box-shadow: 0 0 0 0.25rem rgba(25, 135, 84, 0.15); }
            .alert-animated { animation: adminSlideUp 0.3s ease-out; }
            @keyframes adminSlideUp { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        `;
        document.head.appendChild(style);
    }

    // 🖨️ मोड 1: QR कोड जेनरेशन और प्रिंटिंग इंटरफेस
    if (mode === 'qr') {
        container.innerHTML = `
            <div class="container mt-4">
                <div class="card p-5 text-center shadow-sm qr-card">
                    <h3 class="text-primary fw-bold mb-4">🖨️ शिक्षक उपस्थिति QR कोड</h3>
                    
                    <div id="admin-qr-print-zone" class="p-4 bg-light border border-secondary shadow-sm" style="border-radius: 15px;">
                        <h4 class="fw-bold text-dark mb-1">सरस्वती बाल विद्या मंदिर स्कूल</h4>
                        <p class="text-muted mb-3">रुनाहा, बैरसिया, भोपाल (म.प्र.)</p>
                        <div id="qrcode-admin-view" class="my-3"></div>
                        <div class="bg-dark text-white d-inline-block px-4 py-2 mt-2" style="border-radius: 5px; font-weight: bold; letter-spacing: 0.5px;">
                            STAFF ATTENDANCE GATEWAY
                        </div>
                    </div>

                    <button id="btn-print-qr" class="btn btn-primary btn-lg w-100 mt-4 fw-bold btn-action">
                        🖨️ प्रिंटआउट निकालें (Print)
                    </button>
                </div>
            </div>`;
        
        document.getElementById('qrcode-admin-view').innerHTML = `
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=SBVM_RUNAHA_ATTENDANCE_2026" class="img-fluid" style="max-width: 250px;" alt="Attendance QR Code" />
        `;
        document.getElementById('btn-print-qr').addEventListener('click', () => window.print());
    }

  // 🎛️ एडमिन उपस्थिति पैनल लोड करने का सही तरीका
export function loadAdminAttendancePanel(mode) {
    const container = document.getElementById('contentArea');
    if (!container) return;

    // अगर आप चाहते हैं कि सिर्फ एडमिन वाला हिस्सा बदले, मेनू बार नहीं, तो यहाँ contentArea के अंदर 
    // एक खास ID वाला div बनाएं या उसे पहले खाली न करें।
    // अगर आपका मेनू बार इसी container के अंदर है, तो आपको अपनी HTML संरचना बदलनी होगी।
    
    // मैन्युअल पैनल का HTML
    const manualHTML = `
        <div id="manual-admin-wrapper" class="container mt-4">
            <div class="card p-4 shadow-lg border-0" style="border-radius: 25px; max-width: 500px; margin: auto; background: #ffffff;">
                <h3 class="fw-bold text-center mb-4">📝 मैनुअल उपस्थिति</h3>
                <div id="admin-status-alert" class="alert d-none shadow-sm rounded-3 fw-bold border-0 p-3 mb-4" role="alert"></div>
                
                <select id="admin-teacher-select" class="form-select form-select-lg mb-4">
                    <option value="">🔄 सूची लोड हो रही है...</option>
                </select>

                <div id="teacher-details-card" class="mt-4 p-3 d-none bg-light border-left">
                    <p>ID: <b id="disp-id">-</b> | Mob: <b id="disp-mob">-</b></p>
                </div>

                <div class="d-flex gap-3">
                    <button id="btn-admin-checkin" class="btn btn-success flex-fill">🌅 Check-In</button>
                    <button id="btn-admin-checkout" class="btn btn-danger flex-fill">🌇 Check-Out</button>
                </div>
            </div>
        </div>`;

    // सिर्फ पैनल लोड करें (पूरा कंटेनर न मिटाएं अगर मेनू बार भी वहीं है)
    container.innerHTML = manualHTML;

    // --- अंदर ही लोड करें (ताकि यह HTML रेंडर होने के बाद ही चले) ---
    async function loadTeachers() {
        const select = document.getElementById('admin-teacher-select');
        try {
            const res = await fetch(`${sheetUrls['TeacherAttendance']}?action=getTeachersList`, { mode: 'cors' });
            const data = await res.json();
            if (data?.teachers) {
                let opts = '<option value="">--- शिक्षक चुनें ---</option>';
                data.teachers.forEach(t => opts += `<option value="${t.id}" data-id="${t.id}" data-mob="${t.mobile}">${t.name}</option>`);
                select.innerHTML = opts;
            }
        } catch (e) { select.innerHTML = '<option value="">❌ Error</option>'; }
    }

    loadTeachers();

    // इवेंट लिसनर्स (HTML लोड होने के तुरंत बाद बाइंड करें)
    document.getElementById('admin-teacher-select').onchange = (e) => {
        const opt = e.target.options[e.target.selectedIndex];
        document.getElementById('disp-id').innerText = opt.dataset.id || '-';
        document.getElementById('teacher-details-card').classList.toggle('d-none', !e.target.value);
    };

    document.getElementById('btn-admin-checkin').onclick = () => markManualAttendance('Check-In');
    document.getElementById('btn-admin-checkout').onclick = () => markManualAttendance('Check-Out');
}
