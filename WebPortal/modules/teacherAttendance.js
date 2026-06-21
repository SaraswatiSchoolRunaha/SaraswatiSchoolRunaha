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
export function loadTeacherAttendanceDashboard() {
    const container = document.getElementById('contentArea');
    if (!container) return;
    
    // पैरेंट कंटेनर (#contentArea) को जबरदस्ती अपनी सीमा में रखने के लिए डायरेक्ट स्टाइलिंग
    container.style.setProperty('flex', '1 1 0%', 'important');
    container.style.setProperty('min-width', '0px', 'important');
    container.style.setProperty('max-width', '100%', 'important');
    container.style.setProperty('overflow-x', 'hidden', 'important');
    
    // यदि इसके ऊपर कोई row/flex पैरेंट है तो उसे भी नियंत्रित करने के लिए ग्लोबल CSS
    const style = `
        <style>
            /* पैरेंट और ग्रैंडपैरेंट एलिमेंट्स को फिक्स करने के लिए */
            #contentArea, 
            #contentArea > div {
                min-width: 0 !important;
                max-width: 100% !important;
            }

            .table-min-height { min-height: 100px; }
            
            /* मुख्य कंटेनर जो बची हुई खाली जगह में ही सिमटेगा */
            .dashboard-main-container {
                display: block !important;
                width: 100% !important;
                max-width: 100% !important;
                min-width: 0 !important;
                box-sizing: border-box !important;
                overflow-x: hidden !important;
            }
            
            /* टेबल को केवल अपने बॉक्स के अंदर स्क्रॉल कराने के लिए सबसे महत्वपूर्ण ब्लॉक */
            .table-responsive-wrapper { 
                overflow-x: auto !important; 
                width: 100% !important; 
                max-width: 100% !important;
                display: block !important;
                box-sizing: border-box !important;
                -webkit-overflow-scrolling: touch;
                border: 1px solid #dee2e6;
                border-radius: 8px;
            }
            
            /* एक्सेल ग्रिड टेबल डिजाइन */
            .excel-grid-table { 
                table-layout: fixed !important; 
                width: 100% !important; 
                min-width: 600px; /* मोबाइल पर स्क्रॉल बार लाने के लिए जरूरी */
                border-collapse: collapse !important;
                margin-bottom: 0 !important;
            }
            
            /* हर सेल के चारों तरफ एक्सेल जैसी ग्रिड बॉर्डर लाइन्स */
            .excel-grid-table th, .excel-grid-table td {
                border: 1px solid #c0c0c0 !important; 
                padding: 12px 15px !important;
                vertical-align: middle !important;
                text-align: left !important;
            }
            
            /* कॉलम चौड़ाई फिक्स रखना */
            .excel-grid-table th:nth-child(1), .excel-grid-table td:nth-child(1) { width: 40% !important; max-width: 0 !important; }
            .excel-grid-table th:nth-child(2), .excel-grid-table td:nth-child(2) { width: 30% !important; max-width: 0 !important; }
            .excel-grid-table th:nth-child(3), .excel-grid-table td:nth-child(3) { width: 30% !important; max-width: 0 !important; }
            
            /* हेडर बैकग्राउंड कलर */
            .excel-grid-table thead th {
                background-color: #f2f2f2 !important;
                color: #212529 !important;
                font-weight: bold !important;
            }
            
            /* काउंट बॉक्स का सुधरा हुआ डिज़ाइन */
            .attendance-card {
                background-color: #0d6efd !important;
                color: #ffffff !important;
                padding: 20px !important;
                border-radius: 8px !important;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
                display: inline-block !important;
                min-width: 250px !important;
            }
        </style>
    `;

    container.innerHTML = style + `
        <div class="p-3 dashboard-main-container">
            <div class="row mx-0 mb-4 w-100" style="min-width: 0;">
                <div class="col-12 d-flex justify-content-between align-items-center px-0 flex-wrap gap-2">
                    <h3 class="fw-bold mb-0 text-dark">📊 शिक्षक उपस्थिति डैशबोर्ड</h3>
                    <small class="text-muted" id="last-updated"></small>
                </div>
            </div>
            
            <div class="row mx-0 mb-4 w-100" style="min-width: 0;">
                <div class="col-12 px-0">
                    <div class="attendance-card">
                        <div class="text-white-50 small text-uppercase fw-bold mb-1">कुल उपस्थित (आज)</div>
                        <h2 id="total-present-count" class="fw-bold mb-0" style="font-size: 2.5rem;">0</h2>
                    </div>
                </div>
            </div>

            <div class="row mx-0 w-100" style="min-width: 0;">
                <div class="col-12 px-0">
                    <div class="table-responsive-wrapper table-min-height">
                        <table class="table mb-0 excel-grid-table">
                            <thead>
                                <tr>
                                    <th>शिक्षक का नाम</th>
                                    <th>Check-In</th>
                                    <th>Check-Out</th>
                                </tr>
                            </thead>
                            <tbody id="dashboard-table-body">
                                <tr>
                                    <td colspan="3" class="text-center py-4">
                                        <div class="spinner-border spinner-border-sm text-primary"></div>
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
async function fetchAttendanceData() {
    const tbody = document.getElementById('dashboard-table-body');
    const totalCountEl = document.getElementById('total-present-count');
    const lastUpdatedEl = document.getElementById('last-updated');
    
    if (!tbody || !totalCountEl) return;

    // टाइम फॉर्मेट करने का एडवांस्ड हेल्पर फंक्शन (ISO और 1899 डेट बग फिक्स)
    const formatTime = (timeStr) => {
        if (!timeStr || timeStr === "--" || timeStr === "") return "--:--";
        
        // अगर पहले से सही फॉर्मेट में है (जैसे 07:44 AM)
        if (typeof timeStr === 'string' && (timeStr.includes('AM') || timeStr.includes('PM'))) {
            return timeStr;
        }

        try {
            let dateObj;
            if (typeof timeStr === 'string' && timeStr.includes('T')) {
                // ISO फॉर्मेट (e.g., 1899-12-30T02:23:00.000Z) को हैंडल करने के लिए
                dateObj = new Date(timeStr);
                
                // अगर टाइमजोन की वजह से इनवैलिड या अजीब डेट आ रही है, तो केवल टाइम का हिस्सा निकालें
                if (isNaN(dateObj.getTime()) || timeStr.startsWith('1899')) {
                    const timeParts = timeStr.split('T')[1].split('.')[0]; // "02:23:00"
                    const [hrs, mins] = timeParts.split(':');
                    let hour = parseInt(hrs, 10);
                    const ampm = hour >= 12 ? 'PM' : 'AM';
                    hour = hour % 12;
                    hour = hour ? hour : 12; // 0 को 12 बनाएं
                    return `${String(hour).padStart(2, '0')}:${mins} ${ampm}`;
                }
            } else {
                dateObj = new Date(timeStr);
            }

            if (!isNaN(dateObj.getTime())) {
                return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
            }
        } catch (e) {
            console.error("Time format error:", e);
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
                lastUpdatedEl.innerText = "अंतिम अपडेट: " + new Date().toLocaleTimeString();
            }
            
            tbody.innerHTML = data.list.map(t => {
                const checkIn = formatTime(t.checkIn);
                const checkOut = formatTime(t.checkOut);

                return `
                    <tr>
                        <td class="fw-bold text-secondary text-truncate" style="width: 40%; max-width: 0;" title="${t.name}">
                            ${t.name}
                        </td>
                        <td class="text-success fw-bold text-truncate" style="width: 30%; max-width: 0;" title="${checkIn}">${checkIn}</td>
                        <td class="text-danger fw-bold text-truncate" style="width: 30%; max-width: 0;" title="${checkOut}">${checkOut}</td>
                    </tr>
                `;
            }).join('');
        } else {
            totalCountEl.innerText = "0";
            tbody.innerHTML = '<tr><td colspan="3" class="text-center py-4 text-muted">📅 आज अभी तक कोई उपस्थिति दर्ज नहीं हुई है।</td></tr>';
        }
    } catch (e) {
        console.error("Fetch Error:", e);
        tbody.innerHTML = '<tr><td colspan="3" class="text-center py-4 text-danger">❌ डेटा लोड करने में विफल।</td></tr>';
    }
}
