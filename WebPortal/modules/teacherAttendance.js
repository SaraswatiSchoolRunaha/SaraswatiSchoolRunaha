import { sheetUrls, translations } from './config.js';

export function loadTeacherAttendance() {
    const contentArea = document.getElementById("contentArea");

    // URL से ID निकालने का लॉजिक (जैसे: .../index.html?teacherId=101)
    const urlParams = new URLSearchParams(window.location.search);
    const prefilledId = urlParams.get('teacherId') || "";

    contentArea.innerHTML = `
        <div class="module-card">
            <h2>${translations['शिक्षक उपस्थिति'] || 'शिक्षक उपस्थिति'}</h2>
            <div class="form-group">
                <input type="text" id="teacherId" value="${prefilledId}" placeholder="Teacher ID" class="form-control">
                <input type="password" id="pin" placeholder="4-Digit PIN" class="form-control">
                <select id="type" class="form-control">
                    <option value="IN">Check-In (आना)</option>
                    <option value="OUT">Check-Out (जाना)</option>
                </select>
                <button onclick="submitAttendance()" class="btn-submit">सबमिट करें</button>
            </div>
            <div id="statusMsg"></div>
            
            <div id="qrSection" style="margin-top:20px;">
               <p>अपना QR कोड स्कैन करें या ID भरें</p>
            </div>
        </div>
    `;

    window.submitAttendance = function() {
        const data = {
            id: document.getElementById('teacherId').value,
            pin: document.getElementById('pin').value,
            type: document.getElementById('type').value
        };
        
        document.getElementById('statusMsg').innerText = "Processing...";
        
        google.script.run
            .withSuccessHandler(res => {
                document.getElementById('statusMsg').innerText = res;
            })
            .processAttendance(data); 
    };
}
