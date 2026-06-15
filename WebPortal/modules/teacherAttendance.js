import { sheetUrls, translations } from './config.js';

export function loadTeacherAttendance() {

    const contentArea = document.getElementById("contentArea");

    const urlParams = new URLSearchParams(window.location.search);
    const prefilledId = urlParams.get('teacherId') || "";

    contentArea.innerHTML = `
        <div class="module-card">
            <h2>${translations['शिक्षक उपस्थिति'] || 'शिक्षक उपस्थिति'}</h2>

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

                <select id="type" class="form-control">
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

            <div id="statusMsg"></div>

            <div id="qrSection" style="margin-top:20px;">
                <p>अपना QR कोड स्कैन करें या ID भरें</p>
            </div>

        </div>
    `;

    window.submitAttendance = async function () {

        const teacherId =
            document.getElementById('teacherId').value.trim();

        const pin =
            document.getElementById('pin').value.trim();

        const type =
            document.getElementById('type').value;

        if (!teacherId) {

            document.getElementById('statusMsg').innerText =
                "Teacher ID भरें";

            return;
        }

        if (!pin) {

            document.getElementById('statusMsg').innerText =
                "PIN भरें";

            return;
        }

        const data = {
            id: teacherId,
            pin: pin,
            type: type
        };

        document.getElementById('statusMsg').innerText =
            "Processing...";

        try {

            const response = await fetch(
                sheetUrls.TeacherAttendance,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                }
            );

            const result = await response.json();

            document.getElementById('statusMsg').innerText =
                result.message;

        } catch (error) {

            console.error(error);

            document.getElementById('statusMsg').innerText =
                "Network Error : " + error.message;
        }
    };
}
