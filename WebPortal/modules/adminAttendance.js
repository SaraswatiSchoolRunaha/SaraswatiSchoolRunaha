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
            mode: 'cors',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action: "adminManualMark",
                teacher_id: teacherId,
                teacher_name: teacherName,
                attendance_type: type 
            })
        });

        if (!response.ok) throw new Error("सर्वर से कोई प्रतिक्रिया नहीं मिली।");

        const result = await response.json();

        if (result.status === "success") {
            showAdminAlert("success", `✅ ${result.message}`);
            if (typeof loadTeacherAttendanceDashboard === 'function') loadTeacherAttendanceDashboard();
        } else {
            showAdminAlert("danger", `⚠️ ${result.message}`);
        }
    } catch (e) {
        console.error("Manual Attendance Error:", e);
        showAdminAlert("danger", "❌ सर्वर से जुड़ने में समस्या आई।");
    } finally {
        if (btnCheckIn) btnCheckIn.disabled = false;
        if (btnCheckOut) btnCheckOut.disabled = false;
    }
}

// 🛠️ सहायक फंक्शन: शिक्षकों की सूची लोड करना
async function loadTeachers() {
    const select = document.getElementById('admin-teacher-select');
    if (!select) return;
    try {
        const res = await fetch(`${sheetUrls['TeacherAttendance']}?action=getTeachersList`);
        const data = await res.json();
        
        if (data && data.teachers) {
            let optionsHTML = '<option value="">--- शिक्षक का नाम चुनें ---</option>';
            data.teachers.forEach(t => {
                optionsHTML += `<option value="${t.id}" data-id="${t.id}" data-mob="${t.mobile || 'N/A'}" data-pin="${t.pin || 'XXXX'}">${t.name}</option>`;
            });
            select.innerHTML = optionsHTML;
        } else {
            select.innerHTML = '<option value="">⚠️ सूची खाली मिली है</option>';
        }
    } catch (e) { 
        select.innerHTML = '<option value="">❌ समस्या आई!</option>'; 
    }
}

// 🎛️ एडमिन पैनल रेंडरिंग
export function loadAdminAttendancePanel(mode) {
    const container = document.getElementById('contentArea');
    if (!container) return;

    // स्टाइल्स (सिर्फ एक बार लोड हों)
    if (!document.getElementById('admin-attendance-styles')) {
        const style = document.createElement('style');
        style.id = 'admin-attendance-styles';
        style.innerHTML = `.alert-animated { animation: adminSlideUp 0.3s ease-out; } @keyframes adminSlideUp { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }`;
        document.head.appendChild(style);
    }

    // मोड 1: QR कोड
    if (mode === 'qr') {
        container.innerHTML = `
            <div class="container mt-4 text-center">
                <div class="card p-5 shadow-sm" style="max-width: 450px; margin: auto; border-radius: 20px;">
                    <h3 class="text-primary fw-bold mb-4">🖨️ शिक्षक उपस्थिति QR कोड</h3>
                    <div id="qrcode-admin-view" class="my-3"><img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=SBVM_RUNAHA_ATTENDANCE_2026" style="max-width: 250px;" /></div>
                    <button id="btn-print-qr" class="btn btn-primary w-100 mt-4">🖨️ प्रिंट करें</button>
                </div>
            </div>`;
        document.getElementById('btn-print-qr').onclick = () => window.print();
    } 
    // मोड 2: मैनुअल
    else if (mode === 'manual') {
        container.innerHTML = `
            <div class="container mt-4">
                <div class="card p-4 shadow-lg border-0" style="border-radius: 25px; max-width: 500px; margin: auto;">
                    <h3 class="fw-bold text-center mb-4">📝 मैनुअल उपस्थिति</h3>
                    <div id="admin-status-alert" class="alert d-none shadow-sm rounded-3 fw-bold border-0 p-3 mb-4" role="alert"></div>
                    <select id="admin-teacher-select" class="form-select form-select-lg mb-4"><option>🔄 लोड हो रहा है...</option></select>
                    <div id="teacher-details-card" class="mt-4 p-3 d-none bg-light border-left" style="border-left: 5px solid #198754;">
                        <p>ID: <b id="disp-id">-</b> | Mob: <b id="disp-mob">-</b> | PIN: <b id="disp-pin">-</b></p>
                    </div>
                    <div class="d-flex gap-3">
                        <button id="btn-admin-checkin" class="btn btn-success flex-fill">🌅 Check-In</button>
                        <button id="btn-admin-checkout" class="btn btn-danger flex-fill">🌇 Check-Out</button>
                    </div>
                </div>
            </div>`;

        loadTeachers();

        document.getElementById('admin-teacher-select').onchange = (e) => {
            const opt = e.target.options[e.target.selectedIndex];
            document.getElementById('disp-id').innerText = opt.dataset.id || '-';
            document.getElementById('disp-mob').innerText = opt.dataset.mob || '-';
            document.getElementById('disp-pin').innerText = opt.dataset.pin || '-';
            document.getElementById('teacher-details-card').classList.toggle('d-none', !e.target.value);
            document.getElementById('admin-status-alert').classList.add('d-none');
        };

        document.getElementById('btn-admin-checkin').onclick = () => markManualAttendance('Check-In');
        document.getElementById('btn-admin-checkout').onclick = () => markManualAttendance('Check-Out');
    }
}
