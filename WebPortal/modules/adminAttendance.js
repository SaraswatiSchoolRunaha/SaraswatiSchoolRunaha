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

    // 📝 मोड 2: सिर्फ मैन्युअल हाजिरी मैनेजमेंट इंटरफेस
 else if (mode === 'manual') {
    container.innerHTML = `
    <div class="container mt-5">
        <div class="card border-0 shadow-lg overflow-hidden mx-auto" 
             style="max-width: 600px; border-radius: 30px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px);">
            
            <!-- Header -->
            <div class="text-center text-white py-4 position-relative"
                 style="background: linear-gradient(135deg, #198754, #20c997);">
                <div style="font-size: 3rem; margin-bottom: 5px;">👨‍💻</div>
                <h3 class="fw-bold mb-1">एडमिन पैनल</h3>
                <p class="mb-0 opacity-75">शिक्षक की उपस्थिति दर्ज करें</p>
            </div>

            <div class="p-4 p-md-5">
                <!-- Status Alert -->
                <div id="admin-status-alert" class="alert d-none shadow-sm rounded-4 fw-bold border-0 p-3 mb-4 text-center" role="alert"></div>

                <!-- Select Input -->
                <div class="mb-4">
                    <label class="form-label fw-bold text-secondary mb-2 ms-1">शिक्षक का नाम चुनें</label>
                    <select id="admin-teacher-select" class="form-select form-select-lg border-0 shadow-sm" 
                            style="border-radius: 15px; padding: 15px; background: #f0f2f5; font-weight: 600;">
                        <option value="">🔄 शिक्षकों की सूची लोड हो रही है...</option>
                    </select>
                </div>

                <!-- Teacher Details -->
                <div id="teacher-details-card" class="mt-4 p-4 d-none animate__animated animate__fadeIn"
                     style="border-radius: 20px; background: #f8fff9; border: 1px solid #d1e7dd;">
                    <h6 class="fw-bold text-success mb-3 d-flex align-items-center">
                        <span class="me-2">📋</span> शिक्षक विवरण
                    </h6>
                    <div class="d-flex justify-content-between mb-2">
                        <span class="text-secondary">आईडी</span>
                        <b id="disp-id" class="text-dark">---</b>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span class="text-secondary">मोबाइल</span>
                        <b id="disp-mob" class="text-dark">---</b>
                    </div>
                    <div class="d-flex justify-content-between">
                        <span class="text-secondary">पिन</span>
                        <b id="disp-pin" class="text-success">---</b>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="row g-3 mt-4">
                    <div class="col-6">
                        <button id="btn-admin-checkin" class="btn btn-success btn-lg w-100 fw-bold shadow-sm py-3"
                                style="border-radius: 15px; transition: 0.3s;">
                            <i class="bi bi-box-arrow-in-right"></i> Check-In
                        </button>
                    </div>
                    <div class="col-6">
                        <button id="btn-admin-checkout" class="btn btn-danger btn-lg w-100 fw-bold shadow-sm py-3"
                                style="border-radius: 15px; transition: 0.3s;">
                            <i class="bi bi-box-arrow-left"></i> Check-Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <style>
        .btn:hover { transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.1) !important; }
        .form-select:focus { box-shadow: 0 0 0 0.25rem rgba(25, 135, 84, 0.25) !important; border: 1px solid #198754 !important; }
    </style>
    `;
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

