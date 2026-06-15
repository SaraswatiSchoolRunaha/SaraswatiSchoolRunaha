import { sheetUrls, translations } from './config.js';

export function loadTeacherAttendance() {

    const contentArea = document.getElementById("contentArea");

    const urlParams = new URLSearchParams(window.location.search);
    const prefilledId = urlParams.get('teacherId') || "";

    // GLOBAL SESSION VARIABLES
    let currentSessionId = "";
    let currentLat = null;
    let currentLng = null;

    contentArea.innerHTML = `
        <div class="module-card">

            <h2>
                ${translations['शिक्षक उपस्थिति'] || 'शिक्षक उपस्थिति'}
            </h2>

            <div class="form-group">

                <input
                    type="text"
                    id="teacherId"
                    value="${prefilledId}"
                    placeholder="Teacher ID"
                    class="form-control"
                >

                <input
                    type="password"
                    id="pin"
                    placeholder="4-Digit PIN"
                    class="form-control"
                >

                <select
                    id="type"
                    class="form-control"
                >
                    <option value="IN">Check-In (आना)</option>
                    <option value="OUT">Check-Out (जाना)</option>
                </select>

                <button
                    onclick="submitAttendance()"
                    class="btn-submit"
                >
                    सबमिट करें
                </button>

            </div>

            <div id="statusMsg" style="margin-top:15px;font-weight:bold;"></div>

            <div id="qrSection" style="margin-top:20px;">
                <p>QR Code यहाँ दिखेगा</p>
            </div>

        </div>
    `;

    // Make function global
    window.submitAttendance = async function () {

        const teacherId = document.getElementById('teacherId').value.trim();
        const pin = document.getElementById('pin').value.trim();
        const type = document.getElementById('type').value;

        if (!teacherId) {
            document.getElementById('statusMsg').innerText = "Teacher ID भरें";
            return;
        }

        if (!pin) {
            document.getElementById('statusMsg').innerText = "PIN भरें";
            return;
        }

        document.getElementById('statusMsg').innerText = "Processing...";

        try {

            // STEP 1: SESSION ID CREATE
            currentSessionId = teacherId + "-" + Date.now();

            // STEP 2: GPS GET
            navigator.geolocation.getCurrentPosition(async (pos) => {

                currentLat = pos.coords.latitude;
                currentLng = pos.coords.longitude;

                // STEP 3: QR GENERATE
                generateQR(currentSessionId);

                // STEP 4: API CALL
                const apiUrl =
                    `${sheetUrls.TeacherAttendance}
                    ?id=${encodeURIComponent(teacherId)}
                    &pin=${encodeURIComponent(pin)}
                    &type=${encodeURIComponent(type)}
                    &sessionId=${encodeURIComponent(currentSessionId)}
                    &lat=${encodeURIComponent(currentLat)}
                    &lng=${encodeURIComponent(currentLng)}`;

                const response = await fetch(apiUrl);
                const result = await response.json();

                document.getElementById('statusMsg').innerText = result.message;

            }, (error) => {
                document.getElementById('statusMsg').innerText =
                    "GPS Error: Location permission allow karein";
            });

        } catch (error) {
            console.error(error);
            document.getElementById('statusMsg').innerText =
                "Network Error : " + error.message;
        }
    };

    // QR FUNCTION
    function generateQR(sessionId) {

        const qrSection = document.getElementById("qrSection");
        qrSection.innerHTML = "";

        if (!window.QRCode) {
            qrSection.innerText = "QR Library missing";
            return;
        }

        const canvas = document.createElement("canvas");

        QRCode.toCanvas(canvas, sessionId, function (err) {
            if (err) {
                qrSection.innerText = "QR Error";
                return;
            }
            qrSection.appendChild(canvas);
        });
    }
}
