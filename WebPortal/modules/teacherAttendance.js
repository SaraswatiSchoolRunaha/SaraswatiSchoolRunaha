import { sheetUrls, translations, state } from './config.js';
// 🌟 'Html5Qrcode is not defined' एरर को रोकने के लिए लाइब्रेरी को सीधे यहाँ इम्पोर्ट किया गया है
import { Html5Qrcode } from "https://esm.sh/html5-qrcode";

export function loadTeacherAttendance() {
    // 1. एचटीएमएल (UI) को रेंडर करना जहाँ अटेंडेंस का कार्ड दिखेगा
    const container = document.getElementById('contentArea'); 
    
    if (!container) {
        console.error("Error: 'contentArea' element not found in HTML layout.");
        return;
    }

    const currentLang = state.currentLang || 'HN';
    const mainTitle = translations[currentLang]['शिक्षक उपस्थिति'] || 'शिक्षक उपस्थिति';
    const descText = currentLang === 'HN' 
        ? 'उपस्थिति दर्ज करने के लिए अपना सीक्रेट पिन नंबर दर्ज करें।' 
        : 'Enter your secret PIN number to verify your identity and mark attendance.';

    // 🎨 CSS स्टाइल्स को डायनामिकली इंजेक्ट करना (बेहतर डिज़ाइन और होवर इफ़ेक्ट्स के लिए)
    if (!document.getElementById('attendance-custom-styles')) {
        const styleTag = document.createElement('style');
        styleTag.id = 'attendance-custom-styles';
        styleTag.innerHTML = `
            .attendance-card {
                background: #ffffff;
                border: none;
                border-radius: 24px !important;
                box-shadow: 0 12px 40px rgba(30, 58, 138, 0.08) !important;
                transition: transform 0.3s ease;
            }
            .pin-input-field {
                letter-spacing: 12px; 
                border: 2px solid #e2e8f0; 
                border-radius: 14px !important;
                font-size: 24px !important;
                color: #1e3a8a;
                background-color: #f8fafc;
                transition: all 0.3s ease;
            }
            .pin-input-field:focus {
                border-color: #1e3a8a !important;
                background-color: #ffffff;
                box-shadow: 0 0 0 4px rgba(30, 58, 138, 0.15) !important;
            }
            .btn-verify {
                background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
                border: none;
                border-radius: 14px !important;
                transition: all 0.3s ease;
            }
            .btn-verify:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(30, 58, 138, 0.3);
            }
            .btn-camera {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                border: none;
                border-radius: 14px !important;
                transition: all 0.3s ease;
            }
            .btn-camera:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
            }
            .profile-box {
                background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
                border-radius: 16px;
                border-left: 6px solid #10b981;
                box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
            }
            .badge-custom {
                background-color: #e0f2fe;
                color: #0369a1;
                padding: 4px 10px;
                border-radius: 8px;
                font-size: 12px;
                font-weight: 600;
            }
        `;
        document.head.appendChild(styleTag);
    }

    container.innerHTML = `
        <div class="card attendance-card p-4 text-center mx-auto" style="max-width: 480px; margin-top: 40px;">
            <div class="mb-4">
                <div class="d-inline-flex align-items-center justify-content-center bg-light text-primary rounded-circle mb-3" style="width: 60px; height: 60px; font-size: 28px;">
                    📍
                </div>
                <h3 class="fw-extrabold text-dark mb-2" style="letter-spacing: -0.5px;">${mainTitle}</h3>
                <p class="text-muted px-2" style="font-size: 14px; line-height: 1.5;">${descText}</p>
            </div>
            
            <hr class="my-3" style="opacity: 0.1;">

            <div id="pin-section" class="mb-2">
                <div class="form-group mb-3 text-start">
                    <label class="form-label small fw-bold text-secondary mb-2 uppercase" style="letter-spacing: 0.5px;">
                        ${currentLang === 'HN' ? '🔑 अपना सीक्रेट पिन कोड डालें:' : '🔑 Enter Your Secret PIN:'}
                    </label>
                    <input type="password" id="teacher-pin" class="form-control form-control-lg text-center fw-bold pin-input-field" placeholder="••••" maxlength="6">
                </div>
                <button id="verify-pin-btn" class="btn btn-primary btn-lg w-100 py-3 fw-bold btn-verify">
                    👤 पहचान सत्यापित करें (Verify Identity)
                </button>
            </div>

            <div id="profile-section" class="d-none text-start p-4 mb-3 profile-box">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5 class="fw-bold text-success m-0">✅ पहचान सत्यापित!</h5>
                    <span class="badge-custom">Active Staff</span>
                </div>
                <div class="mb-3" style="font-size: 15px; color: #334155;">
                    <div class="py-2 border-bottom d-flex justify-content-between">
                        <span class="text-muted">शिक्षक आईडी (ID):</span>
                        <span class="fw-bold text-dark" id="lbl-id">-</span>
                    </div>
                    <div class="py-2 border-bottom d-flex justify-content-between">
                        <span class="text-muted">नाम (Name):</span>
                        <span class="fw-bold text-dark" id="lbl-name">-</span>
                    </div>
                    <div class="py-2 d-flex justify-content-between">
                        <span class="text-muted">मोबाइल (Mobile):</span>
                        <span class="fw-bold text-dark" id="lbl-phone">-</span>
                    </div>
                </div>
                <button id="open-cam-btn" class="btn btn-success btn-lg w-100 py-3 fw-bold btn-camera mt-2">
                    📷 कैमरा चालू करें (Open Camera)
                </button>
            </div>

            <div id="status-alert" class="alert d-none shadow-sm rounded-3 fw-bold text-start border-0 p-3 my-3" role="alert"></div>
            
            <div id="camera-preview" class="mb-3" style="width: 100%; border-radius: 16px; overflow: hidden; background: #0f172a; display: none; box-shadow: 0 10px 25px rgba(0,0,0,0.2);"></div>
            
            <div class="mt-3 p-2 rounded-3" style="background-color: #fdf2f8; border: 1px dashed #fbcfe8;">
                <p class="text-danger small m-0 fw-semibold">
                    ⚠️ नोट: आपका मोबाइल स्कूल के <b>50 मीटर</b> के दायरे में होना और GPS ऑन होना अनिवार्य है।
                </p>
            </div>
        </div>
    `;

    // 2. आवश्यक वेरिएबल्स और एलिमेंट्स
    const pinSection = document.getElementById('pin-section');
    const profileSection = document.getElementById('profile-section');
    const teacherPinInput = document.getElementById('teacher-pin');
    const verifyPinBtn = document.getElementById('verify-pin-btn');
    const openCamBtn = document.getElementById('open-cam-btn');
    const cameraPreview = document.getElementById('camera-preview');
    const statusAlert = document.getElementById('status-alert');

    let verifiedTeacherData = null;
    const qrScanner = new Html5Qrcode("camera-preview");

    // स्कूल के कोऑर्डिनेट्स
    const SCHOOL_LAT = 26.8467; 
    const SCHOOL_LNG = 80.9462;
    const ALLOWED_RADIUS = 50; 

    // 3. पिन चेक करने का लॉजिक
    verifyPinBtn.addEventListener('click', () => {
        const inputPin = teacherPinInput.value.trim();
        if (!inputPin) {
            showAlert("danger", "⚠️ कृपया अपना पिन नंबर दर्ज करें!");
            return;
        }

        showAlert("primary", "🔄 डेटाबेस से आपका पिन मिलाया जा रहा है...");
        verifyPinBtn.disabled = true;

        const webAppUrl = sheetUrls['TeacherAttendance']; 
        
        fetch(`${webAppUrl}?action=getTeacherByPin&pin=${inputPin}`)
            .then(res => res.json())
            .then(data => {
                verifyPinBtn.disabled = false;
                if (data.status === "success") {
                    verifiedTeacherData = data.teacher;
                    
                    document.getElementById('lbl-id').innerText = verifiedTeacherData.id;
                    document.getElementById('lbl-name').innerText = verifiedTeacherData.name;
                    document.getElementById('lbl-phone').innerText = verifiedTeacherData.phone;
                    
                    pinSection.classList.add('d-none');
                    profileSection.classList.remove('d-none');
                    statusAlert.classList.add('d-none'); // पुराना अलर्ट छुपाएं
                } else {
                    showAlert("danger", "❌ गलत पिन नंबर! कृपया दोबारा सही पिन डालें।");
                }
            })
            .catch(err => {
                verifyPinBtn.disabled = false;
                showAlert("danger", "❌ डेटाबेस से संपर्क नहीं हो सका। कृपया अपना इंटरनेट या Apps Script Deployment चेक करें।");
            });
    });

    // 4. कैमरा बटन पर क्लिक करने का इवेंट
    openCamBtn.addEventListener('click', () => {
        showAlert("primary", "🔄 आपकी लाइव लोकेशन जांची जा रही है, कृपया प्रतीक्षा करें...");

        if (!navigator.geolocation) {
            showAlert("danger", "❌ आपका डिवाइस GPS सपोर्ट नहीं करता है।");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const uLat = position.coords.latitude;
                const uLng = position.coords.longitude;

                const distance = calculateDistance(uLat, uLng, SCHOOL_LAT, SCHOOL_LNG);

                if (distance <= ALLOWED_RADIUS) {
                    showAlert("success", "✅ लोकेशन सही है! कैमरा खुल रहा है, स्कूल का QR कोड स्कैन करें...");
                    profileSection.classList.add('d-none');
                    cameraPreview.style.display = 'block';
                    
                    startScanning(uLat, uLng);
                } else {
                    showAlert("danger", `❌ उपस्थिति अस्वीकृत! आप स्कूल से ${Math.round(distance)} मीटर दूर हैं। कृपया परिसर के अंदर आएं।`);
                }
            },
            (error) => {
                showAlert("danger", "❌ कृपया उपस्थिति के लिए अपने मोबाइल की 'Location / GPS' परमिशन ऑन करें।");
            },
            { enableHighAccuracy: true }
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
            (err) => { /* फ्रेम एरर को इग्नोर करें */ }
        ).catch(err => {
            showAlert("danger", "कैमरा शुरू नहीं हो सका: " + err);
            profileSection.classList.remove('d-none');
        });
    }

    // 6. गूगल शीट बैकएंड को डेटा भेजना
    function sendDataToServer(qrText, lat, lng) {
        const webAppUrl = sheetUrls['TeacherAttendance']; 

        if (!webAppUrl) {
            showAlert("danger", "❌ त्रुटि: config.js में 'TeacherAttendance' का लिंक कॉन्फ़िगर नहीं है।");
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
            showAlert("success", `🎉 उपस्थिति सफलतापूर्वक प्रोसेस कर दी गई है!\nशिक्षक: ${verifiedTeacherData.name}\nसमय: ${new Date().toLocaleTimeString()}`);
            setTimeout(() => { loadTeacherAttendance(); }, 4000);
        });
    }

    // 7. दूरी मापने का फॉर्मूला (Haversine Formula)
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

    // 8. अलर्ट मैसेज दिखाने का यूटिलिटी फंक्शन
    function showAlert(type, message) {
        // Bootstrap की डिफ़ॉल्ट क्लास को कस्टम कलर्स के साथ अलाइन किया गया है
        let bgClass = `alert-${type}`;
        if (type === 'primary') bgClass = 'bg-primary text-white';
        if (type === 'success') bgClass = 'bg-success text-white';
        if (type === 'danger') bgClass = 'bg-danger text-white';
        
        statusAlert.className = `alert ${bgClass} d-block fw-bold shadow-sm border-0 p-3 my-3`;
        statusAlert.innerText = message;
    }
}
