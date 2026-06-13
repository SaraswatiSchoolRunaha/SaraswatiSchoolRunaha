import { sheetUrls, translations, state } from './config.js';
import { showDashboard } from './dashboard.js';

// ==========================================
// 1. DAILY ATTENDANCE MANAGEMENT (Full Code)
// ==========================================

export function showAttendanceForm() {
    const today = new Date().toISOString().split('T')[0];

    // कक्षा और माध्यम की लिस्ट (hardcoded या जैसा आप चाहते हैं)
    const allClasses = ["KG1", "KG2", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];
    const allMediums = ["Hindi", "English"];
    
    document.getElementById("contentArea").innerHTML = `
        <div>
            <h2 style="color:#1e3a8a;"><i class="fa-solid fa-calendar-day"></i> दैनिक उपस्थिति पंजी</h2>
            <div style="display:flex; gap:15px; align-items:flex-end; flex-wrap:wrap; margin-bottom:20px; background:#f8fafc; padding:15px;">
                
                <div style="flex:1;">
                    <label>तारीख (Date)</label>
                    <input type="date" id="attDate" value="${today}" style="width:100%; height:40px;">
                </div>

                <div style="flex:1;">
                    <label>कक्षा (Class)</label>
                    <select id="classFilter" style="width:100%; height:40px;">
                        <option value="">-- कक्षा चुनें --</option>
                        ${allClasses.map(cls => `<option value="${cls}">${cls}</option>`).join('')}
                    </select>
                </div>

                <div style="flex:1;">
                    <label>माध्यम (Medium)</label>
                    <select id="mediumFilter" style="width:100%; height:40px;">
                        <option value="">-- माध्यम चुनें --</option>
                        ${allMediums.map(med => `<option value="${med}">${med}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div id="attendanceTableContainer"><p style="text-align:center; color:#64748b;">उपस्थिति देखने के लिए कक्षा और माध्यम चुनें।</p></div>
        </div>`;

    // यहाँ से वो "Fix" हटा दिया गया है जो ड्रॉपडाउन को जबरदस्ती रिसेट करता था।
    // अब यूजर खुद जो सिलेक्ट करेगा वही रहेगा।

    document.getElementById('attDate').addEventListener('change', checkLockAndLoadStudents);
    document.getElementById('classFilter').addEventListener('change', checkLockAndLoadStudents);
    document.getElementById('mediumFilter').addEventListener('change', checkLockAndLoadStudents);
}
async function checkLockAndLoadStudents() {
    const selectedClass = document.getElementById('classFilter').value;
    const selectedDate = document.getElementById('attDate').value;
    const selectedMedium = document.getElementById('mediumFilter').value;
    const container = document.getElementById('attendanceTableContainer');

    if (!selectedClass || !selectedMedium) { 
        container.innerHTML = "<p style='text-align:center; color:#64748b;'>कृपया कक्षा और माध्यम चुनें।</p>"; 
        return; 
    }
    if (!selectedDate) { alert("कृपया तारीख चुनें!"); return; }

    container.innerHTML = `<div style="color:#1e3a8a; font-weight:bold; text-align:center; padding:20px;"><i class="fa-solid fa-spinner fa-spin"></i> लॉक स्टेटस जांचा जा रहा है...</div>`;

    try {
        const url = `${sheetUrls['Attendance']}?action=checkLock&date=${selectedDate}&class=${encodeURIComponent(selectedClass)}&medium=${encodeURIComponent(selectedMedium)}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("सर्वर रिस्पॉन्स में समस्या");
        const result = await response.json();

        if (result && result.exists === true) {
            container.innerHTML = `<div style="background:#fee2e2; border:2px solid #dc2626; color:#991b1b; padding:20px; border-radius:8px; text-align:center; font-weight:bold;">⚠️ इस कक्षा और माध्यम की अटेंडेंस ${selectedDate} के लिए लॉक की जा चुकी है। संशोधन हेतु 'उपस्थिति सुधार' मेनू का उपयोग करें।</div>`;
        } else {
            generateAttendanceGrid(selectedClass, selectedMedium);
        }
    } catch (e) {
        console.error("Lock check error:", e);
        container.innerHTML = `<div style="background:#fff3cd; border:1px solid #ffeeba; color:#856404; padding:15px; border-radius:8px; text-align:center;">⚠️ <b>त्रुटि:</b> लॉक स्टेटस चेक नहीं हो सका।</div>`;
    }
}

function generateAttendanceGrid(selectedClass, selectedMedium) {
    let container = document.getElementById('attendanceTableContainer');
    
    // 1. डेटा का डीबग करें (देखें कि अंदर क्या आ रहा है)
    console.log("Input Parameters:", { selectedClass, selectedMedium });
    console.log("Sample Data Row:", state.lastData[0]);

    // 2. डेटा को फिल्टर करें (अधिक सुरक्षित तरीका)
    let filteredStudents = state.lastData.filter(s => {
        // यहाँ हम सभी संभावित नामों को चेक कर रहे हैं
        let cls = (s['Class'] || s['class'] || s['CLASS'] || "").toString().trim();
        let med = (s['Medium'] || s['medium'] || s['MED'] || "").toString().trim();
        
        return (cls.toLowerCase() === selectedClass.trim().toLowerCase() && 
                med.toLowerCase() === selectedMedium.trim().toLowerCase());
    });

    // अगर डेटा नहीं मिला, तो विस्तार से बताएं कि क्या हुआ
    if(filteredStudents.length === 0) {
        container.innerHTML = `
            <div style='color:red; font-weight:bold; text-align:center; padding:20px; border:1px solid red;'>
                इस कक्षा (${selectedClass}) और माध्यम (${selectedMedium}) में कोई छात्र नहीं मिला।<br>
                <small>टिप: अपने कंसोल (F12) में Sample Data Row चेक करें कि 'Class' और 'Medium' के लिए क्या की (key) इस्तेमाल हुई है।</small>
            </div>`;
        return;
    }

    // 3. टेबल रेंडर करें
    let html = `
        <div style="overflow-x: auto;">
        <table id="attTable" style="width:100%; border-collapse:collapse; background:white; border:1px solid #e2e8f0;">
            <thead>
                <tr style="background:#334155; color:white; text-align:left;">
                    <th style="padding:12px;">ID</th>
                    <th style="padding:12px;">नाम</th>
                    <th style="padding:12px;">माध्यम</th>
                    <th style="padding:12px;">Status</th>
                </tr>
            </thead>
            <tbody>
                ${filteredStudents.map((s, i) => {
                    // डेटा से वैल्यू निकालना
                    const id = s['Student ID'] || s['ID'] || s['id'] || '-';
                    const name = s['Student Name'] || s['Name'] || '-';
                    const med = s['Medium'] || s['medium'] || s['MED'] || 'N/A';
                    
                    return `
                    <tr style="border-bottom:1px solid #e2e8f0;" id="row_${i}">
                        <td style="padding:10px;">${id}</td>
                        <td style="padding:10px;">${name}</td>
                        <td style="padding:10px;">${med}</td>
                        <td style="padding:10px;">
                            <select class="attStatus" id="sel_status_${i}" data-index="${i}" style="padding:5px; border-radius:4px; width:100%;">
                                <option value="">--</option>
                                <option value="P">Present</option>
                                <option value="A">Absent</option>
                            </select>
                        </td>
                    </tr>`;
                }).join('')}
            </tbody>
        </table>
        </div>
        <button id="btnSubmitAttendance" class="btn-action" style="margin-top:20px; background:#1e3a8a; color:white; width:100%; padding:15px; border:none; font-size:16px; border-radius:8px; cursor:pointer;">
            <i class="fa-solid fa-cloud-arrow-up"></i> उपस्थिति सुरक्षित करें
        </button>
    `;
    
    container.innerHTML = html;

    // 4. इवेंट लिसनर (रंग बदलने के लिए)
    document.querySelectorAll('.attStatus').forEach(select => {
        select.addEventListener('change', function() {
            let row = this.closest('tr');
            row.style.backgroundColor = (this.value === 'P') ? '#dcfce7' : (this.value === 'A') ? '#fee2e2' : 'transparent';
        });
    });

    document.getElementById('btnSubmitAttendance').addEventListener('click', () => {
        saveAttendanceToSheets(filteredStudents);
    });
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
// 1. इंटरफेस दिखाने वाला फंक्शन
export function showCorrectionPortal() {
    const today = new Date().toISOString().split('T')[0];
    
    document.getElementById("contentArea").innerHTML = `
        <h2 style="color:#1e3a8a;"><i class="fa-solid fa-pen-to-square"></i> उपस्थिति सुधार पोर्टल</h2>
        <div style="display:flex; gap:10px; margin-bottom:20px; padding:15px; background:#f1f5f9; border-radius:8px; flex-wrap:wrap;">
            <input type="date" id="searchDate" value="${today}">
            <input type="text" id="searchClass" placeholder="कक्षा (उदा: 10)">
            <input type="text" id="searchMedium" placeholder="माध्यम (उदा: Hindi)">
            <button id="btnFetchData" style="background:#1e3a8a; color:white; border:none; padding:8px 15px; cursor:pointer; border-radius:4px;">
                <i class="fa-solid fa-magnifying-glass"></i> खोजें
            </button>
        </div>
        <div id="classCorrectionTable"></div>
    `;

    document.getElementById('btnFetchData').addEventListener('click', fetchAttendanceData);
}

// 2. डेटा लोड और टेबल बनाने वाला फंक्शन
async function fetchAttendanceData() {
    const date = document.getElementById("searchDate").value;
    const cls = document.getElementById("searchClass").value;
    const medium = document.getElementById("searchMedium").value;
    const container = document.getElementById("classCorrectionTable");

    if (!date || !cls || !medium) {
        alert("कृपया तारीख, कक्षा और माध्यम भरें!");
        return;
    }

    container.innerHTML = `<p style="text-align:center; padding:20px;"><i class="fa-solid fa-spinner fa-spin"></i> डेटा लोड हो रहा है...</p>`;

    try {
        const url = `${sheetUrls['Attendance']}?action=getClassAttendance&date=${date}&class=${encodeURIComponent(cls)}&medium=${encodeURIComponent(medium)}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!data || data.length === 0) {
            container.innerHTML = `<p style="color:red; text-align:center; font-weight:bold;">कोई रिकॉर्ड नहीं मिला।</p>`;
            return;
        }

        let html = `
        <div style="overflow-x: auto; margin-top:15px;">
            <table style="width:100%; border-collapse:collapse; background:white; font-size:14px; border:1px solid #ddd;">
                <thead>
                    <tr style="background:#1e3a8a; color:white; text-align:left;">
                        <th style="padding:12px;">ID</th>
                        <th style="padding:12px;">नाम</th>
                        <th style="padding:12px;">पिता का नाम</th>
                        <th style="padding:12px;">कक्षा</th>
                        <th style="padding:12px;">माध्यम</th>
                        <th style="padding:12px;">Status</th>
                        <th style="padding:12px;">Action</th>
                    </tr>
                </thead>
                <tbody>`;
        
        data.forEach((s, i) => {
            let status = (s.Status || "").toString().trim();
            html += `
                <tr style="border-bottom:1px solid #eee;">
                    <td style="padding:10px;">${s["Student ID"]}</td>
                    <td style="padding:10px;"><strong>${s["Student Name"]}</strong></td>
                    <td style="padding:10px;">${s["Father Name"] || '-'}</td>
                    <td style="padding:10px;">${s["Class"]}</td>
                    <td style="padding:10px;">${s["Medium"]}</td>
                    <td style="padding:10px;">
                        <select id="st_${i}" style="padding:5px; border-radius:4px;">
                            <option value="P" ${status==="P"?"selected":""}>Present</option>
                            <option value="A" ${status==="A"?"selected":""}>Absent</option>
                        </select>
                    </td>
                    <td style="padding:10px;">
                        <button class="update-single-btn" data-id="${s["Student ID"]}" data-idx="${i}" 
                            style="background:#059669; color:white; border:none; padding:6px 10px; border-radius:4px; cursor:pointer;">
                            <i class="fa-solid fa-floppy-disk"></i> Update
                        </button>
                    </td>
                </tr>`;
        });
        
        container.innerHTML = html + `</tbody></table></div>`;

        document.querySelectorAll('.update-single-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                updateCorrectionAttendance(this.getAttribute('data-id'), this.getAttribute('data-idx'), this);
            });
        });

    } catch (e) {
        container.innerHTML = "<p style='color:red; text-align:center;'>त्रुटि: डेटा लोड करने में विफलता।</p>";
    }
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
    const contentArea = document.getElementById('contentArea');
    contentArea.style.minHeight = "300px";
    contentArea.innerHTML = `<p style='text-align:center; padding:40px;'><i class='fa-solid fa-spinner fa-spin'></i> डेटा लोड हो रहा है...</p>`;
    
    try {
        const response = await fetch(sheetUrls['Attendance'] + "?action=getAttendanceSummary");
        const data = await response.json();

        if (!data || data.length === 0) { 
            contentArea.innerHTML = "<p style='padding:20px; text-align:center; color:#666;'>डेटा उपलब्ध नहीं है।</p>"; 
            return; 
        }
        
        let html = `
            <h3 style="color:#1e3a8a; margin: 0 0 15px 0;"><i class="fa-solid fa-chart-line"></i> आज की उपस्थिति Summary </h3>
            <div style="overflow-x: auto; border: 1px solid #e5e7eb; border-radius: 10px; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <table style="width: 100%; border-collapse: collapse; min-width: 400px;">
                    <thead>
                        <tr style="background:#f8fafc; color: #475569; border-bottom: 2px solid #e2e8f0;">
                            <th style="padding: 15px; text-align: left;">कक्षा</th>
                            <th style="padding: 15px; text-align: center;">माध्यम</th>
                            <th style="padding: 15px; text-align: center;">उपस्थित</th>
                            <th style="padding: 15px; text-align: center;">अनुपस्थित</th>
                        </tr>
                    </thead>
                    <tbody>`;
        
        data.forEach(row => {
            html += `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 14px; font-weight: 600;">${row.Class}</td>
                    <td style="padding: 14px; text-align: center; color: #64748b;">${row.Medium || '-'}</td>
                    <td style="padding: 14px; text-align: center; color: #059669;">
                        <i class="fa-solid fa-check-circle"></i> ${row.P}
                    </td>
                    <td style="padding: 14px; text-align: center; color: #dc2626;">
                        <i class="fa-solid fa-times-circle"></i> ${row.A}
                    </td>
                </tr>`;
        });
        
        contentArea.innerHTML = html + `</tbody></table></div>`;
        
    } catch (e) { 
        contentArea.innerHTML = "<p style='color:red; padding:20px; text-align:center;'>डेटा लोड करने में त्रुटि हुई!</p>"; 
    }
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
    if(students.length === 0){ 
        container.innerHTML = "<p style='color:orange; text-align:center;'>इस कक्षा में कोई छात्र नहीं मिला।</p>"; 
        return; 
    }

    // टेबल का लेआउट (CSS के साथ ताकि यह प्रोफेशनल दिखे)
    let html = `
    <table style="width:100%; border-collapse:collapse; margin-top:15px; font-size:14px;">
        <thead>
            <tr style="background:#334155; color:white; text-align:left;">
                <th style="padding:10px;">ID</th>
                <th style="padding:10px;">नाम</th>
                <th style="padding:10px;">पिता का नाम</th>
                <th style="padding:10px;">माध्यम</th>
                <th style="padding:10px;">कक्षा</th>
                <th style="padding:10px;">एक्शन</th>
            </tr>
        </thead>
        <tbody>
    `;

    students.forEach((stu) => {
        html += `
            <tr style="border-bottom:1px solid #e2e8f0;">
                <td style="padding:10px;"><strong>${stu["Student ID"] || stu["id"]}</strong></td>
                <td style="padding:10px;">${stu["Student Name"] || stu["name"]}</td>
                <td style="padding:10px;">${stu["Father Name"] || stu["father"]}</td>
                <td style="padding:10px;">${stu["Medium"] || stu["medium"]}</td>
                <td style="padding:10px;">${stu["Class"] || stu["class"]}</td>
                <td style="padding:10px;">
                    <button class="del-action-btn" data-id="${stu["Student ID"] || stu["id"]}" 
                        style="background:#dc2626; color:white; border:none; padding:6px 10px; border-radius:4px; cursor:pointer;">
                        <i class="fa-solid fa-trash-can"></i> डिलीट
                    </button>
                </td>
            </tr>`;
    });

    container.innerHTML = html + "</tbody></table>";

    // बटन क्लिक इवेंट
    document.querySelectorAll('.del-action-btn').forEach(btn => {
        btn.addEventListener('click', function() { 
            executeDeleteRowOperation(this.getAttribute('data-id'), this); 
        });
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


// छात्र जोड़ने (Sync) के लिए UI और लॉजिक
export function showAddStudentForm() {
    const contentArea = document.getElementById("contentArea");
    contentArea.innerHTML = `
        <div style="max-width: 450px; margin: 30px auto; padding: 25px; background: #ffffff; border-radius: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); font-family: sans-serif;">
            <h3 style="margin-top:0; color: #1e3a8a;"><i class="fa-solid fa-user-plus"></i> छात्र जोड़े</h3>
            
            <div style="margin-bottom: 20px;">
                <input type="text" id="sid" placeholder="Student ID दर्ज करें" style="width:100%; padding:12px; border:1px solid #cbd5e1; border-radius:8px; box-sizing:border-box; margin-bottom:10px;">
                <button id="btnSearch" onclick="window.searchStudent()" style="width:100%; padding:12px; background:#1e3a8a; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">सर्च करें</button>
            </div>

            <div id="studentDetails" style="display:none; padding:15px; background:#f8fafc; border-left:5px solid #1e3a8a; border-radius:4px; margin-bottom:15px;"></div>
            
            <button id="btnSync" onclick="window.confirmSync()" style="display:none; width:100%; padding:12px; background:#16a34a; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">
                <i class="fa-solid fa-check-circle"></i> डेटा सेव (Sync) करें
            </button>
            <div id="syncStatus" style="margin-top:10px; font-size:14px; text-align:center;"></div>
        </div>
    `;
}

// 1. सर्च करने का लॉजिक
window.searchStudent = async () => {
    const id = document.getElementById("sid").value.trim();
    const details = document.getElementById("studentDetails");
    const btnSync = document.getElementById("btnSync");
    const status = document.getElementById("syncStatus");

    if (!id) { alert("कृपया Student ID दर्ज करें!"); return; }

    status.innerText = "खोजा जा रहा है...";
    
    try {
        const response = await fetch(`${sheetUrls['Database']}?action=searchById&studentId=${id}`);
        const data = await response.json();

        if (data.status === "found") {
            details.style.display = "block";
            details.innerHTML = `
                <p style="margin:5px 0;"><b>नाम:</b> ${data.name}</p>
                <p style="margin:5px 0;"><b>पिता:</b> ${data.father}</p>
                <p style="margin:5px 0;"><b>माध्यम:</b> ${data.medium}</p>
                <p style="margin:5px 0;"><b>कक्षा:</b> ${data.class}</p>
                <p style="margin:5px 0;"><b>मोबाइल:</b> ${data.mobile1}</p>
            `;
            btnSync.style.display = "block";
            status.innerText = "";
            window.tempStudentData = data; 
        } else {
            alert("छात्र नहीं मिला!");
            details.style.display = "none";
            btnSync.style.display = "none";
        }
    } catch (e) {
        alert("सर्च करने में त्रुटि आई!");
    }
};

// 2. सेव (Sync) करने का लॉजिक
window.confirmSync = async () => {
    const btn = document.getElementById("btnSync");
    const status = document.getElementById("syncStatus");
    
    btn.disabled = true;
    btn.innerText = "सिंक हो रहा है...";
    
    const s = window.tempStudentData;
    
    try {
        await fetch(sheetUrls['StudentData'], {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                action: "saveToStudentData", 
                studentId: s.studentId, name: s.name, father: s.father, medium: s.medium, class: s.class, mobile1: s.mobile1,
            })
        });
        
        status.innerHTML = `<span style="color:green;">✔ सफलतापूर्वक सिंक हो गया!</span>`;
        setTimeout(() => showAddStudentForm(), 2000); // 2 सेकंड बाद फॉर्म रीसेट
    } catch (e) {
        status.innerHTML = `<span style="color:red;">❌ सिंक करने में विफल!</span>`;
        btn.disabled = false;
        btn.innerText = "डेटा सेव करें";
    }
};
