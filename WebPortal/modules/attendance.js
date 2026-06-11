import { sheetUrls, translations, state } from './config.js';
import { showDashboard } from './dashboard.js';

// ==========================================
// 1. DAILY ATTENDANCE MANAGEMENT
// ==========================================
export function showAttendanceForm() {
    const today = new Date().toISOString().split('T')[0];

    // 1. डेटा वैलिडेशन: चेक करें कि क्या डेटा मौजूद है
    if (!state.lastData || state.lastData.length === 0) {
        document.getElementById("contentArea").innerHTML = 
            "<p style='color:red; font-weight:bold;'>⚠️ त्रुटि: पहले डैशबोर्ड लोड होने दें!</p>";
        return;
    }

    // 2. सुरक्षित तरीके से डेटा निकालना (Classes और Mediums)
    const allClasses = [...new Set(state.lastData.map(s => (s.Class || s.class || "").toString().trim()).filter(c => c !== ""))].sort();
    const allMediums = [...new Set(state.lastData.map(s => (s.Medium || s.medium || "").toString().trim()).filter(m => m !== ""))].sort();

    // 3. UI जनरेट करें
    document.getElementById("contentArea").innerHTML = `
        <div>
            <h2 style="color:#1e3a8a; margin-top:0;"><i class="fa-solid fa-calendar-day"></i> दैनिक उपस्थिति पंजी</h2>
            <div style="display:flex; gap:15px; align-items:flex-end; flex-wrap:wrap; margin-bottom:20px; background:#f8fafc; padding:15px; border-radius:8px; border:1px solid #e2e8f0;">
                <div style="flex:1; min-width:150px;">
                    <label style="font-weight:bold; display:block; margin-bottom:6px;">तारीख (Date)</label>
                    <input type="date" id="attDate" value="${today}" style="width:100%; height:40px; padding:5px; border-radius:6px; border:1px solid #ccc; box-sizing:border-box;">
                </div>
                <div style="flex:1; min-width:150px;">
                    <label style="font-weight:bold; display:block; margin-bottom:6px;">कक्षा (Class)</label>
                    <select id="classFilter" style="width:100%; height:40px; border-radius:6px; border:1px solid #ccc;">
                        <option value="">-- कक्षा चुनें --</option>
                        ${allClasses.map(cls => `<option value="${cls}">${cls}</option>`).join('')}
                    </select>
                </div>
                <div style="flex:1; min-width:150px;">
                    <label style="font-weight:bold; display:block; margin-bottom:6px;">माध्यम (Medium)</label>
                    <select id="mediumFilter" style="width:100%; height:40px; border-radius:6px; border:1px solid #ccc;">
                        <option value="">-- माध्यम चुनें --</option>
                        ${allMediums.map(med => `<option value="${med}">${med}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div id="attendanceTableContainer"><p style="text-align:center; color:#64748b;">उपस्थिति शीट ग्रिड जनरेट करने हेतु फिल्टर्स का चयन करें...</p></div>
        </div>`;

    // 4. इवेंट लिसनर्स अटैच करें
    document.getElementById('attDate').addEventListener('change', checkLockAndLoadStudents);
    document.getElementById('classFilter').addEventListener('change', checkLockAndLoadStudents);
    document.getElementById('mediumFilter').addEventListener('change', checkLockAndLoadStudents);
}

async function checkLockAndLoadStudents() {
    const selectedClass = document.getElementById('classFilter').value;
    const selectedDate = document.getElementById('attDate').value;
    const selectedMedium = document.getElementById('mediumFilter').value;
    const container = document.getElementById('attendanceTableContainer');

    // 1. वैलिडेशन
    if (!selectedClass || !selectedMedium) { 
        container.innerHTML = "<p style='text-align:center; color:#64748b;'>कृपया कक्षा और माध्यम चुनें।</p>"; 
        return; 
    }
    if (!selectedDate) { alert("कृपया तारीख चुनें!"); return; }

    // 2. लोडिंग स्टेटस
    container.innerHTML = `<div style="color:#1e3a8a; font-weight:bold; text-align:center; padding:20px;"><i class="fa-solid fa-spinner fa-spin"></i> लॉक स्टेटस जांचा जा रहा है...</div>`;

    try {
        // 3. API कॉल
        const url = `${sheetUrls['Attendance']}?action=checkLock&date=${selectedDate}&class=${encodeURIComponent(selectedClass)}&medium=${encodeURIComponent(selectedMedium)}`;
        const response = await fetch(url);
        
        if (!response.ok) throw new Error("सर्वर रिस्पॉन्स में समस्या");

        const result = await response.json();

        // 4. लॉक स्टेटस चेक
        if (result && result.exists === true) {
            container.innerHTML = `
            <div style="background:#fee2e2; border:2px solid #dc2626; color:#991b1b; padding:20px; border-radius:8px; text-align:center; font-weight:bold;">
                ⚠️ इस कक्षा और माध्यम की अटेंडेंस ${selectedDate} के लिए लॉक की जा चुकी है। संशोधन हेतु 'उपस्थिति सुधार' मेनू का उपयोग करें।
            </div>`;
        } else {
            // लॉक नहीं है, सुरक्षित रूप से ग्रिड लोड करें
            generateAttendanceGrid(selectedClass, selectedMedium);
        }
    } catch (e) {
        console.error("Lock check error:", e);
        // एरर आने पर ग्रिड लोड न करें, यूजर को सूचित करें
        container.innerHTML = `
        <div style="background:#fff3cd; border:1px solid #ffeeba; color:#856404; padding:15px; border-radius:8px; text-align:center;">
            ⚠️ <b>त्रुटि:</b> लॉक स्टेटस चेक नहीं हो सका। कृपया अपना इंटरनेट कनेक्शन चेक करें या बाद में प्रयास करें।
        </div>`;
    }
}
function generateAttendanceGrid(selectedClass, selectedMedium) {
    let container = document.getElementById('attendanceTableContainer');
    let filteredStudents = state.lastData.filter(s => {
        let cls = (s['Class'] || s['class'] || "").toString().trim();
        let med = (s['Medium'] || s['medium'] || "").toString().trim();
        return (cls.toLowerCase() === selectedClass.trim().toLowerCase() && med.toLowerCase() === selectedMedium.trim().toLowerCase());
    });

    if(filteredStudents.length === 0) {
        container.innerHTML = "<p style='color:red; font-weight:bold; text-align:center;'>इस कक्षा में कोई छात्र नहीं मिला।</p>";
        return;
    }

    let html = `
        <table id="attTable">
            <thead>
                <tr style="background:#334155; color:white;">
                    <th>Student ID</th><th>Student Name</th><th>Father Name</th><th>Medium</th><th>Class</th><th>Status (P/A)</th>
                </tr>
            </thead>
            <tbody>
                ${filteredStudents.map((s, i) => {
                    return `
                    <tr>
                        <td><strong>${s['Student ID'] || s['ID'] || s['id']}</strong></td>
                        <td>${s['Student Name'] || s['Name']}</td>
                        <td>${s['Father Name'] || s['FatherName']}</td>
                        <td>${s['Medium'] || s['medium']}</td>
                        <td>${s['Class'] || s['class']}</td>
                        <td>
                            <select class="attStatus" id="sel_status_${i}" style="padding:5px; font-weight:bold; border-radius:4px;">
                                <option value="">-- चुनें --</option>
                                <option value="P">Present (P)</option>
                                <option value="A">Absent (A)</option>
                            </select>
                        </td>
                    </tr>`;
                }).join('')}
            </tbody>
        </table>
        <button id="btnSubmitAttendance" class="btn-action" style="margin-top:20px; background:#1e3a8a; color:white; width:100%; padding:12px; border:none; font-size:16px;"><i class="fa-solid fa-cloud-arrow-up"></i> उपस्थिति सुरक्षित करें (Submit & Lock)</button>
    `;
    container.innerHTML = html;

    filteredStudents.forEach((s, i) => {
        document.getElementById(`sel_status_${i}`).addEventListener('change', function() {
            let row = this.closest('tr');
            if (this.value === 'P') row.className = 'row-present';
            else if (this.value === 'A') row.className = 'row-absent';
            else row.className = '';
        });
    });

    document.getElementById('btnSubmitAttendance').addEventListener('click', saveAttendanceToSheets);
}

function saveAttendanceToSheets() {
    let date = document.getElementById("attDate").value;
    let rows = document.querySelectorAll("#attTable tbody tr");
    let attendanceData = [];
    let validationError = false;

    rows.forEach(row => {
        let statusSelect = row.querySelector('.attStatus');
        if (statusSelect.value === "") {
            validationError = true;
            statusSelect.style.border = "2px solid red";
        } else {
            statusSelect.style.border = "1px solid #ccc";
        }
        attendanceData.push({
            date: date,
            "Student ID": row.cells[0].innerText.trim(),
            "Student Name": row.cells[1].innerText.trim(),
            "Father Name": row.cells[2].innerText.trim(),
            "Medium": row.cells[3].innerText.trim(),
            "Class": row.cells[4].innerText.trim(),
            "Status": statusSelect.value
        });
    });

    if (validationError) { alert("⚠️ सूचि में छूटे हुए छात्रों का Status चुनें!"); return; }

    let btn = document.getElementById('btnSubmitAttendance');
    btn.disabled = true; btn.innerText = "⏳ डेटा सेंड हो रहा है...";

    fetch(sheetUrls['Attendance'], {
        method: 'POST',
        mode: 'no-cors',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attendanceData)
    }).then(() => {
        alert("✔ उपस्थिति सुरक्षित कर दी गई है!");
        showDashboard();
    }).catch(err => {
        alert("नेटवर्क त्रुटि: " + err);
        btn.disabled = false; btn.innerText = "उपस्थिति सुरक्षित करें";
    });
}


// ==========================================
// 2. ATTENDANCE CORRECTION INTERFACE
// ==========================================
export async function showCorrectionPortal() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById("contentArea").innerHTML = "<p style='text-align:center;'>फिल्टर्स लोड हो रहे हैं...</p>";

    try {
        const res = await fetch(sheetUrls['StudentData'] + "?action=getStudents&class=All");
        state.lastData = await res.json();
    } catch (e) {
        document.getElementById("contentArea").innerHTML = "<p style='color:red;'>त्रुटि: डेटा फेचिंग एरर!</p>";
        return;
    }

    let allClasses = [...new Set(state.lastData.map(s => (s.Class || s.class || "").toString().trim()).filter(Boolean))].sort();
    let allMediums = [...new Set(state.lastData.map(s => (s.Medium || s.medium || "").toString().trim()).filter(Boolean))].sort();

    document.getElementById("contentArea").innerHTML = `
    <div>
        <div style="font-size: 20px; font-weight: bold; color: #1e3a8a; margin-bottom: 15px;"><i class="fa-solid fa-user-pen"></i> उपस्थिति सुधार पोर्टल (Auto Load Mode)</div>
        <div style="display: flex; gap: 15px; flex-wrap: wrap; background:#f1f5f9; padding:15px; border-radius:8px; margin-bottom:20px;">
            <div style="flex: 1; min-width:150px;"><label style="font-weight:bold;">📅 दिनांक</label><input type="date" id="searchDate" value="${today}" style="width:100%; height:40px; border-radius:6px; border:1px solid #ccc; padding:5px;"></div>
            <div style="flex: 1; min-width:150px;"><label style="font-weight:bold;">📚 कक्षा</label><select id="searchClass" style="width:100%; height:40px; border-radius:6px; border:1px solid #ccc;"><option value="">-- चुनें --</option>${allClasses.map(c=>`<option value="${c}">${c}</option>`).join('')}</select></div>
            <div style="flex: 1; min-width:150px;"><label style="font-weight:bold;">🧾 माध्यम</label><select id="searchMedium" style="width:100%; height:40px; border-radius:6px; border:1px solid #ccc;"><option value="">-- चुनें --</option>${allMediums.map(m=>`<option value="${m}">${m}</option>`).join('')}</select></div>
        </div>
        <div id="classCorrectionTable"></div>
    </div>`;

    document.getElementById('searchDate').addEventListener('change', loadClassAttendanceForCorrection);
    document.getElementById('searchClass').addEventListener('change', loadClassAttendanceForCorrection);
    document.getElementById('searchMedium').addEventListener('change', loadClassAttendanceForCorrection);
}

async function loadClassAttendanceForCorrection() {
    const date = document.getElementById("searchDate").value;
    const cls = document.getElementById("searchClass").value;
    const medium = document.getElementById("searchMedium").value;
    const container = document.getElementById("classCorrectionTable");

    if (!date || !cls || !medium) { container.innerHTML = ""; return; }
    container.innerHTML = `<p style="text-align:center;"><i class="fa-solid fa-spinner fa-spin"></i> बैकएंड से खोज जारी है...</p>`;

    try {
        const url = `${sheetUrls['Attendance']}?action=getClassAttendance&date=${date}&class=${encodeURIComponent(cls)}&medium=${encodeURIComponent(medium)}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!data || data.length === 0) {
            container.innerHTML = `<p style="color:red; text-align:center; font-weight:bold; background:#fee2e2; padding:15px; border-radius:6px;">❌ इस तारीख पर इस कक्षा का कोई रिकॉर्ड नहीं मिला।</p>`;
            return;
        }

        let html = `<table>
            <tr style="background:#1e3a8a; color:white;">
                <th>ID</th><th>Name</th><th>Status</th><th>Action</th>
            </tr>`;
        
        data.forEach((s, i) => {
            let status = (s.Status || "").toString().trim();
            html += `<tr>
                <td><strong>${s["Student ID"]}</strong></td>
                <td>${s["Student Name"]}</td>
                <td>
                    <select id="st_${i}" style="padding:5px; font-weight:bold;">
                        <option value="P" ${status==="P"?"selected":""}>Present (P)</option>
                        <option value="A" ${status==="A"?"selected":""}>Absent (A)</option>
                    </select>
                </td>
                <td><button class="update-single-btn" data-id="${s["Student ID"]}" data-idx="${i}" style="background:#1e3a8a; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer;"><i class="fa-solid fa-floppy-disk"></i> Update</button></td>
            </tr>`;
        });
        container.innerHTML = html + `</table>`;

        document.querySelectorAll('.update-single-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                updateCorrectionAttendance(this.getAttribute('data-id'), this.getAttribute('data-idx'), this);
            });
        });
    } catch (e) { container.innerHTML = "<p style='color:red;'>त्रुटि: लोड करने में विफलता।</p>"; }
}

async function updateCorrectionAttendance(studentId, i, btn) {
    let select = document.getElementById(`st_${i}`);
    let selectedDate = document.getElementById("searchDate").value; 
    btn.disabled = true; btn.innerHTML = "⏳...";

    try {
        const res = await fetch(sheetUrls['Attendance'], {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({ action: "updateSingleAttendance", studentId: studentId, date: selectedDate, newStatus: select.value })
        });
        const data = await res.json();
        if (data.status === "success") { 
            alert(`✔ ${selectedDate} की उपस्थिति सफलतापूर्वक सुधारी गई।`); 
        } else {
            alert("सुधार विफल हुआ!");
        }
    } catch (err) { alert("सर्वर त्रुटि: " + err.message); }
    finally { btn.disabled = false; btn.innerHTML = "<i class='fa-solid fa-floppy-disk'></i> Update"; }
}


// ==========================================
// 3. DAILY ABSENT REPORT PRINT LOGIC
// ==========================================
export async function showAbsentReport() {
    const today = new Date().toISOString().split('T')[0];
    try {
        const response = await fetch(sheetUrls['StudentData'] + "?action=getStudents&class=All");
        const data = await response.json();
        const classes = [...new Set(data.map(s => s.Class || s.class).filter(Boolean))].sort();
        const mediums = [...new Set(data.map(s => s.Medium || s.medium).filter(Boolean))].sort();

        document.getElementById('contentArea').innerHTML = `
            <div>
                <h3 style="color:#dc2626; margin-top:0;"><i class="fa-solid fa-user-clock"></i> अनुपस्थित छात्रों की दैनिक रिपोर्ट सूची</h3>
                <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:20px; background:#f8fafc; padding:15px; border-radius:6px; border:1px solid #e2e8f0;">
                    <input type="date" id="absDate" value="${today}" style="padding:8px; border-radius:4px; border:1px solid #ccc;">
                    <select id="absClass" style="padding:8px; border-radius:4px; border:1px solid #ccc;"><option value="">-- कक्षा चुनें --</option>${classes.map(c=>`<option value="${c}">${c}</option>`).join('')}</select>
                    <select id="absMedium" style="padding:8px; border-radius:4px; border:1px solid #ccc;"><option value="">-- माध्यम चुनें --</option>${mediums.map(m=>`<option value="${m}">${m}</option>`).join('')}</select>
                    <button id="btnSearchAbsent" style="background:#1e3a8a; color:white; padding:8px 15px; border:none; border-radius:4px; cursor:pointer;"><i class="fa-solid fa-magnifying-glass"></i> खोजें</button>
                    <button id="btnPrintAbsent" style="background:#16a34a; color:white; padding:8px 15px; border:none; border-radius:4px; cursor:pointer;"><i class="fa-solid fa-print"></i> रिपोर्ट प्रिंट करें</button>
                </div>
                <div id="absentListContainer"></div>
            </div>`;

        document.getElementById('btnSearchAbsent').addEventListener('click', loadAbsentStudentsList);
        document.getElementById('btnPrintAbsent').addEventListener('click', printAbsentListWindow);
    } catch (err) { document.getElementById('contentArea').innerHTML = "डेटा लोड एरर!"; }
}

async function loadAbsentStudentsList() {
    const date = document.getElementById("absDate").value;
    const className = document.getElementById("absClass").value;
    const medium = document.getElementById("absMedium").value;
    const container = document.getElementById("absentListContainer");

    if (!date || !className || !medium) { alert("सभी फ़िल्टर चुनें!"); return; }
    container.innerHTML = "<p style='font-weight:bold; color:#1e3a8a;'><i class='fa-solid fa-spinner fa-spin'></i> खोज जारी है...</p>";

    try {
        const url = `${sheetUrls['Attendance']}?action=getAbsentStudents&date=${date}&class=${encodeURIComponent(className)}&medium=${encodeURIComponent(medium)}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.length === 0) {
            container.innerHTML = "<p style='color:#16a34a; font-weight:bold; background:#d1fae5; padding:15px; border-radius:6px; text-align:center;'>🎉 सभी छात्र उपस्थित थे।</p>";
            return;
        }

        container.innerHTML = `
            <table id="printAbsentTarget">
                <tr style="background:#fee2e2; color:#991b1b;"><th>Student ID</th><th>छात्र का नाम</th><th>पिता का नाम</th></tr>
                ${data.map(s => `<tr><td><strong>${s["Student ID"]}</strong></td><td>${s["Student Name"]}</td><td>${s["Father Name"]}</td></tr>`).join('')}
            </table>`;
    } catch (err) { container.innerHTML = "त्रुटि: " + err.message; }
}

function printAbsentListWindow() {
    const content = document.getElementById("absentListContainer").innerHTML;
    if(!content || content.includes("जारी है") || content.includes("सभी छात्र उपस्थित थे")) { alert("पहले खोजें बटन दबाएं!"); return; }
    const dateVal = document.getElementById("absDate").value;
    const classVal = document.getElementById("absClass").value;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Absent Report</title>
            <style>body { font-family:sans-serif; padding:20px; } table { width:100%; border-collapse:collapse; margin-top:20px; } th,td { border:1px solid #000; padding:10px; } th { background:#f2f2f2; }</style>
        </head>
        <body>
            <h2>सरस्वती बाल विद्या मंदिर हाई स्कूल, रुनाहा</h2>
            <h4>अनुपस्थित छात्र दैनिक रिपोर्ट सूची</h4>
            <p><strong>दिनांक:</strong> ${dateVal} | <strong>कक्षा:</strong> ${classVal}</p>
            ${content}
        </body>
        </html>`);
    printWindow.document.close();
    printWindow.print();
}


// ==========================================
// 4. ATTENDANCE ANALYTICS DASHBOARD
// ==========================================
export async function showAttendanceDashboard() {
    document.getElementById('contentArea').innerHTML = "<p style='text-align:center;'><i class='fa-solid fa-spinner fa-spin'></i> लोड हो रहा है...</p>";
    
    try {
        const response = await fetch(sheetUrls['Attendance'] + "?action=getAttendanceSummary");
        const data = await response.json();

        if (!data || data.length === 0) { 
            document.getElementById('contentArea').innerHTML = "<p>डेटा उपलब्ध नहीं है।</p>"; 
            return; 
        }
        
        // table-layout: fixed और display: table का उपयोग करना सबसे सुरक्षित है
        let html = `
<h3 style="color:#1e3a8a;">
    <i class="fa-solid fa-chart-pie"></i> आज की उपस्थिति समरी
</h3>

<div style="width:100%; display:flex; justify-content:center;">
<table style="width:80%; max-width:700px; border-collapse:collapse; border:1px solid #ccc;">
    <thead>
        <tr style="background:#334155; color:white;">
            <th style="padding:12px; border:1px solid #94a3b8;">कक्षा</th>
            <th style="padding:12px; border:1px solid #94a3b8;">माध्यम</th>
            <th style="padding:12px; border:1px solid #94a3b8;">उपस्थित (P)</th>
            <th style="padding:12px; border:1px solid #94a3b8;">अनुपस्थित (A)</th>
        </tr>
    </thead>
    <tbody>
`;

data.forEach(row => {
    html += `
    <tr style="background:#ffffff;">
        <td style="padding:10px; border:1px solid #e2e8f0; text-align:center;">
            <strong>${row.Class || "-"}</strong>
        </td>

        <td style="padding:10px; border:1px solid #e2e8f0; text-align:center;">
            ${row.Medium || "-"}
        </td>

        <td style="padding:10px; border:1px solid #e2e8f0; text-align:center; color:green; font-weight:bold;">
            ${row.P}
        </td>

        <td style="padding:10px; border:1px solid #e2e8f0; text-align:center; color:red; font-weight:bold;">
            ${row.A}
        </td>
    </tr>`;
});

html += `
    </tbody>
</table>
</div>
`;

document.getElementById('contentArea').innerHTML = html;
        
// ==========================================
// 5. MASTER DATA SYNC (ADD STUDENT ROW)
// ==========================================
export function showAddStudentForm() {
    document.getElementById('contentArea').innerHTML = "<p style='text-align:center;'><i class='fa-solid fa-spinner fa-spin'></i> सिंक आर्काइव लोड हो रहा है...</p>";
    fetch(sheetUrls['Database'] + "?action=getDashboard")
        .then(res => res.json())
        .then(data => {
            state.lastData = data;
            document.getElementById('contentArea').innerHTML = `
                <div style="background:#fff; border:1px solid #ddd; margin-bottom:20px; padding:15px; border-radius:6px;">
                    <h3 style="color:#1e3a8a; margin-top:0;"><i class="fa-solid fa-network-wired"></i> केंद्रीय डेटाबेस से छात्र रिकॉर्ड खोजें (Sync)</h3>
                    <div style="display:flex; gap:10px;">
                        <input type="text" id="searchInput" placeholder="Student ID दर्ज करें (e.g. SBVM-101)" style="flex:1; padding:10px; border-radius:4px; border:1px solid #ccc;">
                        <button id="btnSearchSync" style="background:#1e3a8a; color:white; padding:10px 20px; border:none; border-radius:4px; cursor:pointer; font-weight:bold;"><i class="fa-solid fa-magnifying-glass"></i> खोजें</button>
                    </div>
                </div>
                
                <div style="background:#fff; border:1px solid #ddd; padding:20px; border-radius:6px;">
                    <h3 style="color:#334155; margin-top:0;">📋 छात्र का विवरण (सिंक हेतु)</h3>
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:15px; margin-bottom:20px;">
                        <div><label style="font-weight:bold;display:block;margin-bottom:5px;">Student ID *</label><input type="text" id="sid" readonly style="background:#e2e8f0; width:100%; padding:10px; border-radius:4px; font-weight:bold;"></div>
                        <div><label style="font-weight:bold;display:block;margin-bottom:5px;">छात्र का नाम</label><input type="text" id="sname" readonly style="background:#e2e8f0; width:100%; padding:10px; border-radius:4px;"></div>
                        <div><label style="font-weight:bold;display:block;margin-bottom:5px;">पिता का नाम</label><input type="text" id="fname" readonly style="background:#e2e8f0; width:100%; padding:10px; border-radius:4px;"></div>
                        <div><label style="font-weight:bold;display:block;margin-bottom:5px;">माध्यम</label><input type="text" id="med" readonly style="background:#e2e8f0; width:100%; padding:10px; border-radius:4px;"></div>
                        <div><label style="font-weight:bold;display:block;margin-bottom:5px;">कक्षा</label><input type="text" id="cls" readonly style="background:#e2e8f0; width:100%; padding:10px; border-radius:4px;"></div>
                    </div>
                    <button id="btnTransferData" style="background:#16a34a; color:white; padding:12px 25px; border:none; border-radius:6px; width:100%; font-size:16px; font-weight:bold;"><i class="fa-solid fa-rotate"></i> डेटा StudentData टैब में ट्रांसफर करें</button>
                </div>`;

            document.getElementById('btnSearchSync').addEventListener('click', searchCentralDatabaseId);
            document.getElementById('btnTransferData').addEventListener('click', transferStudentRowSync);
        });
}

async function searchCentralDatabaseId() {
    let searchId = document.getElementById('searchInput').value.trim();
    if (!searchId) { alert("कृपया ID दर्ज करें!"); return; }
    try {
        const response = await fetch(sheetUrls['Database'] + "?action=searchById&studentId=" + encodeURIComponent(searchId));
        const student = await response.json();
        if (student.status === "found") {
            document.getElementById('sid').value = student.studentId;
            document.getElementById('sname').value = student.name;
            document.getElementById('fname').value = student.father;
            document.getElementById('med').value = student.medium;
            document.getElementById('cls').value = student.class;
        } else { alert("❌ केंद्रीय डेटाबेस में यह ID नहीं मिली!"); }
    } catch (err) { alert("सर्वर त्रुटि हुई।"); }
}

function transferStudentRowSync() {
    const studentId = document.getElementById('sid').value;
    if (!studentId) { alert("पहले छात्र खोजें!"); return; }
    
    let btn = document.getElementById('btnTransferData');
    btn.disabled = true; btn.innerText = "⏳ सिंक हो रहा है...";

    fetch(sheetUrls['StudentData'], {
        method: 'POST',
        mode: 'no-cors',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            action: "saveToStudentData", 
            studentId: studentId,
            name: document.getElementById('sname').value, 
            father: document.getElementById('fname').value,
            medium: document.getElementById('med').value, 
            class: document.getElementById('cls').value
        })
    }).then(() => { 
        alert("✔ छात्र सफलतापूर्वक सिंक हो गया!"); 
        showDashboard(); 
    }).catch(err => {
        btn.disabled = false; btn.innerText = "डेटा StudentData टैब में ट्रांसफर करें";
    });
}


// ==========================================
// 6. ARCHIVE ROW ERASER (DELETE STUDENT)
// ==========================================
export async function showDeleteStudentPortal(){
    document.getElementById('contentArea').innerHTML = "<p style='text-align:center;'><i class='fa-solid fa-spinner fa-spin'></i> सक्रिय सूची लोड हो रही है...</p>";
    try {
        const response = await fetch(sheetUrls['StudentData'] + "?action=getStudents&class=All");
        state.studentDataList = await response.json();
        let classes = [...new Set(state.studentDataList.map(s => s.Class || s.class))].filter(Boolean).sort();
        
        document.getElementById('contentArea').innerHTML = `
            <div>
                <h3 style="color:#b91c1c; margin-top:0;"><i class="fa-solid fa-user-minus"></i> StudentData शीट से छात्र हटाएं (Row Delete)</h3>
                <label style="font-weight:bold; margin-right:10px;">कक्षा चुनें:</label>
                <select id="deleteClassFilter" style="padding:8px; border-radius:4px; border:1px solid #ccc; width:200px;"><option value="">-- कक्षा चुनें --</option>${classes.map(c=>`<option value="${c}">${c}</option>`).join('')}</select>
                <div id="deleteStudentContainer" style="margin-top:20px;"></div>
            </div>`;
        
        document.getElementById('deleteClassFilter').addEventListener('change', renderDeleteGridList);
    } catch(err) { document.getElementById('contentArea').innerHTML = "सक्रिय सूची प्राप्त करने में त्रुटि।"; }
}

function renderDeleteGridList() {
    let cls = document.getElementById("deleteClassFilter").value;
    let container = document.getElementById("deleteStudentContainer");
    if(!cls) { container.innerHTML = ""; return; }
    
    let students = state.studentDataList.filter(s => (s.Class || s.class) == cls);
    if(students.length === 0){ container.innerHTML = "<p style='color:orange;'>इस कक्षा में कोई छात्र नहीं मिला।</p>"; return; }

    let html = `<table><tr style="background:#cbd5e1;"><th>Student ID</th><th>छात्र का नाम</th><th>एक्शन</th></tr>`;
    students.forEach((stu, i) => {
        html += `<tr>
            <td><strong>${stu["Student ID"]}</strong></td>
            <td>${stu["Student Name"]}</td>
            <td><button class="del-action-btn" data-id="${stu["Student ID"]}" style="background:#dc2626; color:white; border:none; padding:6px 12px; border-radius:4px; font-weight:bold;"><i class="fa-solid fa-trash-can"></i> Delete</button></td>
        </tr>`;
    });
    container.innerHTML = html + "</table>";

    document.querySelectorAll('.del-action-btn').forEach(btn => {
        btn.addEventListener('click', function() { executeDeleteRowOperation(this.getAttribute('data-id'), this); });
    });
}

async function executeDeleteRowOperation(studentId, btnElement) {
    if (!confirm(`क्या आप वाकई Student ID: ${studentId} को StudentData शीट से हटाना चाहते हैं?`)) return;
    btnElement.disabled = true; btnElement.innerHTML = "⏳...";
    try {
        await fetch(sheetUrls['StudentData'], {
            method: "POST", 
            mode: "no-cors", 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "deleteStudent", studentId: studentId })
        });
        alert("✔ छात्र डिलीट कर दिया गया है।");
        btnElement.closest('tr').remove();
    } catch (err) { 
        alert("त्रुटि आई है।"); 
        btnElement.disabled = false; btnElement.innerHTML = "Delete";
    }
}
