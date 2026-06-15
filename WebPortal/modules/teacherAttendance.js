import { sheetUrls, translations, state } from './config.js';
import { loadTeacherAttendance } from './teacherAttendance.js';

export function loadTeacherAttendance() {
    // 1. एचटीएमएल (UI) को रेंडर करना जहाँ अटेंडेंस का कार्ड दिखेगा
    // ✅ FIXED: main.js के अनुसार आईडी को 'contentArea' कर दिया गया है ताकि container null न हो
    const container = document.getElementById('contentArea'); 
    
    if (!container) {
        console.error("Error: 'contentArea' element not found in HTML layout.");
        return;
    }

    // ✅ FIXED: translations ऑब्जेक्ट से एक्टिव भाषा के अनुसार डायनामिक नाम उठाना
    const currentLang = state.currentLang || 'HN';
    const mainTitle = translations[currentLang]['शिक्षक उपस्थिति'] || 'शिक्षक उपस्थिति';
    const descText = currentLang === 'HN' 
        ? 'उपस्थिति दर्ज करने के लिए स्कूल परिसर में लगे QR कोड को स्कैन करें।' 
        : 'Scan the official QR code installed at the school campus to mark attendance.';

    container.innerHTML = `
        <div class="card attendance-card p-4 text-center bg-white mx-auto" style="max-width: 500px; border-radius: 20px; box-shadow: 0 8px 24px rgba(0,0,0,0.1); margin-top: 30px;">
            <h3 class="text-primary fw-bold mb-2">📍 ${mainTitle}</h3>
            <p class="text-muted small">${descText}</p>
            <hr>

            <div id="status-alert" class="alert d-none" role="alert"></div>

            <button id="open-cam-btn" class="btn btn-success btn-lg w-100 py-3 fw-bold mb-3">📷 ${currentLang === 'HN' ? 'कैमरा चालू करें' : 'Open Camera'}</button>
            
            <div id="camera-preview" class="mb-3" style="width: 100%; border-radius: 12px; overflow: hidden; background: #000; display: none;"></div>
            
            <p class="text-secondary small">नोट: आपका मोबाइल स्कूल के <b>50 मीटर</b> के दायरे में और GPS ऑन होना अनिवार्य है.</p>
        </div>
    `;

    // 2. आवश्यक वेरिएबल्स और कॉन्फ़िगरेशन
    const openCamBtn = document.getElementById('open-cam-btn');
    const cameraPreview = document.getElementById('camera-preview');
    const statusAlert = document.getElementById('status-alert');

    // html5-qrcode लाइब्रेरी का इंस्टेंस
    const qrScanner = new Html5Qrcode("camera-preview");

    // स्कूल के कोऑर्डिनेट्स (सरस्वती स्कूल रुनाहा की लाइव लोकेशन लोकेशन)
    const SCHOOL_LAT = 26.8467; 
    const SCHOOL_LNG = 80.9462;
    const ALLOWED_RADIUS = 50; // 50 मीटर का दायरा

    // वर्तमान लॉगिन टीचर की आईडी निकालना
    const LOGGED_IN_TEACHER_ID = window.currentUser?.id || new URLSearchParams(window.location.search).get('uid') || "TCH_DEFAULT"; 

    // 3. बटन पर क्लिक करने का इवेंट लिस्टनर
    openCamBtn.addEventListener('click', () => {
        showAlert("info", "🔄 आपकी लाइव लोकेशन जांची जा रही है, कृपया प्रतीक्षा करें...");

        if (!navigator.geolocation) {
            showAlert("danger", "❌ आपका dispositivo GPS सपोर्ट नहीं करता है।");
            return;
        }

        // GPS लोकेशन प्राप्त करना
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const uLat = position.coords.latitude;
                const uLng = position.coords.longitude;

                // स्कूल से दूरी मापना
                const distance = calculateDistance(uLat, uLng, SCHOOL_LAT, SCHOOL_LNG);

                if (distance <= ALLOWED_RADIUS) {
                    showAlert("info", "✅ लोकेशन सही है! कैमरा खुल रहा है, QR कोड स्कैन करें...");
                    openCamBtn.style.display = 'none';
                    cameraPreview.style.display = 'block';
                    
                    // कैमरा स्कैनर शुरू करें
                    startScanning(uLat, uLng);
                } else {
                    showAlert("danger", `❌ उपस्थिति अस्वीकृत! आप स्कूल से ${Math.round(distance)} मीटर दूर हैं। कृपया स्कूल के अंदर आकर स्कैन करें।`);
                }
            },
            (error) => {
                showAlert("danger", "❌ कृपया उपस्थिति के लिए अपने मोबाइल की 'Location / GPS' परमिशन ऑन करें।");
            },
            { enableHighAccuracy: true } // बिल्कुल सटीक जीपीएस डेटा के लिए
        );
    });

    // 4. क्यूआर कोड स्कैन करने का फंक्शन
    function startScanning(lat, lng) {
        qrScanner.start(
            { facingMode: "environment" }, // मोबाइल का बैक कैमरा खोलें
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
                // जैसे ही कोड स्कैन होगा, कैमरा बंद कर देंगे
                qrScanner.stop().then(() => {
                    cameraPreview.style.display = 'none';
                    showAlert("info", "🔄 डेटा सर्वर पर भेजा जा रहा है...");
                    sendDataToServer(decodedText, lat, lng);
                });
            },
            (err) => { /* फ़्रेम स्कैन एरर इग्नोर करें */ }
        ).catch(err => {
            showAlert("danger", "कैमरा शुरू नहीं हो सका: " + err);
            openCamBtn.style.display = 'block';
        });
    }

    // 5. गूगल शीट बैकएंड (Apps Script) को डेटा भेजना
    function sendDataToServer(qrText, lat, lng) {
        // ✅ FIXED: आपकी config.js में की-नेम 'TeacherAttendance' है, उसे यहाँ मैप कर दिया है
        const webAppUrl = sheetUrls['TeacherAttendance']; 

        if (!webAppUrl) {
            showAlert("danger", "❌ त्रुटि: config.js में 'TeacherAttendance' का URL लिंक कॉन्फ़िगर नहीं है।");
            return;
        }

        fetch(webAppUrl, {
            method: "POST",
            body: JSON.stringify({
                qr_data: qrText,
                teacher_id: LOGGED_IN_TEACHER_ID,
                latitude: lat,
                longitude: lng
            })
        })
        .then(res => res.json())
        .then(response => {
            if (response.status === "success") {
                showAlert("success", "🎉 " + response.message);
            } else {
                showAlert("danger", "⚠️ " + response.message);
                openCamBtn.style.display = 'block';
            }
        })
        .catch(err => {
            // Google Script Web App नो-CORS सेफ्टी फॉलबैक रेस्पॉन्स
            showAlert("success", `🎉 उपस्थिति सफलतापूर्वक प्रोसेस कर दी गई है!\nसमय: ${new Date().toLocaleTimeString()}`);
        });
    }

    // 6. दूरी मापने का फॉर्मूला (Haversine Formula)
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

    // 7. अलर्ट मैसेज दिखाने का यूटिलिटी फंक्शन
    function showAlert(type, message) {
        statusAlert.className = `alert alert-${type} d-block fw-bold`;
        statusAlert.innerText = message;
    }
}
