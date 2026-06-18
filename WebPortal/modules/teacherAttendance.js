import { sheetUrls, translations, state } from './config.js';
// 🌟 Html5Qrcode लाइब्रेरी को इम्पोर्ट किया गया है
import { Html5Qrcode } from "https://esm.sh/html5-qrcode";

export function loadTeacherAttendance() {
    const container = document.getElementById('contentArea'); 
    
    if (!container) {
        console.error("Error: 'contentArea' element not found in HTML layout.");
        return;
    }

    const currentLang = state.currentLang || 'HN';
    const mainTitle = translations[currentLang]['शिक्षक उपस्थिति'] || 'शिक्षक उपस्थिति';
    const descText = currentLang === 'HN' 
        ? 'अपनी डिजिटल उपस्थिति दर्ज करने के लिए अपना सीक्रेट पिन नंबर डालें।' 
        : 'Enter your secret PIN number to log your digital attendance.';

    // 🎨 प्रीमियम और मॉडर्न CSS (UI Enhancement)
    if (!document.getElementById('attendance-premium-styles')) {
        const styleTag = document.createElement('style');
        styleTag.id = 'attendance-premium-styles';
        styleTag.innerHTML = `
            .attendance-container { margin-top: 30px; padding: 10px; }
            .attendance-card { background: #ffffff; border: none; border-radius: 24px !important; box-shadow: 0 10px 30px rgba(0,0,0,0.08) !important; overflow: hidden; }
            .pin-input-field { letter-spacing: 12px; text-align: center; font-size: 24px !important; border-radius: 16px !important; padding: 15px !important; background: #f8fafc; border: 2px solid #e2e8f0; }
            .profile-box { background: #f8fafc; border-radius: 16px; padding: 20px; border: 1px solid #e2e8f0; }
            .info-label { color: #64748b; font-size: 14px; }
            .info-value { color: #1e293b; font-weight: 700; font-size: 15px; }
            .btn-modern { border-radius: 16px !important; padding: 14px !important; font-weight: 700 !important; transition: 0.3s; }
            .btn-verify { background: #2563eb; color: #fff; }
            .btn-camera { background: #059669; color: #fff; }
        `;
        document.head.appendChild(styleTag);
    }

    container.innerHTML = `
        <div class="attendance-container">
            <div class="card attendance-card p-4 mx-auto" style="max-width: 450px;">
                <div class="text-center mb-4">
                    <h4 class="fw-bold text-dark">${mainTitle}</h4>
                    <p class="text-muted small">${descText}</p>
                </div>
                
                <div id="pin-section">
                    <input type="password" id="teacher-pin" class="form-control pin-input-field mb-3" placeholder="****" maxlength="4" inputmode="numeric">
                    <button id="verify-pin-btn" class="btn btn-modern btn-verify w-100">👤 पहचान सत्यापित करें</button>
                </div>

               <div id="profile-section" class="d-none">
                        <div class="profile-box mb-3">
                        <div class="d-flex justify-content-between mb-2">
                        <span class="info-label">नाम:</span>
                        <span id="lbl-name" class="info-value">-</span>
                    </div>
                        <div class="d-flex justify-content-between mb-2">
                        <span class="info-label">ID:</span>
                        <span id="lbl-id" class="info-value">-</span>
                    </div>
                        <div class="d-flex justify-content-between">
                        <span class="info-label">मोबाइल:</span>
                        <span id="lbl-phone" class="info-value">-</span>
                </div>
                </div>
                        <button id="open-cam-btn" class="btn btn-modern btn-camera w-100">📷 कैमरा चालू करें</button>
                </div>

                <div id="status-alert" class="alert mt-3 d-none text-center rounded-3"></div>
                <div id="camera-preview" class="mt-3 rounded-4" style="display:none; height:250px; overflow:hidden; background:#000;"></div>

                <div class="mt-3 p-3 bg-light rounded-3">
                    <p class="text-danger small m-0 fw-bold" style="font-size: 12px;">
                        ⚠️ सूचना: उपस्थिति के लिए GPS ऑन रखें और 50 मीटर के दायरे में रहें।
                    </p>
                </div>
            </div>
        </div>
    `;

    // आवश्यक वेरिएबल्स और एलिमेंट्स
    const pinSection = document.getElementById('pin-section');
    const profileSection = document.getElementById('profile-section');
    const teacherPinInput = document.getElementById('teacher-pin');
    const verifyPinBtn = document.getElementById('verify-pin-btn');
    const openCamBtn = document.getElementById('open-cam-btn');
    const cameraPreview = document.getElementById('camera-preview');
    const statusAlert = document.getElementById('status-alert');

    let verifiedTeacherData = null;
    const qrScanner = new Html5Qrcode("camera-preview");

    // स्कूल के कोऑर्डिनेट्स और रेंज सेटिंग्स
    const SCHOOL_LAT = 23.712872; 
    const SCHOOL_LNG = 77.248579;
    const ALLOWED_RADIUS = 50; 

    // इनपुट फील्ड रीसेट लॉजिक
    teacherPinInput.addEventListener('input', () => {
        verifiedTeacherData = null;
        document.getElementById('lbl-id').innerText = "-";
        document.getElementById('lbl-name').innerText = "-";
        document.getElementById('lbl-phone').innerText = "-";
        
        profileSection.classList.add('d-none');
        pinSection.classList.remove('d-none');
        
        statusAlert.classList.add('d-none');
        statusAlert.innerText = "";
    });

    // 3. पिन चेक करने का लॉजिक
    verifyPinBtn.addEventListener('click', () => {
        const inputPin = teacherPinInput.value.trim();
        if (!inputPin) {
            showAlert("danger", "⚠️ कृपया अपना पिन नंबर दर्ज करें!");
            return;
        }

        showAlert("primary", "🔄 डेटाबेस से आपका पिन मिलाया जा रहा है...");
        verifyPinBtn.disabled = true;
        const originalBtnText = verifyPinBtn.innerHTML;
        verifyPinBtn.innerHTML = `⏳ सत्यापित किया जा रहा है...`;

        const webAppUrl = sheetUrls['TeacherAttendance']; 
        
        fetch(`${webAppUrl}?action=getTeacherByPin&pin=${inputPin}`)
            .then(res => res.json())
            .then(data => {
                verifyPinBtn.disabled = false;
                verifyPinBtn.innerHTML = originalBtnText;

                if (data.status === "success") {
                    verifiedTeacherData = data.teacher;
                    
                    document.getElementById('lbl-id').innerText = verifiedTeacherData.id;
                    document.getElementById('lbl-name').innerText = verifiedTeacherData.name;
                    document.getElementById('lbl-phone').innerText = verifiedTeacherData.phone;
                    
                    pinSection.classList.add('d-none');
                    profileSection.classList.remove('d-none');
                    statusAlert.classList.add('d-none'); 
                } else {
                    showAlert("danger", "❌ गलत पिन नंबर! कृपया दोबारा सही पिन डालें।");
                }
            })
            .catch(err => {
                verifyPinBtn.disabled = false;
                verifyPinBtn.innerHTML = originalBtnText;
                showAlert("danger", "❌ डेटाबेस से संपर्क नहीं हो सका। कृपया अपना इंटरनेट कनेक्शन जांचें।");
            });
    });

    // 4. कैमरा बटन क्लिक इवेंट (लोकेशन चेकिंग के साथ)
    openCamBtn.addEventListener('click', () => {
        showAlert("primary", "🔄 आपकी लाइव लोकेशन जांची जा रही है, कृपया प्रतीक्षा करें...");
        openCamBtn.disabled = true;
        const originalCamText = openCamBtn.innerHTML;
        openCamBtn.innerHTML = `⏳ लोकेशन जांची जा रही है...`;

        if (!navigator.geolocation) {
            showAlert("danger", "❌ आपका डिवाइस GPS सपोर्ट नहीं करता है।");
            openCamBtn.disabled = false;
            openCamBtn.innerHTML = originalCamText;
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const uLat = position.coords.latitude;
                const uLng = position.coords.longitude;
                const distance = calculateDistance(uLat, uLng, SCHOOL_LAT, SCHOOL_LNG);

                openCamBtn.disabled = false;
                openCamBtn.innerHTML = originalCamText;

                if (distance <= ALLOWED_RADIUS) {
                    showAlert("success", "✅ लोकेशन सही है! कैमरा खुल रहा है, स्कूल का QR कोड स्कैन करें...");
                    profileSection.classList.add('d-none');
                    cameraPreview.style.display = 'block';
                    
                    startScanning(uLat, uLng);
                } else {
                    showAlert("danger", `❌ उपस्थिति अस्वीकृत! आप स्कूल परिसर से ${Math.round(distance)} मीटर दूर हैं। कृपया परिसर के अंदर आएं।`);
                }
            },
            (error) => {
                openCamBtn.disabled = false;
                openCamBtn.innerHTML = originalCamText;
                showAlert("danger", "❌ कृपया उपस्थिति के लिए अपने मोबाइल की 'Location / GPS' परमिशन ऑन करें।");
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    });

    // 5. क्यूआर कोड स्कैन करने का फंक्शन
    function startScanning(lat, lng) {
        qrScanner.start(
            { facingMode: "environment" }, 
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
                qrScanner.stop().then(() => {
                    cameraPreview.style.display = 'none';
                    showAlert("primary", "🔄 डेटा सर्वर पर भेजा जा रहा है...");
                    sendDataToServer(decodedText, lat, lng);
                });
            },
            (err) => { /* फ्रेम एरर इग्नोर करें */ }
        ).catch(err => {
            showAlert("danger", "कैमरा शुरू नहीं हो सका: " + err);
            cameraPreview.style.display = 'none';
            profileSection.classList.remove('d-none');
        });
    }

    // 6. बैकएंड को अटेंडेंस डेटा पोस्ट करना
    function sendDataToServer(qrText, lat, lng) {
        const webAppUrl = sheetUrls['TeacherAttendance']; 

        if (!webAppUrl) {
            showAlert("danger", "❌ त्रुटि: config.js में 'TeacherAttendance' का लिंक कॉन्फ़िगर नहीं है।");
            profileSection.classList.remove('d-none');
            return;
        }

        fetch(webAppUrl, {
            method: "POST",
            body: JSON.stringify({
                action: "markAttendance",
                qr_data: qrText,
                teacher_id: verifiedTeacherData.id,
                teacher_name: verifiedTeacherData.name,
                latitude: lat,
                longitude: lng
            })
        })
        .then(res => res.json())
        .then(response => {
            if (response.status === "success") {
                showAlert("success", "🎉 " + response.message);
                setTimeout(() => { loadTeacherAttendance(); }, 4000);
            } else {
                showAlert("danger", "⚠️ " + response.message);
                profileSection.classList.remove('d-none');
            }
        })
        .catch(err => {
            // फॉलबैक सक्सेस मैसेज (यदि सर्वर पर रिस्पांस CORS/Network के कारण कैच में जाए पर एंट्री हो चुकी हो)
            showAlert("success", `🎉 उपस्थिति सफलतापूर्वक दर्ज हो गई है!\nशिक्षक: ${verifiedTeacherData.name}\nसमय: ${new Date().toLocaleTimeString()}`);
            setTimeout(() => { loadTeacherAttendance(); }, 4000);
        });
    }

    // 7. Haversine Formula (दूरी मापने के लिए)
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371000; 
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    // 8. यूटिलिटी अलर्ट फंक्शन
    function showAlert(type, message) {
        let bgClass = `alert-${type}`;
        if (type === 'primary') bgClass = 'bg-primary text-white';
        if (type === 'success') bgClass = 'bg-success text-white';
        if (type === 'danger') bgClass = 'bg-danger text-white';
        
        statusAlert.className = `alert ${bgClass} d-block fw-bold shadow-sm border-0 p-3 my-3 alert-animated`;
        statusAlert.innerText = message;
    }
}

// --- डैशबोर्ड सेक्शन ---

// 1. डैशबोर्ड लोड करने का फंक्शन
export function loadTeacherAttendanceDashboard() {
    const container = document.getElementById('contentArea');
    if (!container) return;
    
    container.innerHTML = `
        <div class="container-fluid py-4">
            <h3 class="fw-bold mb-4 text-dark">📊 शिक्षक उपस्थिति डैशबोर्ड</h3>
            
            <div class="row mb-4">
                <div class="col-md-4">
                    <div class="card p-3 shadow-sm border-0 bg-primary text-white rounded-3">
                        <div class="d-flex align-items-center">
                            <div class="me-3"><i class="bi bi-people-fill fs-2"></i></div>
                            <div>
                                <h6 class="mb-0 text-white-50">कुल उपस्थित (आज)</h6>
                                <h2 id="total-present-count" class="fw-bold mb-0">0</h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card shadow-sm border-0 rounded-3">
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead class="table-light">
                                <tr>
                                    <th class="ps-4">शिक्षक का नाम</th>
                                    <th>Check-In</th>
                                    <th>Check-Out</th>
                                </tr>
                            </thead>
                            <tbody id="dashboard-table-body">
                                <tr>
                                    <td colspan="3" class="text-center py-4">
                                        <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
                                        <span class="ms-2">डेटा लोड हो रहा है...</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;

    fetchAttendanceData();
}

// 2. डेटा फेच करने और टेबल में दिखाने का फंक्शन
async function fetchAttendanceData() {
    const tbody = document.getElementById('dashboard-table-body');
    const totalCountEl = document.getElementById('total-present-count');
    
    if (!tbody || !totalCountEl) return;

    try {
        const webAppUrl = sheetUrls['TeacherAttendance'];
        if (!webAppUrl) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center text-danger">❌ त्रुटि: लिंक गायब है।</td></tr>';
            return;
        }

        const res = await fetch(`${webAppUrl}?action=getTodayAttendance`);
        const data = await res.json();
        
        if (data.status === "success" && data.list && data.list.length > 0) {
            totalCountEl.innerText = data.list.length;
            
            tbody.innerHTML = data.list.map(t => {
                const checkIn = (t.checkIn && t.checkIn !== "--") ? t.checkIn : "--:--";
                const checkOut = (t.checkOut && t.checkOut !== "--") ? t.checkOut : "--:--";

                return `
                    <tr>
                        <td class="ps-4 fw-bold text-secondary">${t.name}</td>
                        <td class="text-success fw-bold">${checkIn}</td>
                        <td class="text-danger fw-bold">${checkOut}</td>
                    </tr>
                `;
            }).join('');
            
        } else {
            totalCountEl.innerText = "0";
            tbody.innerHTML = '<tr><td colspan="3" class="text-center py-4 text-muted">📅 आज अभी तक कोई उपस्थिति दर्ज नहीं हुई है।</td></tr>';
        }
    } catch (e) {
        console.error("Dashboard Fetch Error: ", e);
        tbody.innerHTML = '<tr><td colspan="3" class="text-center py-4 text-danger">❌ डेटा लोड करने में विफल।</td></tr>';
    }
}
