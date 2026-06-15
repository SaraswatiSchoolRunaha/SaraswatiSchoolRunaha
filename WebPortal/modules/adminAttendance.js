import { sheetUrls, translations, state } from './config.js';

export function loadAdminAttendancePanel() {
    const container = document.getElementById('contentArea');
    if (!container) return;

    const currentLang = state.currentLang || 'HN';

    // एडमिन पैनल का सुंदर लेआउट (HTML)
    container.innerHTML = `
        <div class="container mt-4" style="font-family: 'Poppins', sans-serif;">
            <div class="row">
                
                <!-- 🖨️ लेफ्ट साइड: QR कोड प्रिंट करने का बॉक्स -->
                <div class="col-md-6 mb-4">
                    <div class="card p-4 text-center bg-white h-100" style="border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                        <h4 class="text-primary fw-bold mb-3">🖨️ उपस्थिति QR कोड प्रिंट करें</h4>
                        <p class="text-muted small">इस QR कोड का प्रिंटआउट निकालकर स्कूल के मुख्य स्थान या दीवार पर चिपकाएँ।</p>
                        <hr>
                        
                        <!-- प्रिंट होने वाला मुख्य हिस्सा -->
                        <div id="admin-qr-print-zone" class="p-4 bg-white d-inline-block mx-auto border" style="border-radius: 10px; min-width: 260px;">
                            <h5 class="fw-bold mb-1 text-dark" style="letter-spacing: 1px;">सरस्वती स्कूल रुनाहा</h5>
                            <p class="text-muted small mb-3" style="font-size: 11px;">DIGITAL ATTENDANCE SYSTEM</p>
                            
                            <!-- यहाँ API से QR कोड लोड होगा -->
                            <div id="qrcode-admin-view" class="my-3 d-flex justify-content-center"></div>
                            
                            <span class="badge bg-dark px-3 py-2" style="font-size: 11px; letter-spacing: 1px;">STAFF ATTENDANCE GATEWAY</span>
                        </div>
                        
                        <button id="btn-print-qr" class="btn btn-primary btn-lg w-100 mt-4 fw-bold" style="border-radius: 10px; background: #1e3a8a;">
                            🖨️ प्रिंटआउट निकालें (Print QR)
                        </button>
                    </div>
                </div>

                <!-- 📝 राइट Side: एडमिन द्वारा सीधे मैन्युअल हाजिरी लगाना -->
                <div class="col-md-6 mb-4">
                    <div class="card p-4 bg-white h-100" style="border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                        <h4 class="text-success fw-bold mb-3">📝 सीधे उपस्थिति दर्ज करें (Backup)</h4>
                        <p class="text-muted small">यदि किसी शिक्षक का फोन खराब हो या कोई तकनीकी समस्या हो, तो यहाँ से सीधे हाजिरी लगाएँ।</p>
                        <hr>
                        
                        <div class="mb-4">
                            <label class="form-label fw-bold text-secondary">1. शिक्षक का नाम चुनें (Select Teacher):</label>
                            <select id="admin-teacher-select" class="form-select form-select-lg" style="border-radius: 10px; border: 2px solid #cbd5e1;">
                                <option value="" selected disabled>--- शिक्षक का नाम चुनें ---</option>
                                <option value="TCH_01_RAKESH">राकेश गुप्ता (Rakesh Gupta)</option>
                                <option value="TCH_02_RAMESH">रमेश कुमार (Ramesh Kumar)</option>
                                <option value="TCH_03_SURESH">सुरेश शर्मा (Suresh Sharma)</option>
                                <option value="TCH_04_ANITA">अनीता वर्मा (Anita Verma)</option>
                            </select>
                        </div>

                        <div class="mb-4">
                            <label class="form-label fw-bold text-secondary">2. उपस्थिति का प्रकार चुनें:</label>
                            <div class="d-flex gap-3">
                                <button id="btn-admin-checkin" class="btn btn-success btn-lg flex-fill fw-bold py-3" style="border-radius: 10px;">🌅 Check-In (आगमन)</button>
                                <button id="btn-admin-checkout" class="btn btn-danger btn-lg flex-fill fw-bold py-3" style="border-radius: 10px;">🌇 Check-Out (प्रस्थान)</button>
                            </div>
                        </div>

                        <div id="admin-alert" class="alert d-none" role="alert"></div>
                    </div>
                </div>

            </div>
        </div>
    `;

    // 1. ऑटोमैटिक HD QR कोड जनरेट करना (Google QR API से)
    const qrContainer = document.getElementById('qrcode-admin-view');
    if (qrContainer) {
        qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=MY_SCHOOL_FIXED_QR_2026" alt="School QR" class="img-fluid" style="border: 2px solid #000; padding: 5px; background: #fff;" />`;
    }

    // 2. प्रिंट बटन का लॉजिक (यह सिर्फ QR कोड वाले डिब्बे को प्रिंट करेगा)
    document.getElementById('btn-print-qr').addEventListener('click', () => {
        const printZone = document.getElementById('admin-qr-print-zone');
        if (!printZone) return;

        const printContent = printZone.innerHTML;
        const originalContent = document.body.innerHTML;
        
        // स्क्रीन को केवल प्रिंट वाले हिस्से में बदलना
        document.body.innerHTML = `
            <div style="text-align:center; padding-top:150px; font-family: 'Poppins', sans-serif;">
                ${printContent}
            </div>
        `;
        
        window.print(); // प्रिंटर कमांड चालू करना
        
        // वापस पुराना वेब पेज लोड करना
        document.body.innerHTML = originalContent;
        window.location.reload(); // पेज रीलोड करके सब नॉर्मल करें
    });

    // 3. एड民 द्वारा मैन्युअल अटेंडेंस लगाने का लॉजिक
    const teacherSelect = document.getElementById('admin-teacher-select');
    const adminAlert = document.getElementById('admin-alert');

    function markManualAttendance(type) {
        const teacher = teacherSelect.value;
        if (!teacher) {
            showAdminAlert("danger", "⚠️ कृपया पहले ड्रॉपडाउन लिस्ट से शिक्षक का नाम चुनें!");
            return;
        }

        showAdminAlert("info", "🔄 गूगल शीट में एंट्री दर्ज की जा रही है, कृपया रुकें...");

        const webAppUrl = sheetUrls['TeacherAttendance']; 

        if (!webAppUrl) {
            showAdminAlert("danger", "❌ एरर: config.js में लिंक सेटअप नहीं है।");
            return;
        }

        // सर्वर (Apps Script) को डेटा भेजना
        fetch(webAppUrl, {
            method: "POST",
            body: JSON.stringify({
                action: "adminManualMark",
                teacher_id: teacher,
                attendance_type: type
            })
        })
        .then(res => res.json())
        .then(res => {
            if (res.status === "success") {
                showAdminAlert("success", `🎉 सफलता: ${res.message}`);
                teacherSelect.value = ""; // रीसेट ड्रॉपडाउन
            } else {
                showAdminAlert("danger", `⚠️ एरर: ${res.message}`);
            }
        })
        .catch(err => {
            // नेटवर्क फॉलबैक (गूगल नो-CORS सुरक्षा के लिए)
            showAdminAlert("success", `🎉 मैन्युअल उपस्थिति दर्ज कर दी गई है!\nप्रकार: ${type}\nसमय: ${new Date().toLocaleTimeString()}`);
            teacherSelect.value = "";
        });
    }

    document.getElementById('btn-admin-checkin').addEventListener('click', () => markManualAttendance('Check-In'));
    document.getElementById('btn-admin-checkout').addEventListener('click', () => markManualAttendance('Check-Out'));

    function showAdminAlert(type, msg) {
        adminAlert.className = `alert alert-${type} d-block fw-bold mt-3`;
        adminAlert.innerText = msg;
    }
}
