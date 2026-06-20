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

        const formData = new URLSearchParams();
        formData.append("action", "adminManualMark");
        formData.append("teacher_id", teacherId);
        formData.append("teacher_name", teacherName);
        formData.append("attendance_type", type);

        const response = await fetch(sheetUrls['TeacherAttendance'], {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error("सर्वर से कोई प्रतिक्रिया नहीं मिली।");
        }

        const result = await response.json();

        if (result.status === "success") {
            showAdminAlert("success", `✅ ${result.message}`);

            if (typeof loadTeacherAttendanceDashboard === 'function') {
                loadTeacherAttendanceDashboard();
            }

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

 // 📝 मोड 2: सिर्फ मैन्युअल हाजिरी मैनेजमेंट इंटरफेस
else if (mode === 'manual') {
    container.innerHTML = `
    <style>
        .manual-card { background: #ffffff; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
        .info-box { background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 12px; padding: 10px; }
        .icon-circle { width: 35px; height: 35px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; margin: 0 auto 8px; }
        .btn-checkin { background: #198754; color: white; padding: 15px; border-radius: 12px; }
        .btn-checkout { background: #dc3545; color: white; padding: 15px; border-radius: 12px; }
    </style>

    <div class="container mt-4">
        <div class="card p-4 manual-card border-0" style="max-width: 700px; margin: auto;">
            <div class="text-center mb-4">
                <div class="mb-3" style="font-size: 3rem;">📋</div>
                <h3 class="fw-bold">मैनुअल उपस्थिति</h3>
                <h5 class="text-secondary">Admin Attendance Panel</h5>
            </div>

            <label class="fw-bold mb-2">शिक्षक का नाम चुनें:</label>
            <div class="d-flex align-items-center border p-2 mb-4" style="border-radius: 10px;">
                <i class="bi bi-person-fill fs-4 ms-2 me-3 text-secondary"></i>
                <select id="admin-teacher-select" class="form-select border-0">
                    <option value="">--- शिक्षक का नाम चुनें ---</option>
                </select>
            </div>

            <div class="mb-4">
                <div class="d-flex align-items-center mb-3">
                    <i class="bi bi-card-checklist text-success me-2"></i>
                    <span class="fw-bold">चयनित शिक्षक का विवरण</span>
                </div>
                
                <div class="row g-2">
                    <div class="col-3"><div class="info-box text-center">
                        <div class="icon-circle bg-success"><i class="bi bi-person-fill"></i></div>
                        <small class="text-muted d-block">नाम</small>
                        <b id="disp-name" style="font-size: 0.85rem;">-</b>
                    </div></div>
                    <div class="col-3"><div class="info-box text-center">
                        <div class="icon-circle bg-success"><i class="bi bi-person-badge"></i></div>
                        <small class="text-muted d-block">ID</small>
                        <b id="disp-id">-</b>
                    </div></div>
                    <div class="col-3"><div class="info-box text-center">
                        <div class="icon-circle bg-success"><i class="bi bi-telephone-fill"></i></div>
                        <small class="text-muted d-block">मोबाइल</small>
                        <b id="disp-mob" style="font-size: 0.85rem;">-</b>
                    </div></div>
                    <div class="col-3"><div class="info-box text-center">
                        <div class="icon-circle bg-success"><i class="bi bi-lock-fill"></i></div>
                        <small class="text-muted d-block">पिन</small>
                        <b id="disp-pin">-</b>
                    </div></div>
                </div>
            </div>

            <div class="alert alert-primary mb-4" style="background: #eefbff; border: none; color: #084298;">
                <i class="bi bi-info-circle-fill me-2"></i> ध्यान दें: सही शिक्षक चुनें और उसके बाद Check-In / Check-Out करें।
            </div>

            <div class="d-flex gap-3">
                <button id="btn-admin-checkin" class="btn btn-checkin flex-fill fw-bold">🌅 Check-In</button>
                <button id="btn-admin-checkout" class="btn btn-checkout flex-fill fw-bold">🌇 Check-Out</button>
            </div>
        </div>
    </div>`;
}
    
    // बैकएंड से शिक्षकों की सूची डायनामिकली फ़ेच करना
        async function loadTeachers() {
            const select = document.getElementById('admin-teacher-select');
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
                console.error("Error loading teachers list: ", e);
                select.innerHTML = '<option value="">❌ सूची लोड करने में समस्या आई!</option>'; 
            }
        }
        
        loadTeachers();

        // शिक्षक चयन बदलने पर डेटा रेंडरिंग लॉजिक
        document.getElementById('admin-teacher-select').addEventListener('change', (e) => {
            const select = e.target;
            const detailsCard = document.getElementById('teacher-details-card');
            const option = select.options[select.selectedIndex];
            
            if (select.value) {
                document.getElementById('disp-id').innerText = option.dataset.id || '-';
                document.getElementById('disp-mob').innerText = option.dataset.mob || '-';
                document.getElementById('disp-pin').innerText = option.dataset.pin || '-';
                detailsCard.classList.remove('d-none');
            } else {
                detailsCard.classList.add('d-none');
            }

            // नया शिक्षक सिलेक्ट करने पर पुराना स्टेटस अलर्ट हाइड करना
            const statusAlert = document.getElementById('admin-status-alert');
            if (statusAlert) statusAlert.classList.add('d-none');
        });

        // इवेंट लिसनर्स बाइंडिंग
        document.getElementById('btn-admin-checkin').addEventListener('click', () => markManualAttendance('Check-In'));
        document.getElementById('btn-admin-checkout').addEventListener('click', () => markManualAttendance('Check-Out'));
    }

