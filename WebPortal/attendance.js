// --- DAILY ATTENDANCE MANAGEMENT ---
function showAttendanceForm() {
    const today = new Date().toISOString().split('T')[0];
    if (!lastData || lastData.length === 0) {
        document.getElementById("contentArea").innerHTML = "<p style='color:red;'>Student data load नहीं हुआ</p>";
        return;
    }

    let allClasses = [...new Set(lastData.map(s => s.Class || s.class).filter(Boolean))];
    let allMediums = [...new Set(lastData.map(s => s.Medium || s.medium).filter(Boolean))];

    document.getElementById("contentArea").innerHTML = `
        <div style="max-width:1100px; margin:auto; background:#fff; padding:20px; border-radius:10px;">
            <h2>📅 दैनिक उपस्थिति</h2>
            <div style="display:flex; gap:15px; flex-wrap:wrap;">
                <div style="flex:1;"><label>तारीख</label><input type="date" id="attDate" value="${today}" style="width:100%; height:45px; padding:10px;" onchange="checkLockAndLoadStudents()"></div>
                <div style="flex:1;"><label>कक्षा</label><select id="classFilter" style="width:100%; height:45px;" onchange="checkLockAndLoadStudents()"><option value="">-- कक्षा --</option>${allClasses.map(c => `<option value="${c}">${c}</option>`).join('')}</select></div>
                <div style="flex:1;"><label>माध्यम</label><select id="mediumFilter" style="width:100%; height:45px;" onchange="checkLockAndLoadStudents()"><option value="">-- माध्यम --</option>${allMediums.map(m => `<option value="${m}">${m}</option>`).join('')}</select></div>
            </div>
            <div id="attendanceTableContainer" style="margin-top:20px;"><p style="text-align:center;">कृपया कक्षा और माध्यम चुनें...</p></div>
        </div>`;
    setTimeout(() => { checkLockAndLoadStudents(); }, 300);
}

async function checkLockAndLoadStudents() {
    let selectedClass = document.getElementById('classFilter').value;
    let selectedDate = document.getElementById('attDate').value;
    let selectedMedium = document.getElementById('mediumFilter').value;
    let container = document.getElementById('attendanceTableContainer');

    if (!selectedClass) { container.innerHTML = ""; return; }
    if (!selectedMedium) { alert("कृपया Medium चुनें!"); return; }
    if (!selectedDate) { alert("कृपया पहले तारीख चुनें!"); document.getElementById('classFilter').value = ""; return; }

    container.innerHTML = `<div style="color:#1e3a8a; font-weight:bold;"><i class="fa-solid fa-spinner fa-spin"></i> लॉक स्टेटस चेक किया जा रहा है...</div>`;
    try {
        const url = `${sheetUrls['Attendance']}?action=checkLock&date=${selectedDate}&class=${encodeURIComponent(selectedClass)}&medium=${encodeURIComponent(selectedMedium)}`;
        const response = await fetch(url);
        const result = await response.json();
        if (result.exists === true) {
            container.innerHTML = `<div style="background:#fee2e2; border:2px solid #dc2626; color:#991b1b; padding:20px; text-align:center; font-weight:bold;">⚠️ इस कक्षा की उपस्थिति पहले ही सबमिट की जा चुकी है।<br><br>Correction के लिए Admin से संपर्क करें।</div>`;
        } else {
            filterStudentsByClass();
        }
    } catch (e) { filterStudentsByClass(); }
}

function filterStudentsByClass() {
    let selectedClass = document.getElementById('classFilter').value;
    let selectedMedium = document.getElementById('mediumFilter').value;
    let container = document.getElementById('attendanceTableContainer');

    let filteredStudents = lastData.filter(s => {
        let cls = (s['Class'] || s['class'] || "").toString().trim().toLowerCase();
        let med = (s['Medium'] || s['medium'] || "").toString().trim().toLowerCase();
        return cls === selectedClass.toLowerCase() && med === selectedMedium.toLowerCase();
    });

    let html = `
        <table id="attTable">
            <thead><tr><th>Student ID</th><th>Student Name</th><th>Father Name</th><th>Medium</th><th>Class</th><th>Status (P/A)</th></tr></thead>
            <tbody>
                ${filteredStudents.map(s => `
                    <tr>
                        <td>${s['Student ID'] || s['ID'] || '-'}</td>
                        <td>${s['Student Name'] || s['Name'] || '-'}</td>
                        <td>${s['Father Name'] || s['father'] || '-'}</td>
                        <td>${s['Medium'] || '-'}</td>
                        <td>${s['Class'] || '-'}</td>
                        <td>
                            <select class="attStatus" onchange="updateRowColor(this)">
                                <option value="">-- चुनें --</option>
                                <option value="P">Present (P)</option>
                                <option value="A">Absent (A)</option>
                            </select>
                        </td>
                    </tr>`).join('')}
            </tbody>
        </table>
        <button onclick="saveAttendance(event)" class="btn-action" style="margin-top:20px; background:#1e3a8a; color:white;">सबमिट उपस्थिति</button>`;
    container.innerHTML = html;
}

function updateRowColor(selectElement) {
    let row = selectElement.closest('tr');
    if (selectElement.value === 'P') {
        row.classList.add('row-present'); row.classList.remove('row-absent');
    } else if (selectElement.value === 'A') {
        row.classList.add('row-absent'); row.classList.remove('row-present');
    } else {
        row.classList.remove('row-present', 'row-absent');
    }
}

function saveAttendance(event) {
    let btn = event.target;
    let date = document.getElementById("attDate").value;
    let rows = document.querySelectorAll("#attTable tbody tr");
    if (!date) { alert("कृपया तारीख चुनें!"); return; }
    let attendance = [];
    let hasEmptyStatus = false;

    rows.forEach(row => {
        let statusValue = row.querySelector('.attStatus').value;
        if (statusValue === "") { hasEmptyStatus = true; row.style.border = "2px solid #dc2626"; }
        attendance.push({
            date: date,
            "Student ID": row.cells[0].innerText.trim(),
            "Student Name": row.cells[1].innerText.trim(),
            "Father Name": row.cells[2].innerText.trim(),
            "Medium": row.cells[3].innerText.trim(),
            "Class": row.cells[4].innerText.trim(),
            "Status": statusValue
        });
    });

    if (hasEmptyStatus) { alert("⚠️ ध्यान दें: कुछ छात्रों की उपस्थिति छूट गई है!"); return; }
    btn.innerText = "सेव हो रहा है..."; btn.disabled = true;

    fetch(sheetUrls['Attendance'], {
        method: 'POST', mode: 'no-cors',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attendance)
    })
    .then(() => { alert("उपस्थिति सफलतापूर्वक दर्ज हो गई!"); btn.innerText = "सबमिट उपस्थिति"; btn.disabled = false; })
    .catch(err => { alert("त्रुटि: " + err); btn.innerText = "सबमिट उपस्थिति"; btn.disabled = false; });
}

// --- ATTENDANCE CORRECTION PORTAL ---
async function showCorrectionPortal() {
    const today = new Date().toISOString().split('T')[0];
    let data = [];
    try {
        const res = await fetch(sheetUrls['StudentData'] + "?action=getStudents&class=All");
        data = await res.json(); lastData = data;
    } catch (e) {
        document.getElementById("contentArea").innerHTML = "<p style='color:red;'>Student data load नहीं हुआ</p>";
        return;
    }

    let allClasses = [...new Set(data.map(s => (s.Class || s.class || "").toString().trim()).filter(Boolean))];
    let allMediums = [...new Set(data.map(s => (s.Medium || s.medium || "").toString().trim()).filter(Boolean))];

    document.getElementById("contentArea").innerHTML = `
    <div style="max-width: 900px; margin: auto; background: #fff; padding: 20px; border-radius: 12px; border: 1px solid #ddd;">
        <div style="font-size: 20px; font-weight: bold; color: #1e3a8a; margin-bottom: 15px;">📌 उपस्थिति सुधार (Auto Load)</div>
        <div style="display: flex; gap: 15px; flex-wrap: wrap;">
            <div style="flex: 1;"><label>📅 Date</label><input type="date" id="searchDate" value="${today}" onchange="loadClassAttendanceForCorrection()" style="width: 100%; height: 45px;"></div>
            <div style="flex: 1;"><label>📚 Class</label><select id="searchClass" onchange="loadClassAttendanceForCorrection()" style="width: 100%; height: 45px;"><option value="">-- Class चुनें --</option>${allClasses.map(c => `<option value="${c}">${c}</option>`).join('')}</select></div>
            <div style="flex: 1;"><label>🧾 Medium</label><select id="searchMedium" onchange="loadClassAttendanceForCorrection()" style="width: 100%; height: 45px;"><option value="">-- Medium चुनें --</option>${allMediums.map(m => `<option value="${m}">${m}</option>`).join('')}</select></div>
        </div>
        <div id="classCorrectionTable" style="margin-top:20px;"><p style="text-align:center;color:#64748b;">Date + Class + Medium select करो</p></div>
    </div>`;
}

async function loadClassAttendanceForCorrection() {
    const date = document.getElementById("searchDate").value;
    const cls = document.getElementById("searchClass").value;
    const medium = document.getElementById("searchMedium").value;
    const container = document.getElementById("classCorrectionTable");

    if (!date || !cls || !medium) { container.innerHTML = "<p>सभी फ़ील्ड चुनें</p>"; return; }
    container.innerHTML = `<p style="text-align:center;">⏳ Loading...</p>`;

    try {
        const url = `${sheetUrls['Attendance']}?action=getClassAttendance&date=${date}&class=${encodeURIComponent(cls)}&medium=${encodeURIComponent(medium)}`;
        const res = await fetch(url); const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) { container.innerHTML = `<p style="color:red;text-align:center;">No Attendance Found</p>`; return; }

        let html = `<table><thead><tr><th>ID</th><th>Name</th><th>Class</th><th>Medium</th><th>Status</th><th>Action</th></tr></thead><tbody>`;
        data.forEach((s, i) => {
            let status = (s.Status || s.status || "").toString().trim();
            html += `<tr>
                <td>${s["Student ID"] || ""}</td><td>${s["Student Name"] || ""}</td><td>${s["Class"] || ""}</td><td>${s["Medium"] || ""}</td>
                <td><select id="st_${i}"><option value="P" ${status === "P" ? "selected" : ""}>P</option><option value="A" ${status === "A" ? "selected" : ""}>A</option></select></td>
                <td><button onclick="updateCorrectionAttendance('${s["Student ID"]}', ${i}, this)" style="background:#1e3a8a;color:white;padding:6px 12px;border:none;cursor:pointer;">Update</button></td>
            </tr>`;
        });
        container.innerHTML = html + `</tbody></table>`;
    } catch (e) { container.innerHTML = `<p style="color:red;text-align:center;">Server Error</p>`; }
}

async function updateCorrectionAttendance(studentId, i, buttonElement) {
    let select = document.getElementById(`st_${i}`);
    let newStatus = select.value;
    let selectedDate = document.getElementById("searchDate").value; 
    if (!selectedDate || !studentId || !newStatus) { alert("विवरण गायब है!"); return; }

    const payload = { action: "updateSingleAttendance", studentId: studentId, date: selectedDate, newStatus: newStatus };
    if (buttonElement) { buttonElement.disabled = true; buttonElement.innerText = "⏳..."; }

    try {
        const res = await fetch(sheetUrls['Attendance'], {
            method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.status === "success") { alert(`✔ ${selectedDate} की उपस्थिति सफलतापूर्वक सुधारी गई।`); } else { alert("Update Failed: " + (data.message || "Unknown Error")); }
    } catch (err) { alert("Server Error: " + err.message); }
    finally { if (buttonElement) { buttonElement.disabled = false; buttonElement.innerText = "Update"; } }
}

// --- ABSENT STUDENT REPORT MODULE ---
async function showAbsentReport() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('contentArea').innerHTML = `<p>डेटा लोड हो रहा है...</p>`;
    try {
        const response = await fetch(sheetUrls['StudentData'] + "?action=getStudents&class=All");
        const data = await response.json();
        const classes = [...new Set(data.map(s => s.Class || s.class).filter(Boolean))].sort();
        const mediums = [...new Set(data.map(s => s.Medium || s.medium).filter(Boolean))].sort();

        document.getElementById('contentArea').innerHTML = `
            <div style="background:#fff; padding:20px; border-radius:8px; border:1px solid #ddd;">
                <h3 style="color:#1e3a8a;">अनुपस्थित छात्रों की रिपोर्ट</h3>
                <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:20px;">
                    <input type="date" id="absDate" value="${today}">
                    <select id="absClass"><option value="">कक्षा चुनें</option>${classes.map(c => `<option value="${c}">${c}</option>`).join('')}</select>
                    <select id="absMedium"><option value="">माध्यम चुनें</option>${mediums.map(m => `<option value="${m}">${m}</option>`).join('')}</select>
                    <button onclick="loadAbsentStudents()" style="background:#1e3a8a; color:white; padding:8px 15px; border:none; cursor:pointer;">खोजें</button>
                    <button onclick="printAbsentList()" style="background:#28a745; color:white; padding:8px 15px; border:none; cursor:pointer;">प्रिंट करें</button>
                </div>
                <div id="absentListContainer"></div>
            </div>`;
    } catch (err) { document.getElementById('contentArea').innerHTML = `<p style="color:red;">त्रुटि डेटा लोड करने में।</p>`; }
}

async function loadAbsentStudents() {
    const date = document.getElementById("absDate").value;
    const className = document.getElementById("absClass").value;
    const medium = document.getElementById("absMedium").value;
    const container = document.getElementById("absentListContainer");
    if (!date || !className || !medium) return;
    container.innerHTML = `<div>Loading...</div>`;

    try {
        const url = `${sheetUrls['Attendance']}?action=getAbsentStudents&date=${date}&class=${className}&medium=${medium}`;
        const response = await fetch(url); const data = await response.json();
        if (data.length === 0) { container.innerHTML = `<p style="text-align:center; color:red;">कोई अनुपस्थित छात्र नहीं मिला।</p>`; return; }

        let html = `<table><thead><tr><th>ID</th><th>नाम</th><th>पिता का नाम</th><th>कक्षा</th><th>माध्यम</th></tr></thead><tbody>`;
        html += data.map(s => `<tr><td>${s["Student ID"]}</td><td>${s["Student Name"]}</td><td>${s["Father Name"]}</td><td>${s["Class"] || className}</td><td>${s["Medium"] || medium}</td></tr>`).join('');
        container.innerHTML = html + `</tbody></table>`;
    } catch (err) { container.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`; }
}

function printAbsentList() {
    const content = document.getElementById("absentListContainer").innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<html><head><title>Absent Report</title></head><body><h3>अनुपस्थित छात्रों की सूची - ${document.getElementById("absDate").value}</h3>${content}</body></html>`);
    printWindow.document.close(); printWindow.print();
}
