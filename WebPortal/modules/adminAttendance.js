import { sheetUrls } from './config.js';

export function loadAdminAttendancePanel(mode) {
    const container = document.getElementById('contentArea');
    if (!container) return;

    if (mode === 'qr') {
        // Style ko dynamic inject karna
        const style = document.createElement('style');
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
        `;
        document.head.appendChild(style);

        container.innerHTML = `
            <div class="container mt-4">
                <div class="card p-5 text-center shadow-sm qr-card">
                    <h3 class="text-primary fw-bold mb-4">🖨️ उपस्थिति QR कोड</h3>
                    
                    <div id="admin-qr-print-zone" class="p-4 bg-light border border-secondary shadow-sm" style="border-radius: 15px;">
                        <h4 class="fw-bold text-dark mb-1">सरस्वती बाल विद्या मंदिर स्कूल</h4>
                        <p class="text-muted mb-3">रुनाहा, बैरसिया, भोपाल (म.प्र.)</p>
                        <div id="qrcode-admin-view" class="my-3"></div>
                        <div class="bg-dark text-white d-inline-block px-4 py-2 mt-2" style="border-radius: 5px;">
                            STAFF ATTENDANCE GATEWAY
                        </div>
                    </div>

                    <button id="btn-print-qr" class="btn btn-primary btn-lg w-100 mt-4 fw-bold">
                        🖨️ प्रिंटआउट निकालें
                    </button>
                </div>
            </div>`;
        
        document.getElementById('qrcode-admin-view').innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=SBVM_RUNAHA_ATTENDANCE_2026" class="img-fluid" style="max-width: 250px;" />`;
        document.getElementById('btn-print-qr').addEventListener('click', () => window.print());
    }


// 2. सिर्फ मैन्युअल उपस्थिति के लिए इंटरफेस
    else if (mode === 'manual') {
    container.innerHTML = `
        <div class="container mt-4">
            <div class="card p-4 shadow-sm" style="border-radius: 20px; border: 1px solid #e2e8f0; max-width: 500px; margin: auto;">
                <div class="text-center mb-4">
                    <h3 class="text-success fw-bold">📝 मैनुअल उपस्थिति</h3>
                    <p class="text-muted small">शिक्षक का विवरण चुनें और हाजिरी दर्ज करें</p>
                </div>
                
                <div class="mb-4">
                    <label class="form-label fw-bold text-secondary">शिक्षक का नाम चुनें:</label>
                    <select id="admin-teacher-select" class="form-select form-select-lg" style="border-radius: 12px;">
                        <option value="">लोड हो रहा है...</option>
                    </select>
                    
                    <div id="teacher-details-card" class="mt-3 p-3 bg-light d-none" style="border-radius: 12px; border-left: 5px solid #198754;">
                        <div class="small">ID: <b id="disp-id">-</b></div>
                        <div class="small">Mobile: <b id="disp-mob">-</b></div>
                        <div class="small text-primary">PIN: <b id="disp-pin">-</b></div>
                    </div>
                </div>

                <div class="d-flex gap-2">
                    <button id="btn-admin-checkin" class="btn btn-success btn-lg flex-fill fw-bold" style="border-radius: 12px;">🌅 Check-In</button>
                    <button id="btn-admin-checkout" class="btn btn-danger btn-lg flex-fill fw-bold" style="border-radius: 12px;">🌇 Check-Out</button>
                </div>
            </div>
        </div>`;

    async function loadTeachers() {
        const select = document.getElementById('admin-teacher-select');
        try {
            const res = await fetch(`${sheetUrls['TeacherAttendance']}?action=getTeachersList`);
            const data = await res.json();
            select.innerHTML = '<option value="">--- शिक्षक का नाम चुनें ---</option>';
            data.teachers.forEach(t => {
                // Option mein hum details store kar rahe hain
                select.innerHTML += `<option value="${t.id}" 
                    data-id="${t.id}" 
                    data-mob="${t.mobile}" 
                    data-pin="${t.pin}">${t.name}</option>`;
            });
        } catch (e) { select.innerHTML = '<option value="">❌ एरर!</option>'; }
    }
    loadTeachers();

    // Selection par details dikhane ka logic
    document.getElementById('admin-teacher-select').addEventListener('change', (e) => {
        const select = e.target;
        const detailsCard = document.getElementById('teacher-details-card');
        const option = select.options[select.selectedIndex];
        
        if (select.value) {
            document.getElementById('disp-id').innerText = option.dataset.id;
            document.getElementById('disp-mob').innerText = option.dataset.mob;
            document.getElementById('disp-pin').innerText = option.dataset.pin;
            detailsCard.classList.remove('d-none');
        } else {
            detailsCard.classList.add('d-none');
        }
    });

    // Buttons logic
    document.getElementById('btn-admin-checkin').addEventListener('click', () => markManualAttendance('Check-In'));
    document.getElementById('btn-admin-checkout').addEventListener('click', () => markManualAttendance('Check-Out'));
}
}
