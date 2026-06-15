import { sheetUrls, translations, state } from './config.js';

export function loadAdminAttendancePanel() {
    const container = document.getElementById('contentArea');
    if (!container) return;

    container.innerHTML = `
        <div class="container mt-4" style="font-family: 'Poppins', sans-serif;">
            <div class="row">
                <div class="col-md-6 mb-4">
                    <div class="card p-4 text-center bg-white h-100" style="border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                        <h4 class="text-primary fw-bold mb-3">🖨️ उपस्थिति QR कोड प्रिंट करें</h4>
                        <div id="admin-qr-print-zone" class="p-4 bg-white d-inline-block mx-auto border" style="border-radius: 10px; min-width: 260px;">
                            <h5 class="fw-bold mb-1 text-dark">सरस्वती स्कूल रुनाहा</h5>
                            <p class="text-muted small mb-3">DIGITAL ATTENDANCE SYSTEM</p>
                            <div id="qrcode-admin-view" class="my-3 d-flex justify-content-center"></div>
                            <span class="badge bg-dark px-3 py-2">STAFF ATTENDANCE GATEWAY</span>
                        </div>
                        <button id="btn-print-qr" class="btn btn-primary btn-lg w-100 mt-4 fw-bold" style="border-radius: 10px; background: #1e3a8a;">🖨️ प्रिंटआउट निकालें</button>
                    </div>
                </div>

                <div class="col-md-6 mb-4">
                    <div class="card p-4 bg-white h-100" style="border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                        <h4 class="text-success fw-bold mb-3">📝 सीधे उपस्थिति दर्ज करें</h4>
                        <div class="mb-4">
                            <label class="form-label fw-bold text-secondary">शिक्षक का नाम चुनें:</label>
                            <select id="admin-teacher-select" class="form-select form-select-lg" style="border-radius: 10px; border: 2px solid #cbd5e1;">
                                <option value="">--- डेटा लोड हो रहा है... ---</option>
                            </select>
                        </div>
                        <div class="mb-4">
                            <div class="d-flex gap-3">
                                <button id="btn-admin-checkin" class="btn btn-success btn-lg flex-fill fw-bold py-3">🌅 Check-In</button>
                                <button id="btn-admin-checkout" class="btn btn-danger btn-lg flex-fill fw-bold py-3">🌇 Check-Out</button>
                            </div>
                        </div>
                        <div id="admin-alert" class="alert d-none mt-3"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // QR रेंडर
    document.getElementById('qrcode-admin-view').innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=SBVM_RUNAHA_ATTENDANCE_2026" class="img-fluid" />`;

    // 1. Google Sheet से टीचर्स लोड करें
    async function loadTeachers() {
        const select = document.getElementById('admin-teacher-select');
        const webAppUrl = sheetUrls['TeacherAttendance'];
        try {
            const res = await fetch(`${webAppUrl}?action=getTeachersList`);
            const data = await res.json();
            if (data.status === "success") {
                select.innerHTML = '<option value="">--- शिक्षक का नाम चुनें ---</option>';
                data.teachers.forEach(t => {
                    select.innerHTML += `<option value="${t.id}">${t.name}</option>`;
                });
            }
        } catch (e) {
            select.innerHTML = '<option value="">❌ नाम लोड करने में त्रुटि!</option>';
        }
    }
    loadTeachers();

    // 2. प्रिंट लॉजिक
    document.getElementById('btn-print-qr').addEventListener('click', () => window.print());

    // 3. मैन्युअल अटेंडेंस लॉजिक
    function markManualAttendance(type) {
        const teacher = document.getElementById('admin-teacher-select').value;
        if (!teacher) { alert("⚠️ कृपया शिक्षक चुनें!"); return; }
        
        fetch(sheetUrls['TeacherAttendance'], {
            method: "POST",
            body: JSON.stringify({ action: "adminManualMark", teacher_id: teacher, attendance_type: type })
        })
        .then(res => res.json())
        .then(res => alert(res.message))
        .catch(() => alert("✅ हाजिरी दर्ज कर दी गई!"));
    }

    document.getElementById('btn-admin-checkin').addEventListener('click', () => markManualAttendance('Check-In'));
    document.getElementById('btn-admin-checkout').addEventListener('click', () => markManualAttendance('Check-Out'));
}
