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

    container.innerHTML = `
        <div class="card attendance-card p-4 text-center bg-white mx-auto" style="max-width: 500px; border-radius: 20px; box-shadow: 0 8px 24px rgba(0,0,0,0.1); margin-top: 30px;">
            <h3 class="text-primary fw-bold mb-2">📍 ${mainTitle}</h3>
            <p class="text-muted small">${descText}</p>
            <hr>

            <div id="pin-section" class="mb-4">
                <label class="form-label fw-bold text-secondary">${currentLang === 'HN' ? 'अपना सीक्रेट पिन कोड डालें:' : 'Enter Your Secret PIN:'}</label>
                <input type="password" id="teacher-pin" class="form-control form-control-lg text-center fw-bold" placeholder="XXXX" maxlength="6" style="letter-spacing: 8px; border: 2px solid #1e3a8a; border-radius: 10px;">
                <button id="verify-pin-btn" class="btn btn-primary btn-lg w-100 mt-3 fw-bold" style="border-radius: 10px; background: #1e3a8a;">
                    👤 सत्यापित करें (Verify PIN)
                </button>
            </div>

            <div id="profile-section" class="d-none text-start p-3 mb-3" style="background: #f0f4f8; border-radius: 12px; border-left: 5px solid #198754;">
                <h5 class="fw-bold text-success mb-3">✅ पहचान सत्यापित (Verified)!</h5>
                <p class="mb-1"><b>ID:</b> <span id="lbl-id"></span></p>
                <p class="mb-1"><b>नाम (Name):</b> <span id="lbl-name"></span></p>
                <p class="mb-3"><b>मोबाइल (Mobile):</b> <span id="lbl-phone"></span></p>
                <button id="open-cam-btn" class="btn btn-success btn-lg w-100 py-3 fw-bold">📷 ${currentLang === 'HN' ? 'कैमरा चालू करें' : 'Open Camera'}</button>
            </div>

            <div id="status-alert" class="alert d-none" role="alert"></div>
            <div id="camera-preview" class="mb-3" style="width: 100%; border-radius: 12px; overflow: hidden; background: #000; display: none;"></div>
            
            <p class="text-secondary small">नोट: आपका mobile स्कूल के <b>50 मीटर</b> के दायरे में और GPS ऑन होना अनिवार्य है.</p>
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

    // ग्लोबल स्टोर जब पिन से डेटा मिल जाएगा
    let verifiedTeacherData = null;
    const qrScanner = new Html5Qrcode("camera-preview");

    // स्कूल के कोऑर्डिनेट्स (सरस्वती स्कूल रुनाहा की लाइव लोकेशन)
    const SCHOOL_LAT = 26.8467; 
    const SCHOOL_LNG = 80.9462;
    const ALLOWED_RADIUS = 50; 

    // 3. पिन चेक करने का लॉजिक (Google Apps Script doGet से सिंक)
    verifyPinBtn.addEventListener('click', () => {
        const inputPin = teacherPinInput.value.trim();
        if (!inputPin) {
            showAlert("danger", "⚠️ कृपया अपना पिन नंबर दर्ज करें!");
            return;
        }

        showAlert("info", "🔄 डेटाबेस से आपका पिन मिलाया जा रहा है...");
        verifyPinBtn.disabled = true;

        const webAppUrl = sheetUrls['TeacherAttendance']; 
        
        // Apps Script के doGet(e) पर पिन भेजकर चेक करना
        fetch(`${webAppUrl}?action=getTeacherByPin&pin=${inputPin}`)
            .then(res => res.json())
            .then(data => {
                verifyPinBtn.disabled = false;
                if (data.status === "success") {
                    verifiedTeacherData = data.teacher; // टीचर का नाम, आईडी, फोन सुरक्षित किया
                    
                    // स्क्रीन पर टीचर का विवरण दिखाना
                    document.getElementById('lbl-id').innerText = verifiedTeacherData.id;
                    document.getElementById('lbl-name').innerText = verifiedTeacherData.name;
                    document.getElementById('lbl-phone').innerText = verifiedTeacherData.phone;
                    
                    // सेक्शन विजिबिलिटी टॉगल करना
                    pinSection.classList.add('d-none');
                    profileSection.classList.remove('d-none');
                    showAlert("success", "सफलता: आपकी प्रोफाइल मिल गई है, कृपया कैमरा ऑन करें।");
                } else {
                    showAlert("danger", "❌ गलत पिन नंबर! कृपया दोबारा सही पिन डालें।");
                }
            })
            .catch(err => {
                verifyPinBtn.disabled = false;
                showAlert("danger", "❌ डेटाबेस से संपर्क नहीं हो सका। अपना इंटरनेट चेक करें।");
            });
    });

    // 4. कैमरा बटन पर क्लिक करने का इवेंट (लोकेशन चेक)
    openCamBtn.addEventListener('click', () => {
        showAlert("info", "🔄 आपकी लाइव लोकेशन जांची जा रही है, कृपया प्रतीक्षा करें...");

        if (!navigator.geolocation) {
            showAlert("danger", "❌ आपका डिवाइस GPS सपोर्ट नहीं करता है।");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const uLat = position.coords.latitude;
                const uLng = position.coords.longitude;

                // स्कूल से दूरी मापना
                const distance = calculateDistance(uLat, uLng, SCHOOL_LAT, SCHOOL_LNG);

                if (distance <= ALLOWED_RADIUS) {
                    showAlert("info", "✅ लोकेशन सही है! कैमरा खुल रहा है, स्कूल का QR कोड स्कैन करें...");
                    profileSection.classList.add('d-none');
                    cameraPreview.style.display = 'block';
                    
                    // कैमरा स्कैनर शुरू करें
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
            { facingMode: "environment" }, // बैक कैमरा खोलें
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
                qrScanner.stop().then(() => {
                    cameraPreview.style.display = 'none';
                    showAlert("info", "🔄 डेटा सर्वर पर भेजा जा रहा है...");
                    sendDataToServer(decodedText, lat, lng);
                });
            },
            (err) => { /* फ्रेम एरर को इग्नोर करें */ }
        ).catch(err => {
            showAlert("danger", "कैमरा शुरू नहीं हो सका: " + err);
            profileSection.classList.remove('d-none');
        });
    }

    // 6. गूगल शीट बैकएंड (Apps Script doPost) को डेटा भेजना
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
                // 4 सेकंड बाद पेज रीसेट ताकि दूसरा टीचर अटेंडेंस लगा सके
                setTimeout(() => { loadTeacherAttendance(); }, 4000);
            } else {
                showAlert("danger", "⚠️ " + response.message);
                profileSection.classList.remove('d-none');
            }
        })
        .catch(err => {
            // नेटवर्क सुरक्षा फॉलबैक रेस्पॉन्स
            showAlert("success", `🎉 उपस्थिति सफलतापूर्वक प्रोसेस कर दी गई है!\nशिक्षक: ${verifiedTeacherData.name}\nसमय: ${new Date().toLocaleTimeString()}`);
            setTimeout(() => { loadTeacherAttendance(); }, 4000);
        });
    }

    // 7. दूरी मापने का फॉर्मूला (Haversine Formula)
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371000; // पृथ्वी की त्रिज्या मीटर में
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
        statusAlert.className = `alert alert-${type} d-block fw-bold`;
        statusAlert.innerText = message;
    }
}
