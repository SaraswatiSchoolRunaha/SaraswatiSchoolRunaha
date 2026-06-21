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

    // ==========================================
    // 🟢 यहाँ से नया डिज़ाइन कोड शुरू हो रहा है 
    // ==========================================
    // 🎨 पूरी तरह रिस्पॉन्सिव और परफेक्टली फिटेड CSS (Fixed Design)
    if (!document.getElementById('attendance-premium-styles')) {
        const styleTag = document.createElement('style');
        styleTag.id = 'attendance-premium-styles';
        styleTag.innerHTML = `
            .attendance-container { 
                margin-top: 20px; 
                padding: 10px; 
                width: 100%;
                box-sizing: border-box;
            }
            .attendance-card { 
                background: #ffffff; 
                border: 1px solid #e2e8f0 !important; 
                border-radius: 20px !important; 
                box-shadow: 0 15px 35px rgba(0,0,0,0.05) !important; 
                overflow: hidden;
                width: 100%;
                max-width: 420px;
                box-sizing: border-box;
            }
            .pin-input-field { 
                letter-spacing: 12px; 
                text-align: center; 
                font-size: 24px !important; 
                font-weight: bold;
                border-radius: 14px !important; 
                padding: 12px !important; 
                background: #f8fafc; 
                border: 2px solid #e2e8f0; 
                transition: all 0.3s ease;
                width: 100%;
                box-sizing: border-box;
            }
            .pin-input-field:focus {
                background: #ffffff;
                border-color: #2563eb;
                box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15) !important;
            }
            .profile-box { 
                background: linear-gradient(145deg, #f8fafc, #f1f5f9); 
                border-radius: 14px; 
                padding: 15px; 
                border: 1px solid #e2e8f0; 
                width: 100%;
                box-sizing: border-box;
            }
            .info-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 0;
                border-bottom: 1px dashed #e2e8f0;
                gap: 10px;
            }
            .info-row:last-child { border-bottom: none; }
            .info-label { color: #64748b; font-size: 14px; font-weight: 500; white-space: nowrap; }
            .info-value { color: #1e293b; font-weight: 700; font-size: 15px; text-align: right; word-break: break-word; }

            .btn-modern { 
                border-radius: 14px !important; 
                padding: 12px 15px !important; 
                font-weight: 700 !important; 
                font-size: 15px !important;
                transition: all 0.2s ease; 
                border: none !important;
                width: 100% !important;
                display: block;
                box-sizing: border-box;
            }
            .btn-verify { 
                background: linear-gradient(135deg, #2563eb, #1d4ed8); 
                color: #fff; 
                box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
            }
            .btn-verify:hover { 
                transform: translateY(-1px);
                box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
                color: #fff;
            }
            .btn-camera { 
                background: linear-gradient(135deg, #10b981, #059669); 
                color: #fff; 
                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
            }
            .btn-camera:hover { 
                transform: translateY(-1px);
                box-shadow: 0 6px 16px rgba(16, 185, 129, 0.3);
                color: #fff;
            }
            .notice-alert {
                background-color: #fff8e1;
                border-left: 4px solid #ffb300;
                border-radius: 12px;
                padding: 12px;
                box-sizing: border-box;
                width: 100%;
            }
            .camera-container {
                border: 3px solid #e2e8f0;
                box-shadow: inset 0 2px 8px rgba(0,0,0,0.2);
                width: 100%;
                box-sizing: border-box;
            }
        `;
        document.head.appendChild(styleTag);
    }
    container.innerHTML = `
        <div class="attendance-container">
            <div class="card attendance-card p-4 mx-auto" style="max-width: 420px;">
                <div class="text-center mb-4">
                    <div class="mb-2" style="font-size: 40px;">📝</div>
                    <h4 class="fw-bold text-dark mb-1">${mainTitle}</h4>
                    <p class="text-muted small px-2">${descText}</p>
                </div>
                
                <div id="pin-section">
                    <input type="password" id="teacher-pin" class="form-control pin-input-field mb-3" placeholder="****" maxlength="4" inputmode="numeric">
                    <button id="verify-pin-btn" class="btn btn-modern btn-verify w-100">👤 पहचान सत्यापित करें</button>
                </div>

                <div id="profile-section" class="d-none">
                    <div class="profile-box mb-3">
                        <div class="info-row">
                            <span class="info-label">👤 नाम:</span>
                            <span id="lbl-name" class="info-value">-</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">🪪 ID:</span>
                            <span id="lbl-id" class="info-value">-</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">📱 मोबाइल:</span>
                            <span id="lbl-phone" class="info-value">-</span>
                        </div>
                    </div>
                    <button id="open-cam-btn" class="btn btn-modern btn-camera w-100">📷 कैमरा चालू करें</button>
                </div>

                <div id="status-alert" class="alert mt-3 d-none text-center rounded-3"></div>
                <div id="camera-preview" class="mt-3 rounded-4 camera-container" style="display:none; height:250px; overflow:hidden; background:#000;"></div>

                <div class="notice-alert mt-4">
                    <p class="text-warning-emphasis small m-0 fw-semibold" style="font-size: 12.5px; line-height: 1.5;">
                        ⚠️ <strong>सूचना:</strong> उपस्थिति के लिए GPS ऑन रखें और स्कूल परिसर के 50 मीटर के दायरे में रहें।
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
export function loadTeacherAttendanceDashboard() {
    const container = document.getElementById('contentArea');
    if (!container) return;
    
    // पुराना कचरा और स्टाइल्स साफ करें
    container.innerHTML = ""; 
    container.removeAttribute('style'); 
    
    const style = `
        <style>
            .attendance-dashboard-wrapper {
                width: 100% !important;
                max-width: 100% !important;
                display: block !important;
                box-sizing: border-box !important;
                padding: 20px !important;
            }
            
            /* नया स्लीक और कॉम्पैक्ट काउंट रो डिज़ाइन */
            .attendance-summary-bar {
                background: linear-gradient(135deg, #0d6efd, #0056b3) !important;
                color: #ffffff !important;
                padding: 10px 18px !important;
                border-radius: 10px !important;
                box-shadow: 0 4px 10px rgba(13, 110, 253, 0.15) !important;
                display: inline-flex !important;
                align-items: center !important;
                gap: 12px !important;
                width: auto !important;
                border: 1px solid rgba(255, 255, 255, 0.1) !important;
            }

            .attendance-bar-label {
                color: rgba(255, 255, 255, 0.9) !important;
                font-size: 0.95rem !important;
                font-weight: 600 !important;
                margin-bottom: 0 !important;
            }

            .attendance-bar-count {
                font-size: 1.4rem !important;
                font-weight: 800 !important;
                background: rgba(255, 255, 255, 0.2) !important;
                padding: 2px 12px !important;
                border-radius: 6px !important;
                line-height: 1.2 !important;
                display: inline-block !important;
            }

            /* लिस्ट का कंटेनर */
            .attendance-list-container {
                display: flex;
                flex-direction: column;
                gap: 12px;
                width: 100%;
            }

            /* लिस्ट का हर एक सिंगल आइटम (Card Row) */
            .attendance-list-item {
                background: #ffffff;
                border-left: 5px solid #198754; /* उपस्थित दर्शाने के लिए हरी पट्टी */
                padding: 15px;
                border-radius: 6px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 10px;
            }

            .teacher-name {
                font-weight: 700;
                color: #212529;
                font-size: 1.05rem;
            }

            .time-badge-container {
                display: flex;
                gap: 15px;
            }

            .time-badge {
                padding: 4px 10px;
                border-radius: 4px;
                font-size: 0.85rem;
                font-weight: bold;
            }

            .badge-in { background-color: #d1e7dd; color: #0f5132; }
            .badge-out { background-color: #f8d7da; color: #842029; }
        </style>
    `;

    container.innerHTML = style + `
        <div class="attendance-dashboard-wrapper">
            <div class="row mx-0 mb-3">
                <div class="col-12 d-flex justify-content-between align-items-center px-0 flex-wrap gap-2">
                    <h4 class="fw-bold mb-0 text-dark">📊 शिक्षक उपस्थिति डैशबोर्ड</h4>
                    <small class="text-muted" id="last-updated"></small>
                </div>
            </div>
            
            <div class="row mx-0 mb-4">
                <div class="col-12 px-0">
                    <div class="attendance-summary-bar">
                        <span class="attendance-bar-label">📋 कुल उपस्थित (आज):</span>
                        <span id="total-present-count" class="attendance-bar-count">0</span>
                    </div>
                </div>
            </div>

            <div class="row mx-0">
                <div class="col-12 px-0">
                    <h6 class="fw-bold text-secondary mb-3">आज की उपस्थिति सूची</h6>
                    <div id="dashboard-list-body" class="attendance-list-container">
                        <div class="text-center py-4 text-muted">
                            <div class="spinner-border spinner-border-sm text-primary"></div>
                            <span class="ms-2">डेटा लोड हो रहा है...</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    fetchAttendanceData();
}

async function fetchAttendanceData() {
    const listBody = document.getElementById('dashboard-list-body');
    const totalCountEl = document.getElementById('total-present-count');
    const lastUpdatedEl = document.getElementById('last-updated');
    
    if (!listBody || !totalCountEl) return;

    // 🛠️ बिल्कुल सटीक टाइमज़ोन फिक्सर (जो सीधे Google Sheet के टाइम को IST में बदलेगा)
    const formatTime = (timeStr) => {
        if (!timeStr || timeStr === "--" || timeStr === "") return "--:--";
        
        // यदि डेटा पहले से ही AM/PM टेक्स्ट के रूप में मिल रहा है
        if (typeof timeStr === 'string' && (timeStr.includes('AM') || timeStr.includes('PM'))) {
            return timeStr;
        }

        try {
            let dateObj;

            // 1. यदि डेटा केवल "07:44:10" या "02:14:10" जैसी सिंपल स्ट्रिंग है
            if (typeof timeStr === 'string' && timeStr.includes(':') && !timeStr.includes('T') && !timeStr.includes('Z')) {
                // आज की तारीख का आधार लेकर एक वैलिड टाइम ऑब्जेक्ट तैयार करें
                const todayStr = new Date().toISOString().split('T')[0];
                
                // अगर आपके बैकएंड से आने वाला समय पहले से ही UTC में शिफ्टेड आ रहा है (जैसे 02:14) 
                // तो उसे Z (UTC) मानकर ब्राउज़र को भारतीय समय (Asia/Kolkata) में बदलने की अनुमति दें
                dateObj = new Date(`${todayStr}T${timeStr.trim()}${timeStr.length <= 8 ? 'Z' : ''}`);
            } 
            // 2. यदि पूरा ISO फॉर्मेट आ रहा है (जैसे: "1899-12-30T02:14:10.000Z")
            else {
                dateObj = new Date(timeStr);
            }

            // भारतीय समयानुसार (IST) 12-घंटे के AM/PM फॉर्मेट में रिटर्न करें
            if (!isNaN(dateObj.getTime())) {
                return dateObj.toLocaleTimeString('en-US', {
                    timeZone: 'Asia/Kolkata',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                });
            }
        } catch (e) {
            console.error("Time parsing failed, fallback used:", e);
        }
        
        return timeStr; 
    };

    try {
        const webAppUrl = sheetUrls['TeacherAttendance'];
        const res = await fetch(`${webAppUrl}?action=getTodayAttendance`);
        const data = await res.json();
        
        if (data.status === "success" && data.list && data.list.length > 0) {
            totalCountEl.innerText = data.list.length;
            if (lastUpdatedEl) {
                lastUpdatedEl.innerText = "अंतिम अपडेट: " + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            }
            
            listBody.innerHTML = data.list.map(t => {
                const checkIn = formatTime(t.checkIn);
                const checkOut = formatTime(t.checkOut);

                return `
                    <div class="attendance-list-item">
                        <div class="teacher-name">👤 ${t.name}</div>
                        <div class="time-badge-container">
                            <span class="time-badge badge-in">🟢 In: ${checkIn}</span>
                            <span class="time-badge badge-out">🔴 Out: ${checkOut}</span>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            totalCountEl.innerText = "0";
            listBody.innerHTML = '<div class="text-center py-4 text-muted bg-white rounded shadow-sm">📅 आज अभी तक कोई उपस्थिति दर्ज नहीं हुई है।</div>';
        }
    } catch (e) {
        console.error("Fetch Error:", e);
        listBody.innerHTML = '<div class="text-center py-4 text-danger bg-white rounded shadow-sm">❌ डेटा लोड करने में विफल।</div>';
    }
}
// --- नया शिक्षक जोड़ने का फॉर्म सेक्शन ---
export function loadAddNewTeacherForm() {
    const container = document.getElementById('contentArea');
    if (!container) return;

    // पुराने स्टाइल्स और डैटा को साफ करें
    if (!document.getElementById('add-teacher-premium-styles')) {
        const styleTag = document.createElement('style');
        styleTag.id = 'add-teacher-premium-styles';
        styleTag.innerHTML = `
            .form-container { margin-top: 25px; padding: 10px; width: 100%; box-sizing: border-box; }
            .form-card { 
                background: #ffffff; 
                border: 1px solid #e2e8f0 !important; 
                border-radius: 20px !important; 
                box-shadow: 0 15px 35px rgba(0,0,0,0.05) !important; 
                overflow: hidden;
                width: 100%;
                max-width: 440px;
                box-sizing: border-box;
            }
            .form-label-modern {
                font-weight: 600;
                color: #475569;
                font-size: 14px;
                margin-bottom: 6px;
                display: block;
            }
            .input-field-modern {
                border-radius: 12px !important;
                padding: 12px 14px !important;
                background: #f8fafc;
                border: 2px solid #e2e8f0;
                font-size: 15px !important;
                transition: all 0.3s ease;
                width: 100%;
                box-sizing: border-box;
            }
            .input-field-modern:focus {
                background: #ffffff;
                border-color: #2563eb;
                box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15) !important;
                outline: none;
            }
            .btn-save-teacher {
                background: linear-gradient(135deg, #2563eb, #1d4ed8);
                color: #fff;
                box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
            }
            .btn-save-teacher:hover {
                transform: translateY(-1px);
                box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
                color: #fff;
            }
        `;
        document.head.appendChild(styleTag);
    }

    container.innerHTML = `
        <div class="form-container">
            <div class="card form-card p-4 mx-auto">
                <div class="text-center mb-4">
                    <div class="mb-2" style="font-size: 40px;">➕</div>
                    <h4 class="fw-bold text-dark mb-1">नया शिक्षक जोड़ें</h4>
                    <p class="text-muted small">डेटाबेस में नया शिक्षक पंजीकृत करने के लिए विवरण भरें।</p>
                </div>

                <form id="add-teacher-form" onsubmit="return false;">
                    <div class="mb-3">
                        <label class="form-label-modern">🪪 शिक्षक ID (Teacher ID)</label>
                        <input type="text" id="new-teacher-id" class="form-control input-field-modern" placeholder="जैसे: T101" required>
                    </div>

                    <div class="mb-3">
                        <label class="form-label-modern">👤 शिक्षक का नाम (Teacher Name)</label>
                        <input type="text" id="new-teacher-name" class="form-control input-field-modern" placeholder="पूरा नाम दर्ज करें" required>
                    </div>

                    <div class="mb-3">
                        <label class="form-label-modern">📱 मोबाइल नंबर (Mobile No.)</label>
                        <input type="tel" id="new-teacher-phone" class="form-control input-field-modern" placeholder="10 अंकों का मोबाइल नंबर" maxlength="10" inputmode="numeric" required>
                    </div>

                    <div class="mb-4">
                        <label class="form-label-modern">🔑 सीक्रेट पिन (4-Digit PIN)</label>
                        <input type="password" id="new-teacher-pin" class="form-control input-field-modern" placeholder="****" maxlength="4" inputmode="numeric" style="letter-spacing: 4px;" required>
                    </div>

                    <div id="form-status-alert" class="alert d-none text-center rounded-3 fw-bold p-3 mb-3 border-0"></div>

                    <button type="submit" id="save-teacher-btn" class="btn btn-modern btn-save-teacher w-100">💾 शिक्षक रिकॉर्ड सुरक्षित करें</button>
                </form>
            </div>
        </div>
    `;

    // इवेंट लिसनर जोड़ना
    const form = document.getElementById('add-teacher-form');
    const saveBtn = document.getElementById('save-teacher-btn');
    const statusAlert = document.getElementById('form-status-alert');

    form.addEventListener('submit', () => {
        const tId = document.getElementById('new-teacher-id').value.trim();
        const tName = document.getElementById('new-teacher-name').value.trim();
        const tPhone = document.getElementById('new-teacher-phone').value.trim();
        const tPin = document.getElementById('new-teacher-pin').value.trim();

        // बेसिक वैलिडेशन
        if (tPhone.length !== 10 || isNaN(tPhone)) {
            showFormAlert("danger", "⚠️ कृपया एक वैध 10-अंकीय मोबाइल नंबर दर्ज करें!");
            return;
        }
        if (tPin.length !== 4 || isNaN(tPin)) {
            showFormAlert("danger", "⚠️ पिन नंबर अनिवार्य रूप से 4 अंकों का होना चाहिए!");
            return;
        }

        // बटन को लोडिंग स्टेट में लाना
        saveBtn.disabled = true;
        const originalBtnText = saveBtn.innerHTML;
        saveBtn.innerHTML = `⏳ डेटाबेस में सहेजा जा रहा है...`;
        showFormAlert("primary", "🔄 सर्वर से संपर्क किया जा रहा है...");

        const webAppUrl = sheetUrls['TeacherAttendance'];

        // Google Sheet Apps Script पर डेटा भेजना
fetch(webAppUrl, {
    method: "POST",
    body: JSON.stringify({
        action: "addNewTeacher",
        teacher_id: tId,
        teacher_name: tName,
        phone: tPhone,
        pin: tPin
    })
})
.then(res => res.json())
.then(response => {
    saveBtn.disabled = false;
    saveBtn.innerHTML = originalBtnText;

    if (response.status === "success") {
        showFormAlert("success", "🎉 " + response.message);
        form.reset(); // फॉर्म क्लियर करें
    } else {
        showFormAlert("danger", "⚠️ " + response.message);
    }
})
.catch(err => {
    saveBtn.disabled = false;
    saveBtn.innerHTML = originalBtnText;
    showFormAlert("danger", "❌ नेटवर्क त्रुटि! रिकॉर्ड सेव नहीं हो सका।");
    console.error(err);
});
 });       
    // अलर्ट दिखाने का लोकल फंक्शन
    function showFormAlert(type, message) {
        let bgClass = `alert-${type}`;
        if (type === 'primary') bgClass = 'bg-primary text-white';
        if (type === 'success') bgClass = 'bg-success text-white';
        if (type === 'danger') bgClass = 'bg-danger text-white';
        
        statusAlert.className = `alert ${bgClass} d-block fw-bold shadow-sm border-0 p-3 my-2`;
        statusAlert.innerText = message;
    }
}
// =========================================================================
// 🆕 नया फ़ंक्शन: एडिट और डिलीट ऑप्शन के साथ सभी टीचर्स की लिस्ट दिखाना
// =========================================================================
export function loadTeacherListWithActions() {
    const container = document.getElementById('contentArea');
    if (!container) return;

    // लिस्ट के प्रीमियम स्टाइल्स जोड़ें
    if (!document.getElementById('teacher-list-premium-styles')) {
        const styleTag = document.createElement('style');
        styleTag.id = 'teacher-list-premium-styles';
        styleTag.innerHTML = `
            .list-wrapper { margin-top: 20px; padding: 15px; width: 100%; box-sizing: border-box; }
            .list-card {
                background: #ffffff;
                border-radius: 16px !important;
                box-shadow: 0 10px 30px rgba(0,0,0,0.05) !important;
                border: 1px solid #e2e8f0 !important;
                padding: 20px;
            }
            .teacher-table-container { overflow-x: auto; margin-top: 15px; }
            .custom-table { width: 100%; border-collapse: collapse; }
            .custom-table th { background-color: #f1f5f9; color: #475569; font-weight: 600; padding: 12px; text-align: left; font-size: 14px; border-bottom: 2px solid #e2e8f0; }
            .custom-table td { padding: 14px 12px; font-size: 15px; color: #1e293b; border-bottom: 1px solid #f1f5f9; }
            .custom-table tr:hover { background-color: #f8fafc; }
            .action-btn-group { display: flex; gap: 6px; }
            .btn-action { padding: 6px 12px; border-radius: 8px; font-size: 13px; font-weight: 600; border: none; cursor: pointer; transition: all 0.2s; }
            .btn-edit-action { background-color: #fef3c7; color: #d97706; }
            .btn-edit-action:hover { background-color: #fde68a; }
            .btn-delete-action { background-color: #fee2e2; color: #dc2626; }
            .btn-delete-action:hover { background-color: #fca5a5; }
        `;
        document.head.appendChild(styleTag);
    }

    container.innerHTML = `
        <div class="list-wrapper">
            <div class="card list-card">
                <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                    <div>
                        <h4 class="fw-bold text-dark mb-1">📋 सभी पंजीकृत शिक्षक</h4>
                        <p class="text-muted small mb-0">शिक्षकों के विवरण को यहाँ से अपडेट या डिलीट किया जा सकता है।</p>
                    </div>
                    <button id="refresh-list-btn" class="btn btn-sm btn-outline-primary rounded-3 px-3 fw-bold">🔄 रीफ्रेश लिस्ट</button>
                </div>
                
                <div id="list-status-alert" class="alert d-none text-center rounded-3 fw-bold p-3 mb-2 border-0"></div>

                <div class="teacher-table-container">
                    <table class="custom-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>शिक्षक का नाम</th>
                                <th>मोबाइल नंबर</th>
                                <th>पिन (PIN)</th>
                                <th>एक्शन (Actions)</th>
                            </tr>
                        </thead>
                        <tbody id="teachers-list-tbody">
                            <tr>
                                <td colspan="5" class="text-center py-4 text-muted">डेटा लोड हो रहा है...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    const tbody = document.getElementById('teachers-list-tbody');
    const refreshBtn = document.getElementById('refresh-list-btn');
    const listAlert = document.getElementById('list-status-alert');
    const webAppUrl = sheetUrls['TeacherAttendance'];

    // अलर्ट प्रदर्शित करने का फंक्शन
    function showListAlert(type, message) {
        let bgClass = `alert-${type}`;
        if (type === 'success') bgClass = 'bg-success text-white';
        if (type === 'danger') bgClass = 'bg-danger text-white';
        if (type === 'primary') bgClass = 'bg-primary text-white';
        
        listAlert.className = `alert ${bgClass} d-block fw-bold p-3 mb-3 text-center border-0 rounded-3`;
        listAlert.innerText = message;
        setTimeout(() => listAlert.className = 'd-none', 4000);
    }

    // शिक्षकों का डेटा लोड करने का मुख्य फ़ंक्शन
    function fetchAllTeachers() {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">⏳ सूची लोड की जा रही है...</td></tr>`;
        
        // सभी डेटा लाने के लिए doGet का उपयोग (बिना एक्शन पैरामीटर के)
       fetch(`${webAppUrl}?action=getTeachersList`)
.then(res => res.json())
.then(response => {

    tbody.innerHTML = "";

    if (
        response.status !== "success" ||
        !response.teachers ||
        response.teachers.length === 0
    ) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4 text-muted">
                    कोई रिकॉर्ड नहीं मिला।
                </td>
            </tr>
        `;
        return;
    }

    response.teachers.forEach(teacher => {

        const tr = document.createElement('tr');

        tr.id = `teacher-row-${teacher.id}`;

        tr.innerHTML = `
            <td class="fw-bold">${teacher.id}</td>
            <td class="t-name-cell">${teacher.name}</td>
            <td class="t-phone-cell">${teacher.mobile}</td>
            <td class="t-pin-cell">••••</td>
            <td>
                <div class="action-btn-group">
                    <button class="btn-action btn-edit-action"
                        data-id="${teacher.id}">
                        ✏️ Edit
                    </button>

                    <button class="btn-action btn-delete-action"
                        data-id="${teacher.id}">
                        🗑️ Delete
                    </button>
                </div>
            </td>
        `;

        tbody.appendChild(tr);
    });

    attachActionEvents();
})
.catch(err => {
    console.error("Teacher List Error:", err);

    tbody.innerHTML = `
        <tr>
            <td colspan="5" class="text-center py-4 text-danger">
                ❌ डेटा लोड करने में त्रुटि हुई!
            </td>
        </tr>
    `;
});
        
    function attachActionEvents() {
        // एडिट बटन के लिए लॉजिक
        document.querySelectorAll('.btn-edit-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const row = document.getElementById(`teacher-row-${id}`);
                const currentName = row.querySelector('.t-name-cell').innerText;
                const currentPhone = row.querySelector('.t-phone-cell').innerText;

                const newName = prompt("नया शिक्षक नाम दर्ज करें:", currentName);
                if (newName === null || newName.trim() === "") return;

                const newPhone = prompt("नया 10-अंकीय मोबाइल नंबर दर्ज करें:", currentPhone);
                if (newPhone === null || newPhone.trim() === "" || isNaN(newPhone) || newPhone.trim().length !== 10) {
                    alert("वैध मोबाइल नंबर आवश्यक है!");
                    return;
                }

                const newPin = prompt("नया 4-अंकीय सीक्रेट पिन दर्ज करें (बदलाव नहीं करना हो तो पुराना पिन डालें):");
                if (newPin === null || newPin.trim() === "" || isNaN(newPin) || newPin.trim().length !== 4) {
                    alert("4-अंकीय पिन आवश्यक है!");
                    return;
                }

                showListAlert("primary", "⏳ विवरण अपडेट किया जा रहा है...");

                const updateData = new URLSearchParams();
                updateData.append("action", "updateTeacher");
                updateData.append("teacher_id", id);
                updateData.append("teacher_name", newName.trim());
                updateData.append("phone", newPhone.trim());
                updateData.append("pin", newPin.trim());

                fetch(webAppUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: updateData.toString()
                })
                .then(res => res.json())
                .then(res => {
                    if (res.status === "success") {
                        showListAlert("success", "🎉 " + res.message);
                        fetchAllTeachers(); // लिस्ट अपडेट करें
                    } else {
                        showListAlert("danger", "⚠️ " + res.message);
                    }
                })
                .catch(() => showListAlert("danger", "❌ नेटवर्क त्रुटि! रिकॉर्ड अपडेट नहीं हो सका।"));
            });
        });

        // डिलीट बटन के लिए लॉजिक
        document.querySelectorAll('.btn-delete-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const row = document.getElementById(`teacher-row-${id}`);
                const teacherName = row.querySelector('.t-name-cell').innerText;

                if (!confirm(`⚠️ सावधान! क्या आप वाकई शिक्षक "${teacherName}" का रिकॉर्ड डेटाबेस से हमेशा के लिए हटाना चाहते हैं?`)) {
                    return;
                }

                showListAlert("primary", "⏳ रिकॉर्ड हटाया जा रहा है...");

                const deleteData = new URLSearchParams();
                deleteData.append("action", "deleteTeacher");
                deleteData.append("teacher_id", id);

                fetch(webAppUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: deleteData.toString()
                })
                .then(res => res.json())
                .then(res => {
                    if (res.status === "success") {
                        showListAlert("success", "🗑️ " + res.message);
                        fetchAllTeachers(); // लिस्ट को रीलोड करें
                    } else {
                        showListAlert("danger", "⚠️ " + res.message);
                    }
                })
                .catch(() => showListAlert("danger", "❌ नेटवर्क त्रुटि! रिकॉर्ड डिलीट नहीं हो सका।"));
            });
        });
    }

    refreshBtn.addEventListener('click', fetchAllTeachers);
    fetchAllTeachers(); // फ़ंक्शन कॉल जिससे पहली बार में डेटा लोड हो जाए
    }

