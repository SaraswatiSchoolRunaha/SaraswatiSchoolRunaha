import { sheetUrls, translations } from './config.js'; // कॉन्फ़िगरेशन इंपोर्ट किया
import { loadTeacherAttendance } from './teacherAttendance.js';

export function loadTeacherAttendance() {
    const contentArea = document.getElementById("contentArea");

    // UI रेंडर करें
    contentArea.innerHTML = `
        <div class="module-card">
            <h2>${translations['शिक्षक उपस्थिति मॉड्यूल']}</h2>
            <div class="form-group">
                <input type="text" id="teacherId" placeholder="Teacher ID" class="form-control">
                <input type="password" id="pin" placeholder="4-Digit PIN" class="form-control">
                <select id="type" class="form-control">
                    <option value="IN">Check-In (आना)</option>
                    <option value="OUT">Check-Out (जाना)</option>
                </select>
                <button onclick="submitAttendance()" class="btn-submit">सबमिट करें</button>
            </div>
            <div id="statusMsg"></div>
        </div>
    `;

    // सबमिट फंक्शन
    window.submitAttendance = function() {
        const data = {
            id: document.getElementById('teacherId').value,
            pin: document.getElementById('pin').value,
            type: document.getElementById('type').value
        };
        
        document.getElementById('statusMsg').innerText = "Processing...";
        
        // सर्वर कॉल
        google.script.run
            .withSuccessHandler(res => {
                document.getElementById('statusMsg').innerText = res;
            })
            .processAttendance(data); // यह फंक्शन आपके Code.gs में होना चाहिए
    };
}
