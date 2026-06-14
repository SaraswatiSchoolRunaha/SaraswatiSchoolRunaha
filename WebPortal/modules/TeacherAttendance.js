






/** * TeacherAttendance.js - शिक्षक उपस्थिति मॉड्यूल
 */

export function loadTeacherAttendance() {
    const contentArea = document.getElementById("contentArea");

    contentArea.innerHTML = `
        <div class="attendance-module">
            <h2>शिक्षक उपस्थिति पोर्टल</h2>
            <p>अपना QR कोड स्कैन करें या नीचे विवरण भरें:</p>
            
            <div class="form-container" style="max-width: 400px; margin: auto;">
                <input type="text" id="teacherId" placeholder="Teacher ID" class="form-control">
                <input type="password" id="pin" placeholder="4-Digit PIN" class="form-control">
                
                <select id="type" class="form-control">
                    <option value="IN">Check-In (आना)</option>
                    <option value="OUT">Check-Out (जाना)</option>
                </select>
                
                <button onclick="submitAttendance()" class="btn-primary">उपस्थिति सबमिट करें</button>
                <div id="statusMsg" style="margin-top: 15px; font-weight: bold;"></div>
            </div>
            
            <div id="qrCodeArea" style="margin-top: 30px;">
                <h3>शिक्षक QR स्कैन करें</h3>
                <div id="qrCodeDisplay"></div> </div>
        </div>
    `;

    // सबमिट फंक्शन को ग्लोबली एक्सेस करने के लिए window पर सेट करें
    window.submitAttendance = function() {
        const data = {
            id: document.getElementById('teacherId').value,
            pin: document.getElementById('pin').value,
            type: document.getElementById('type').value
        };
        
        document.getElementById('statusMsg').innerText = "Processing...";
        
        // Google Apps Script के 'processAttendance' फंक्शन को कॉल करें
        google.script.run.withSuccessHandler(function(response) {
            document.getElementById('statusMsg').innerText = response;
        }).processAttendance(data);
    };
}





