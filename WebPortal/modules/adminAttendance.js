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

    if (!selectElement || !selectElement.value) {
        showAdminAlert("danger", "⚠️ कृपया पहले सूची से शिक्षक का नाम चुनें!");
        return;
    }

    const teacherName = selectElement.options[selectElement.selectedIndex].dataset.name;
    const teacherId = selectElement.value;

    // बटन को डिसेबल करें ताकि डबल क्लिक न हो
    if (btnCheckIn) btnCheckIn.disabled = true;
    if (btnCheckOut) btnCheckOut.disabled = true;

    // प्रोसेसिंग के दौरान अलर्ट
    showAdminAlert("primary", `⏳ <b>${teacherName}</b> के लिए ${type} प्रक्रिया चल रही है, कृपया प्रतीक्षा करें...`);

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

        if (!response.ok) throw new Error("सर्वर रिस्पॉन्स फेल रहा।");

        const result = await response.json();

        if (result.status === "success") {
            // सफल होने पर विशिष्ट मैसेज
            const successMsg = type === 'Check-In' 
                ? `✅ <b>${teacherName}</b> की <b>Check-In</b> सफलतापूर्वक दर्ज कर ली गई है।` 
                : `✅ <b>${teacherName}</b> की <b>Check-Out</b> सफलतापूर्वक दर्ज कर ली गई है।`;
            
            showAdminAlert("success", successMsg);

            // अगर डैशबोर्ड अपडेट फंक्शन मौजूद है तो उसे कॉल करें
            if (typeof loadTeacherAttendanceDashboard === 'function') {
                loadTeacherAttendanceDashboard();
            }
        } else {
            // सर्वर से प्राप्त एरर मैसेज
            showAdminAlert("danger", `⚠️ <b>त्रुटि:</b> ${result.message}`);
        }

    } catch (e) {
        console.error("Manual Attendance Error:", e);
        showAdminAlert("danger", "❌ सर्वर से जुड़ने में असमर्थ। कृपया अपना इंटरनेट कनेक्शन जांचें।");
    } finally {
        // बटन को वापस इनेबल करें
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
        .manual-card { border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border: none; }
        /* चार कॉलम को एक लाइन में रखने के लिए */
        .one-line-details { 
            display: flex; 
            flex-direction: row; 
            gap: 5px; 
            margin-bottom: 15px; 
            width: 100%;
        }
        .data-pill { 
            background: #f8f9fa; 
            border: 1px solid #e9ecef; 
            border-radius: 8px; 
            padding: 8px 2px; 
            flex: 1; 
            text-align: center;
            min-width: 0; /* बहुत जरूरी है एक लाइन के लिए */
        }
        .label-text { font-size: 0.6rem; color: #888; display: block; font-weight: 700; text-transform: uppercase; }
        .val-text { font-size: 0.75rem; font-weight: bold; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }
    </style>

    <div class="container mt-3" style="max-width: 600px;">
        <div class="card p-3 manual-card">
            <div class="text-center mb-3">
                <h5 class="fw-bold m-0"><i class="bi bi-clipboard-check"></i> मैनुअल उपस्थिति</h5>
            </div>

            <select id="admin-teacher-select" class="form-select border-2 mb-3" style="border-radius: 10px;">
                <option value="">👤 शिक्षक का नाम चुनें...</option>
            </select>

            <div class="one-line-details">
                <div class="data-pill"><span class="label-text">Name</span><b id="disp-name" class="val-text">-</b></div>
                <div class="data-pill"><span class="label-text">ID</span><b id="disp-id" class="val-text">-</b></div>
                <div class="data-pill"><span class="label-text">Mob</span><b id="disp-mob" class="val-text">-</b></div>
                <div class="data-pill"><span class="label-text">PIN</span><b id="disp-pin" class="val-text text-success">-</b></div>
            </div>

            <div class="d-flex gap-2">
                <button id="btn-admin-checkin" class="btn btn-success flex-fill fw-bold" style="border-radius: 8px;">🌅 Check-In</button>
                <button id="btn-admin-checkout" class="btn btn-danger flex-fill fw-bold" style="border-radius: 8px;">🌇 Check-Out</button>
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
                    optionsHTML += `<option value="${t.id}" data-name="${t.name}" data-id="${t.id}" data-mob="${t.mobile || 'N/A'}" data-pin="${t.pin || 'XXXX'}">${t.name}</option>`;
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
                document.getElementById('disp-name').innerText = option.dataset.name || '-';
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

