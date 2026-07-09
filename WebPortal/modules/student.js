import { sheetUrls } from './config.js';

// --- API Functions ---
export async function getStudentsByFilter(className, medium, session) {

    const url =
        `${sheetUrls['Database']}?action=filter` +
        `&class=${encodeURIComponent(className)}` +
        `&medium=${encodeURIComponent(medium)}` +
        `&session=${encodeURIComponent(session)}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
    }

    return await response.json();
}

export async function promoteSelectedStudent(studentIds, targetClass, targetSession) {
    const response = await fetch(sheetUrls['Database'], {
        method: "POST",
        body: JSON.stringify({
            action: "bulkPromote",
            ids: studentIds,
            newClass: targetClass,
            newSession: targetSession
        })
    });

    const textResponse = await response.text();
    try {
        return JSON.parse(textResponse);
    } catch (e) {
        console.error("Server response:", textResponse);
        throw new Error("Invalid server response");
    }
}


// --- UI Rendering ---
export async function renderStudentList() {
    const contentArea = document.getElementById('contentArea');
    
    // डेटा सूचियाँ
    const romanClasses = [ "Nursary", "KG1", "KG2", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    const medium = ["Hindi", "English"];
    const sessions = ["2027-28", "2028-29", "2029-30"];

    // जनरेटर फंक्शन
    const generateOptions = (list) => list.map(item => `<option value="${item}">${item}</option>`).join('');

    contentArea.innerHTML = `
    <style>
        /* Shiksha Portal 3.0 Modern Theme CSS */
        .portal-wrapper { font-family: 'Segoe UI', system-ui, sans-serif; background-color: #f4f6f9; padding: 10px; border-radius: 12px; }
        .promote-title { color: #0d3558; font-size: 22px; font-weight: 700; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; border-bottom: 3px solid #1a73e8; padding-bottom: 8px; }
        
        /* Filter Box Upgrade */
        .filter-box { padding: 24px; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 16px rgba(0,0,0,0.05); margin-bottom: 25px; display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; align-items: flex-end; border: 1px solid #e2e8f0; }
        .filter-field { display: flex; flex-direction: column; gap: 6px; }
        .filter-field label { color: #4a5568; font-size: 14px; font-weight: 600; }
        .filter-box select { padding: 10px 14px; border: 1.5px solid #cbd5e1; border-radius: 6px; background-color: #fff; color: #334155; font-size: 14px; outline: none; transition: all 0.2s ease; cursor: pointer; }
        .filter-box select:focus { border-color: #1a73e8; box-shadow: 0 0 0 3px rgba(26,115,232,0.15); }
        
        /* Buttons Design */
        .btn-portal { padding: 11px 24px; font-size: 14px; font-weight: 600; border: none; border-radius: 6px; cursor: pointer; transition: all 0.2s ease; display: inline-flex; align-items: center; justify-content: center; text-transform: uppercase; letter-spacing: 0.5px; }
        .btn-load { background: #1a73e8; color: white; height: 42px; box-shadow: 0 2px 6px rgba(26,115,232,0.2); }
        .btn-load:hover { background: #1557b0; transform: translateY(-1px); }
        .btn-promote { background: #10b981; color: white; box-shadow: 0 2px 6px rgba(16,185,129,0.2); }
        .btn-promote:hover { background: #059669; transform: translateY(-1px); }
        
        /* Table Upgrade 3.0 */
        .table-responsive { overflow-x: auto; background: #fff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.04); border: 1px solid #e2e8f0; margin-top: 15px; }
        .student-table { width: 100%; border-collapse: collapse; min-width: 600px; text-align: left; }
        .student-table th { background: #0d3558; color: white; padding: 14px 16px; font-size: 14px; font-weight: 600; letter-spacing: 0.5px; }
        .student-table td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; color: #334155; font-size: 14px; }
        .student-table tr:hover { background-color: #f8fafc; }
        .student-table input[type="checkbox"] { width: 16px; height: 16px; cursor: pointer; accent-color: #1a73e8; }
        
        /* Promotion Section Box */
        .promotion-action-card { margin-top: 25px; padding: 20px; background: #f8fafc; border-radius: 10px; border: 1.5px dashed #cbd5e1; display: flex; flex-wrap: wrap; gap: 20px; align-items: center; justify-content: space-between; }
        .action-inputs { display: flex; flex-wrap: wrap; gap: 15px; align-items: center; }
        .action-inputs select { padding: 10px 14px; border: 1.5px solid #cbd5e1; border-radius: 6px; font-size: 14px; background: #fff; }
        .action-inputs label { font-size: 14px; font-weight: 600; color: #4a5568; }
        
        /* Loader/Status Messages */
        .status-msg { padding: 20px; font-size: 16px; text-align: center; color: #64748b; font-weight: 500; background: #fff; border-radius: 8px; border: 1px solid #e2e8f0; }
    </style>

    <div class="portal-wrapper">
        <div class="promote-title">🎓 छात्र प्रमोशन मॉड्यूल (Student Promotion Portal)</div>
        <div class="filter-box">
            <div class="filter-field">
                <label>Class / कक्षा:</label>
                <select id="classSelect">${generateOptions(romanClasses)}</select>
            </div>
            <div class="filter-field">
                <label>Medium / माध्यम:</label>
                <select id="mediumSelect">
                    <option value="">Select Medium</option>
                    <option value="Hindi">Hindi</option>
                    <option value="English">English</option>
                </select>
            </div>
            <div class="filter-field">
                <label>Current Session / शैक्षणिक सत्र:</label>
                <select id="sessionSelect">
                    <option value="">Select Session</option>
                    <option value="2026-27">2026-27</option>
                    <option value="2027-28">2027-28</option>
                    <option value="2028-29">2028-29</option>
                    <option value="2029-30">2029-30</option>
                </select>
            </div>
            <button id="loadListBtn" class="btn-portal btn-load">सूची लोड करें (Load List)</button>
        </div>
        <div id="studentDisplayArea"></div>
    </div>`;

    contentArea.onclick = async (e) => {
        // Load List
        if (e.target.id === 'loadListBtn') {
            const displayArea = document.getElementById('studentDisplayArea');
            displayArea.innerHTML = '<div class="status-msg">🔄 कृपया प्रतीक्षा करें, छात्रों की सूची लोड की जा रही है...</div>';
            const students = await getStudentsByFilter(document.getElementById('classSelect').value, document.getElementById('mediumSelect').value, document.getElementById('sessionSelect').value);
            
            if (!students || students.length === 0) return displayArea.innerHTML = '<div class="status-msg" style="color: #ef4444;">⚠️ चयनित फ़िल्टर के अनुसार कोई छात्र रिकॉर्ड नहीं मिला!</div>';

            let html = `
            <div class="table-responsive">
                <table class="student-table">
                    <thead>
                        <tr>
                            <th style="width: 50px;"><input type="checkbox" id="selectAll"></th>
                            <th>Application No</th>
                            <th>Student ID</th>
                            <th>Current Session</th>
                            <th>Student Name</th>
                            <th>Father's Name</th>
                        </tr>
                    </thead>
                    <tbody>`;
            
            students.forEach(s => {
                html += `
                    <tr>
                        <td><input type="checkbox" class="studentCheck" value="${s.studentid}"></td>
                        <td style="font-weight: 600; color: #1a73e8;">${s.appNo || 'N/A'}</td>
                        <td style="color: #64748b;">${s.studentid}</td>
                        <td>${s.session}</td>
                        <td style="font-weight: 500; color: #1e293b;">${s.name}</td>
                        <td>${s.father}</td>
                    </tr>`;
            });
            
            html += `
                    </tbody>
                </table>
            </div>
            <div class="promotion-action-card">
                <div class="action-inputs">
                    <label>Promote to Class (अगली कक्षा):</label>
                    <select id="targetClass">${generateOptions(romanClasses)}</select>
                    
                    <label style="margin-left: 10px;">Target Session (आगामी सत्र):</label>
                    <select id="targetSession">${generateOptions(sessions)}</select>
                </div>
                <button id="promoteBtn" class="btn-portal btn-promote">चुने गए छात्रों को प्रमोट करें</button>
            </div>`;
            
            displayArea.innerHTML = html;
        }

        // Select All
        if (e.target.id === 'selectAll') {
            document.querySelectorAll('.studentCheck').forEach(cb => cb.checked = e.target.checked);
        }

        // Promote Action
        if (e.target.id === 'promoteBtn') {
            const ids = Array.from(document.querySelectorAll('.studentCheck:checked')).map(cb => cb.value);
            const targetClass = document.getElementById('targetClass').value;
            const targetSession = document.getElementById('targetSession').value;
            
            if (ids.length === 0) return alert("कृपया सूची से कम से कम एक छात्र को चुनें!");
            
            if (confirm(`क्या आप चुने गए ${ids.length} छात्रों को अगली कक्षा ${targetClass} (सत्र: ${targetSession}) में प्रमोट करना चाहते हैं?`)) {
                e.target.innerText = "PROCESSING...";
                e.target.disabled = true;
                e.target.style.opacity = "0.7";
                
                const res = await promoteSelectedStudent(ids, targetClass, targetSession);
                if (res.status === "success") {
                    alert("बधाई हो! छात्रों को सफलतापूर्वक प्रमोट कर दिया गया है।");
                    document.getElementById('loadListBtn').click(); 
                } else {
                    alert("त्रुटि: " + res.message);
                    e.target.innerText = "चुने गए छात्रों को प्रमोट करें";
                    e.target.disabled = false;
                    e.target.style.opacity = "1";
                }
            }
        }
    };
}

export async function renderSearchList() {
    const contentArea = document.getElementById('contentArea');

    const classes = ["Nursary", "KG1", "KG2", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    const years = ["2026-27", "2027-28", "2028-29", "2029-30"];

    const generateOptions = (list) => list.map(item => `<option value="${item}">${item}</option>`).join('');

    contentArea.innerHTML = `
    <style>
        /* Shiksha Portal 3.0 UI Design */
        .portal-wrapper { font-family: 'Segoe UI', system-ui, sans-serif; background-color: #f4f6f9; padding: 10px; border-radius: 12px; }
        .promote-title { color: #0d3558; font-size: 22px; font-weight: 700; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; border-bottom: 3px solid #1a73e8; padding-bottom: 8px; }
        
        /* Filter Box Design */
        .filter-box { padding: 24px; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 16px rgba(0,0,0,0.05); margin-bottom: 25px; display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; align-items: flex-end; border: 1px solid #e2e8f0; }
        .filter-field { display: flex; flex-direction: column; gap: 6px; }
        .filter-field label { color: #4a5568; font-size: 14px; font-weight: 600; }
        .filter-box select { padding: 10px 14px; border: 1.5px solid #cbd5e1; border-radius: 6px; background-color: #fff; color: #334155; font-size: 14px; outline: none; transition: all 0.2s ease; cursor: pointer; }
        .filter-box select:focus { border-color: #1a73e8; box-shadow: 0 0 0 3px rgba(26,115,232,0.15); }
        
        /* Modern Table Components */
        .table-responsive { overflow-x: auto; background: #fff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.04); border: 1px solid #e2e8f0; margin-top: 15px; }
        .student-table { width: 100%; border-collapse: collapse; min-width: 600px; text-align: left; }
        .student-table th { background: #0d3558; color: white; padding: 14px 16px; font-size: 14px; font-weight: 600; letter-spacing: 0.5px; }
        .student-table td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; color: #334155; font-size: 14px; vertical-align: middle; }
        .student-table tr:hover { background-color: #f8fafc; }
        
        /* Buttons Upgrade */
        .btn-portal { padding: 11px 24px; font-size: 14px; font-weight: 600; border: none; border-radius: 6px; cursor: pointer; transition: all 0.2s ease; display: inline-flex; align-items: center; justify-content: center; text-transform: uppercase; letter-spacing: 0.5px; }
        .btn-load { background: #1a73e8; color: white; height: 42px; box-shadow: 0 2px 6px rgba(26,115,232,0.2); }
        .btn-load:hover { background: #1557b0; transform: translateY(-1px); }
        
        /* Action Buttons inside Table */
        .action-container { display: flex; gap: 8px; align-items: center; }
        .btn-action { padding: 6px 14px; font-size: 13px; font-weight: 600; border: none; border-radius: 4px; cursor: pointer; transition: all 0.15s ease; text-transform: capitalize; }
        .btn-edit { background-color: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
        .btn-edit:hover { background-color: #2563eb; color: white; }
        .btn-danger { background-color: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
        .btn-danger:hover { background-color: #dc2626; color: white; }
        
        .loading-text { padding: 30px; font-size: 15px; text-align: center; color: #64748b; font-weight: 500; }
    </style>

    <div class="portal-wrapper">
        <div class="promote-title">🎓 छात्र प्रोफाइल प्रबंधन और संशोधन (Student Profile Management & Update)</div>
        <div class="filter-box">
            <div class="filter-field">
                <label>Class / कक्षा:</label>
                <select id="classSelect">${generateOptions(classes)}</select>
            </div>
            <div class="filter-field">
                <label>Medium / माध्यम:</label>
                <select id="mediumSelect">
                    <option value="Hindi">Hindi</option>
                    <option value="English">English</option>
                </select>
            </div>
            <div class="filter-field">
                <label>Session / शैक्षणिक सत्र:</label>
                <select id="sessionSelect">
                    <option value="">Select Session</option>
                    ${generateOptions(years)}
                </select>
            </div>
            <button id="loadListBtn" class="btn-portal btn-load">सूची लोड करें (Load List)</button>
        </div>
        
        <div class="table-responsive">
            <table class="student-table">
                <thead>
                    <tr>
                        <th>Student ID</th>
                        <th>Student Name</th>
                        <th>Father's Name</th>
                        <th>DOB</th>
                        <th>Gender</th>
                        <th>Category</th>
                        <th style="text-align: center; width: 160px;">Action</th>
                    </tr>
                </thead>
                <tbody id="tableBody">
                    <tr>
                        <td colspan="7" class="loading-text">कृपया विवरण खोजें के लिए ऊपर फ़िल्टर सेट करके 'सूची लोड करें' पर क्लिक करें।</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>`;

    contentArea.onclick = async (e) => {
        if (e.target.id === 'loadListBtn') {
            const c = document.getElementById('classSelect').value;
            const m = document.getElementById('mediumSelect').value;
            const y = document.getElementById('sessionSelect').value;

            if (!c || !y) return alert("कृपया Class और Session दोनों select करें!");

            const tbody = document.getElementById('tableBody');
            tbody.innerHTML = "<tr><td colspan='7' class='loading-text'>🔄 कृपया प्रतीक्षा करें, डेटा लोड हो रहा है...</td></tr>";

            try {
                const students = await getStudentsByFilter(c, m, y); 
                
                if (!students || students.length === 0) {
                    tbody.innerHTML = "<tr><td colspan='7' class='loading-text' style='color: #ef4444;'>⚠️ चयनित फ़िल्टर के अनुसार कोई रिकॉर्ड नहीं मिला।</td></tr>";
                    return;
                }

                tbody.innerHTML = students.map(s => `
                    <tr>
                        <td style="font-weight: 600; color: #475569;">${s.studentid}</td>
                        <td style="font-weight: 500; color: #1e293b;">${s.name}</td>
                        <td>${s.father}</td>
                        <td>${s.dob || '-'}</td>
                        <td>${s.gender || '-'}</td>
                        <td><span style="padding: 2px 8px; background: #f1f5f9; border-radius: 4px; font-size: 12px; font-weight: 500;">${s.category || '-'}</span></td>
                        <td>
                            <div class="action-container">
                                <button class="btn-action btn-edit" onclick="window.editStudent('${s.studentid}')">Edit</button>
                                <button class="btn-action btn-danger" onclick="window.deleteStudent('${s.appNo || s.appno || ''}','${s.studentid}', '${s.session}')">Delete</button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            } catch (error) {
                console.error("Error fetching students:", error);
                tbody.innerHTML = "<tr><td colspan='7' class='loading-text' style='color: #dc2626;'>❌ डेटा लोड करने में त्रुटि आई है। कृपया पुनः प्रयास करें।</td></tr>";
            }
        }
    };
}

// यह फंक्शन डिलीट बटन को चालू करेगा
window.deleteStudent = async (appNo, studentId, session) => {
    if (confirm("⚠️ चेतावनी: क्या आप सच में इस छात्र का रिकॉर्ड हमेशा के लिए डिलीट करना चाहते हैं?")) {
        try {
            const res = await fetch(sheetUrls.Database, {
                method: "POST",
                body: JSON.stringify({ 
                    action: "delete",
                    appNo: appNo,
                    studentId: studentId,
                    session: session 
                })
            });
            const result = await res.json();
            alert(result.message);
            
            if (result.status === "success") {
                const loadListBtn = document.getElementById('loadListBtn');
                if (loadListBtn) loadListBtn.click();
            }
        } catch (error) {
            console.error("Delete Error:", error);
            alert("रिकॉर्ड डिलीट करने में सर्वर से कोई समस्या आई है।");
        }
    }
};

// शिक्षा पोर्टल 3.0 थीम आधारित फॉर्म रेंडरर फ़ंक्शन
function getProfileFormHTML(data) {
    return `
    <div class="main-layout">
        <div class="form-fields">
            <input type="hidden" id="uSession" value="${data.session || ''}">
            
            <div class="section-title">👤 व्यक्तिगत विवरण (Personal Details)</div>
            <div class="field"><label>Student ID</label><input id="uStudentId" class="portal-input input-disabled" value="${data.studentId || ''}" disabled></div>
            <div class="field"><label>Samagra ID</label><input id="uSamagra" class="portal-input" value="${data.samgra || ''}"></div>
            <div class="field"><label>Name</label><input id="uName" class="portal-input" value="${data.name || ''}"></div>
            <div class="field"><label>Father Name</label><input id="uFather" class="portal-input" value="${data.father || ''}"></div>
            <div class="field"><label>Mother Name</label><input id="uMother" class="portal-input" value="${data.mother || ''}"></div>
            <div class="field"><label>Date of Birth</label><input id="uDob" class="portal-input" type="date" value="${data.dob || ''}"></div>
            <div class="field">
                <label>Gender</label>
                <select id="uGender" class="portal-input">
                    <option value="Male" ${data.gender=='Male'?'selected':''}>Male</option>
                    <option value="Female" ${data.gender=='Female'?'selected':''}>Female</option>
                </select>
            </div>
            <div class="field">
                <label>Category</label>
                <select id="uCast" class="portal-input">
                    <option value="General" ${data.category=='General'?'selected':''}>General</option>
                    <option value="OBC" ${data.category=='OBC'?'selected':''}>OBC</option>
                    <option value="SC" ${data.category=='SC'?'selected':''}>SC</option>
                    <option value="ST" ${data.category=='ST'?'selected':''}>ST</option>
                </select>
            </div>
            
            <div class="section-title">🏫 शैक्षणिक एवं संपर्क विवरण (Academic & Contact)</div>
            <div class="field">
                <label>Class</label>
                <select id="uClass" class="portal-input" onchange="window.toggleSub()">
                    ${['Nursery','KG1','KG2','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'].map(c => `<option value="${c}" ${data.class == c ? 'selected' : ''}>${c}</option>`).join('')}
                </select>
            </div>
            <div class="field">
                <label>Medium</label>
                <select id="uMedium" class="portal-input">
                    <option value="Hindi" ${data.medium=='Hindi'?'selected':''}>Hindi</option>
                    <option value="English" ${data.medium=='English'?'selected':''}>English</option>
                </select>
            </div>
            <div class="field"><label>Enrolment No</label><input id="uEnrol" class="portal-input" value="${data.enrolment || ''}"></div>
            <div class="field"><label>Mobile</label><input id="uMobile" class="portal-input" value="${data.mobile1 || ''}"></div>
            <div class="field" id="subField" style="display:${(data.class=='XI'||data.class=='XII')?'flex':'none'}"><label>Subject</label><input id="uSubject" class="portal-input" value="${data.subject || ''}"></div>
           <div class="field" id="subField" style="display:${isHigherClass ? 'flex' : 'none'}">
                <label>Subject Stream</label>
                <select id="uSubject" class="portal-input">
                    <option value="Science (Maths)" ${data.subject=='Science (Maths)'?'selected':''}>Science (Maths)</option>
                    <option value="Science (Bio)" ${data.subject=='Science (Bio)'?'selected':''}>Science (Bio)</option>
                    <option value="Commerce" ${data.subject=='Commerce'?'selected':''}>Commerce</option>
                    <option value="Arts" ${data.subject=='Arts'?'selected':''}>Arts</option>
                    <option value="Agriculture" ${data.subject=='Agriculture'?'selected':''}>Agriculture</option>
                </select>
            </div>

            <div class="field">
                <label>Type of Student</label>
                <select id="uStudentType" class="portal-input">
                    <option value="Regular" ${data.studentType=='Regular'?'selected':''}>Regular</option>
                    <option value="Private" ${data.studentType=='Private'?'selected':''}>Private</option>
                    <option value="New" ${data.studentType=='New'?'selected':''}>New Admission</option>
                </select>
            </div>
            
            <div class="field" style="grid-column: span 2;"><label>Address</label><input id="uAddress" class="portal-input" value="${data.address || ''}"></div>
                
                
            <div class="section-title">🏦 बैंक एवं सुरक्षा विवरण (Bank & Security)</div>
            <div class="field"><label>Aadhaar</label><input class="portal-input input-disabled" value="[Redacted]" disabled></div>
            <div class="field"><label>Bank Account</label><input id="uBank" class="portal-input" value="${data.accountnumber || ''}"></div>
            <div class="field"><label>IFSC</label><input id="uIfsc" class="portal-input" value="${data.ifsc || ''}"></div>
            
            <button class="action-btn" id="saveBtn">💾 Update Student Profile</button>
        </div>
        <div class="photo-section">
            <div class="photo-label">STUDENT PHOTO</div>
            <img id="profileImg" src="${data.photo || 'https://via.placeholder.com/150'}">
            <input type="file" id="photoInput" style="display:none" accept="image/*">
            <button class="change-photo-btn" onclick="document.getElementById('photoInput').click()">🔄 Change Photo</button>
        </div>
    </div>
    <div id="msg" style="text-align:center; margin-top:20px; font-weight:bold;"></div>`;
}

// बाहरी कॉल के लिए एडिट फ़ंक्शन
window.editStudent = async (id, session) => {
    if (!id) return alert("Student ID नहीं मिली!");

    await renderStudentProfile();
    
    const idInput = document.getElementById('studentId');
    const sessionSelect = document.getElementById('searchSession');
    const formArea = document.getElementById('formArea');
    
    if (idInput) idInput.value = id;
    if (session && sessionSelect) sessionSelect.value = session;
    
    formArea.innerHTML = "<p style='text-align:center; font-weight:bold; color:#1a365d;'>🔄 Fetching Profile Data from Portal...</p>";
    
    try {
        const res = await fetch(`${sheetUrls.Database}?action=searchById&studentId=${id}&session=${session}`);
        const data = await res.json();
        
        if (data.status !== "found") {
            formArea.innerHTML = `<p style="color:red; text-align:center; font-weight:bold;">${data.message || "Record not found for this session."}</p>`;
            return;
        }

        formArea.innerHTML = getProfileFormHTML(data);
        setupPhotoHandler();
    } catch (err) {
        formArea.innerHTML = `<p style="color:red; text-align:center; font-weight:bold;">Error connecting to portal server.</p>`;
    }
};

function setupPhotoHandler() {
    const photoInput = document.getElementById('photoInput');
    const profileImg = document.getElementById('profileImg');
    
    if (photoInput && profileImg) {
        photoInput.onchange = function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    profileImg.src = e.target.result;
                }
                reader.readAsDataURL(file);
            }
        };
    }
}

// मुख्य सुधरा हुआ इंटरफ़ेस (Exclusive Correction Section)
export async function renderStudentProfile() {
    const contentArea = document.getElementById('contentArea');

    contentArea.innerHTML = `
    <style>
        /* शिक्षा पोर्टल 3.0 थीम कलर्स */
        .profile-wrapper { 
            max-width: 1050px; 
            margin: 30px auto; 
            background: #f0f4f8; 
            border-radius: 12px; 
            box-shadow: 0 8px 24px rgba(0,0,0,0.12); 
            padding: 25px;
            border-top: 5px solid #1a365d; 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .p-header { 
            background: #1a365d; 
            color: #ffffff; 
            padding: 15px 25px; 
            text-align: left; 
            font-size: 20px; 
            font-weight: 600; 
            border-radius: 6px; 
            margin-bottom: 25px; 
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 4px 10px rgba(26, 54, 93, 0.2);
        }
        .search-wrapper { 
            display: flex; 
            gap: 12px; 
            margin-bottom: 25px; 
            background: #ffffff;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            border: 1px solid #d2d6dc;
        }
        .main-layout { display: grid; grid-template-columns: 1fr 240px; gap: 25px; align-items: start; }
        
        .form-fields { 
            background: #ffffff; 
            padding: 25px; 
            border-radius: 8px; 
            border: 1px solid #d2d6dc; 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 18px; 
        }
        .photo-section { 
            background: #ffffff; 
            padding: 20px; 
            border-radius: 8px; 
            border: 1px solid #d2d6dc; 
            text-align: center; 
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .photo-label {
            font-size: 11px;
            font-weight: bold;
            color: #1a365d;
            margin-bottom: 12px;
            letter-spacing: 1px;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 6px;
        }
        .photo-section img { 
            width: 170px; 
            height: 190px; 
            border-radius: 4px; 
            border: 1px solid #cbd5e0; 
            object-fit: cover; 
            margin-bottom: 15px; 
            background: #f7fafc;
        }
        
        .field { display: flex; flex-direction: column; }
        .field label { 
            font-size: 12px; 
            font-weight: 600; 
            color: #2d3748; 
            margin-bottom: 6px; 
        }
        
        .portal-input { 
            padding: 10px 12px; 
            border: 1px solid #a0aec0; 
            border-radius: 5px; 
            font-size: 14px; 
            background: #ffffff; 
            color: #2d3748;
            transition: all 0.2s ease-in-out;
            box-sizing: border-box;
        }
        .portal-input:focus {
            border-color: #3182ce;
            outline: none;
            box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.25);
            background: #fffdf5; 
        }
        .input-disabled {
            background: #edf2f7 !important;
            color: #718096;
            cursor: not-allowed;
            border: 1px dashed #cbd5e0;
        }
        
        .section-title { 
            grid-column: span 2; 
            font-size: 14px; 
            font-weight: 700; 
            color: #1a365d; 
            background: #e2e8f0;
            padding: 8px 12px; 
            margin: 10px 0 5px 0; 
            border-radius: 4px;
            border-left: 4px solid #3182ce;
        }
        
        .action-btn { 
            grid-column: span 2; 
            padding: 12px; 
            background: #2b6cb0; 
            color: white; 
            border: none; 
            border-radius: 5px; 
            cursor: pointer; 
            font-weight: bold; 
            font-size: 15px;
            transition: background 0.2s;
            box-shadow: 0 3px 6px rgba(0,0,0,0.1);
        }
        .action-btn:hover { background: #2c5282; }
        
        .change-photo-btn { 
            background: #4a5568; 
            color: white; 
            border: none; 
            padding: 8px 15px; 
            border-radius: 4px; 
            cursor: pointer; 
            width: 100%; 
            font-weight: 600; 
            font-size: 13px;
        }
        .change-photo-btn:hover { background: #2d3748; }

        .search-btn {
            padding: 0 25px; 
            background: #3182ce; 
            color: #fff; 
            border: none; 
            border-radius: 5px; 
            cursor: pointer; 
            font-weight: 600;
        }
        .search-btn:hover { background: #2b6cb0; }
        
        @media (max-width: 850px) { 
            .main-layout { grid-template-columns: 1fr; } 
            .photo-section { order: -1; }
            .search-wrapper { flex-direction: column; }
            .form-fields { grid-template-columns: 1fr; }
            .section-title { grid-column: span 1; }
            .action-btn { grid-column: span 1; }
        }
    </style>

    <div class="profile-wrapper">
        <div class="p-header">💻 छात्र प्रोफ़ाइल प्रबंधन (Student Profile Management) </div>
        <div class="search-wrapper">
            <input id="studentId" class="portal-input" placeholder="Search by Student ID..." style="flex:1;">
            <select id="searchSession" class="portal-input" style="width: 150px;">
                <option value="2026-27">2026-27</option>
                <option value="2027-28">2027-28</option>
                <option value="2028-29">2028-29</option>
                <option value="2029-30">2029-30</option>
            </select>
            <button id="searchBtn" class="search-btn">🔍 Search</button>
        </div>
        <div id="formArea"></div>
    </div>`;

    contentArea.onclick = async (e) => {
        if (e.target.id === 'searchBtn') {
            const id = document.getElementById('studentId').value.trim();
            const session = document.getElementById('searchSession').value;
            const formArea = document.getElementById('formArea');
            
            if (!id) return alert("Please enter Student ID");
            
            formArea.innerHTML = "<p style='text-align:center;font-weight:bold; color:#1a365d;'>🔄 Fetching Profile Data...</p>";

            try {
                const res = await fetch(`${sheetUrls.Database}?action=searchById&studentId=${id}&session=${session}`);
                const data = await res.json();
                
                if (data.status !== "found") {
                    formArea.innerHTML = `<p style="color:red; text-align:center; font-weight:bold;">${data.message || "Record not found for this session."}</p>`;
                    return;
                }

                formArea.innerHTML = getProfileFormHTML(data);
                setupPhotoHandler();
            } catch (err) {
                formArea.innerHTML = `<p style="color:red; text-align:center; font-weight:bold;">Error connecting to portal server.</p>`;
            }
        }

        if (e.target.id === 'saveBtn') {
            const btn = e.target;
            btn.innerText = "⏳ Syncing with Portal...";
            btn.disabled = true;

            const payload = new URLSearchParams({
                action: "update",
                studentId: document.getElementById('uStudentId').value,
                session: document.getElementById('uSession').value,
                samgra: document.getElementById('uSamagra').value,
                studentName: document.getElementById('uName').value,
                father: document.getElementById('uFather').value,
                mother: document.getElementById('uMother').value,
                dob: document.getElementById('uDob').value,
                gender: document.getElementById('uGender').value,
                category: document.getElementById('uCast').value,
                class: document.getElementById('uClass').value,
                medium: document.getElementById('uMedium').value,
                enrolment: document.getElementById('uEnrol').value,
                studentType: document.getElementById('uStudentType').value,
                mobile1: document.getElementById('uMobile').value,
                address: document.getElementById('uAddress').value,
                subject: document.getElementById('uSubject')?.value || "",
                accountnumber: document.getElementById('uBank').value,
                ifsc: document.getElementById('uIfsc').value,
                photo: document.getElementById('profileImg').src
            });

            try {
                const res = await fetch(sheetUrls.Database, { method: "POST", body: payload });
                const result = await res.json();
                const msgBox = document.getElementById('msg');
                if(msgBox) {
                    msgBox.innerText = result.message;
                    msgBox.style.color = result.status === "success" ? "#2f855a" : "#c53030";
                }
            } catch (error) {
                alert("पोर्टल अपडेट करने में सर्वर एरर आई।");
            } finally {
                btn.innerText = "💾 Update Student Profile";
                btn.disabled = false;
            }
        }
    };

    window.toggleSub = () => {
        const c = document.getElementById('uClass').value;
        const sub = document.getElementById('subField');
        if(sub) sub.style.display = (c == 'XI' || c == 'XII') ? 'flex' : 'none';
      };
}



// --- Application Number से Student ID असाइन करने का इंटरफ़ेस ---
export async function renderIdAssignment() {
    const contentArea = document.getElementById('contentArea');
    const years = ["2026-27", "2027-28", "2028-29", "2029-30"];
    const generateOptions = (list) => list.map(item => `<option value="${item}">${item}</option>`).join('');

    contentArea.innerHTML = `
    <style>
        .portal-title { color: #1a365d; margin-bottom: 15px; font-weight: bold; font-size: 20px; }
        .search-box { padding: 20px; background: #fff; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); margin-bottom: 20px; display: flex; flex-wrap: wrap; gap: 15px; align-items: center; border: 1px solid #d2d6dc; }
        .details-wrapper { background: #ffffff; padding: 25px; border-radius: 8px; border: 1px solid #d2d6dc; box-shadow: 0 2px 8px rgba(0,0,0,0.05); display: none; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
        .info-item { font-size: 14px; color: #2d3748; padding: 8px; background: #f7fafc; border-radius: 4px; border: 1px solid #edf2f7; }
        .info-item strong { color: #1a365d; }
        .assign-section { background: #f0f4f8; padding: 15px; border-radius: 6px; border-left: 4px solid #3182ce; margin-top: 15px; display: flex; gap: 15px; align-items: center; }
        .portal-input { padding: 10px 12px; border: 1px solid #a0aec0; border-radius: 5px; font-size: 14px; background: #ffffff; box-sizing: border-box; }
        .btn-submit { padding: 10px 20px; background: #3182ce; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; }
        .btn-submit:hover { background: #2b6cb0; }
        .btn-update { background: #2f855a; }
        .btn-update:hover { background: #22543d; }
        #assignMsg { text-align: center; margin-top: 15px; font-weight: bold; font-size: 15px; }
    </style>

    <div class="portal-title">🆔 छात्र ID आवंटन (Student ID Assignment)</div>
    <div class="search-box">
        <label><strong>Application No:</strong></label>
        <input type="text" id="searchAppNo" class="portal-input" placeholder="Enter App No..." style="width: 200px;">
        
        <label><strong>Session:</strong></label>
        <select id="searchAppSession" class="portal-input" style="width: 150px;">
            ${generateOptions(years)}
        </select>
        <button id="searchAppBtn" class="btn-submit">🔍 Search Student</button>
    </div>
    
    <div id="studentDetailsWrapper" class="details-wrapper"></div>
    <div id="assignMsg"></div>`;

    // इवेंट लिस्नर अटैच करना (Overwrite से सुरक्षित)
    contentArea.addEventListener('click', async (e) => {
        // 1. Search Button Action
        if (e.target.id === 'searchAppBtn') {
            const appNo = document.getElementById('searchAppNo').value.trim();
            const session = document.getElementById('searchAppSession').value;
            const wrapper = document.getElementById('studentDetailsWrapper');
            const msgBox = document.getElementById('assignMsg');

            if (!appNo) return alert("कृपया Application Number दर्ज करें!");
            
            msgBox.innerText = "";
            wrapper.style.display = "none";
            wrapper.innerHTML = "<p style='text-align:center; font-weight:bold; color:#1a365d;'>🔄 Searching Record...</p>";
            wrapper.style.display = "block";

            try {
                // आपके Google Apps Script API पर App No से सर्च करने का अनुरोध
                const res = await fetch(`${sheetUrls.Database}?action=searchByAppNo&appNo=${encodeURIComponent(appNo)}&session=${session}`);
                const data = await res.json();

                if (data.status !== "found") {
                    wrapper.innerHTML = `<p style="color:red; text-align:center; font-weight:bold;">❌ ${data.message || "यह Application Number रिकॉर्ड में नहीं मिला।"}</p>`;
                    return;
                }

                // छात्र की पूरी जानकारी दिखाना
                wrapper.innerHTML = `
                    <h3 style="color:#1a365d; margin-top:0; border-bottom:2px solid #e2e8f0; padding-bottom:8px;">📋 Student Information</h3>
                    <div class="info-grid">
                        <div class="info-item"><strong>App No:</strong> ${data.appNo || data.appno || appNo}</div>
                        <div class="info-item"><strong>Current Student ID:</strong> ${data.studentid || data.studentId || '<span style="color:orange;">Not Assigned</span>'}</div>
                        <div class="info-item"><strong>Student Name:</strong> ${data.studentName|| data.studentName || '-'}</div>
                        <div class="info-item"><strong>Father Name:</strong> ${data.fatherName || data.fatherName || '-'}</div>
                        <div class="info-item"><strong>Mother Name:</strong> ${data.motherName || data.motherName || '-'}</div>
                        <div class="info-item"><strong>Class:</strong> ${data.class || data.className || '-'}</div>
                        <div class="info-item"><strong>Medium:</strong> ${data.medium || '-'}</div>
                        <div class="info-item"><strong>Samagra ID:</strong> ${data.samgra || data.samagra || '-'}</div>
                    </div>
                    
                    <div class="assign-section">
                        <label><strong>Enter New Student ID:</strong></label>
                        <input type="text" id="newStudentId" class="portal-input" placeholder="e.g. SCH2026001" value="${data.studentid || data.studentId || ''}" style="width: 250px;">
                        
                        <input type="hidden" id="hiddenAppNo" value="${data.appNo || data.appno || appNo}">
                        <input type="hidden" id="hiddenSession" value="${data.session || session}">
                        
                        <button id="updateIdBtn" class="btn-submit btn-update">💾 Update Student ID</button>
                    </div>`;
            } catch (err) {
                console.error(err);
                wrapper.innerHTML = `<p style="color:red; text-align:center; font-weight:bold;">❌ सर्वर से कनेक्ट करने में त्रुटि आई।</p>`;
            }
        }

        // 2. Update Button Action
        if (e.target.id === 'updateIdBtn') {
            const btn = e.target;
            const newId = document.getElementById('newStudentId').value.trim();
            const appNo = document.getElementById('hiddenAppNo').value;
            const session = document.getElementById('hiddenSession').value;
            const msgBox = document.getElementById('assignMsg');

            if (!newId) return alert("कृपया Student ID दर्ज करें!");

            btn.innerText = "⏳ Updating...";
            btn.disabled = true;
            msgBox.innerText = "";

            const payload = new URLSearchParams({
                action: "updateStudentId",
                appNo: appNo,
                session: session,
                newId: newId
            });

            try {
                const res = await fetch(sheetUrls.Database, { method: "POST", body: payload });
                const result = await res.json();

                if (result.status === "success") {
                    msgBox.style.color = "#2f855a";
                    msgBox.innerText = "🎉 Student ID successfully updated!";
                    
                    // 3 सेकंड बाद रिकॉर्ड को रीलोड करें ताकि अपडेटेड ID दिखने लगे
                    setTimeout(() => {
                        const searchBtn = document.getElementById('searchAppBtn');
                        if (searchBtn) searchBtn.click();
                    }, 1500);
                } else {
                    msgBox.style.color = "#c53030";
                    msgBox.innerText = "❌ Error: " + result.message;
                }
            } catch (error) {
                alert("आईडी अपडेट करने में सर्वर त्रुटि आई।");
            } finally {
                btn.innerText = "💾 Update Student ID";
                btn.disabled = false;
            }
        }
    });
}

export async function renderAadharUpdate() {
    const contentArea = document.getElementById('contentArea');

    contentArea.innerHTML = `
    <style>
        /* Shiksha Portal 3.0 Portal Style */
        .portal-wrapper { font-family: 'Segoe UI', system-ui, sans-serif; background-color: #f4f6f9; padding: 10px; border-radius: 12px; }
        .portal-title { color: #0d3558; font-size: 22px; font-weight: 700; margin-bottom: 20px; border-bottom: 3px solid #1a73e8; padding-bottom: 8px; }
        
        /* Search Box Design */
        .search-card { padding: 24px; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 16px rgba(0,0,0,0.05); margin-bottom: 25px; border: 1px solid #e2e8f0; }
        .search-group { display: flex; gap: 15px; align-items: flex-end; max-width: 500px; }
        .input-field { display: flex; flex-direction: column; gap: 6px; flex-grow: 1; }
        .input-field label { color: #4a5568; font-size: 14px; font-weight: 600; }
        .input-field input { padding: 10px 14px; border: 1.5px solid #cbd5e1; border-radius: 6px; font-size: 14px; outline: none; transition: all 0.2s ease; }
        .input-field input:focus { border-color: #1a73e8; box-shadow: 0 0 0 3px rgba(26,115,232,0.15); }
        
        /* Buttons */
        .btn-portal { padding: 11px 24px; font-size: 14px; font-weight: 600; border: none; border-radius: 6px; cursor: pointer; transition: all 0.2s ease; text-transform: uppercase; }
        .btn-search { background: #1a73e8; color: white; height: 42px; }
        .btn-search:hover { background: #1557b0; }
        .btn-update { background: #10b981; color: white; margin-top: 15px; width: 100%; }
        .btn-update:hover { background: #059669; }
        
        /* Result Update Form Card */
        .update-card { padding: 24px; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 16px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; max-width: 500px; margin-top: 20px; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e2e8f0; font-size: 14px; color: #334155; }
        .info-label { font-weight: 600; color: #4a5568; }
    </style>

    <div class="portal-wrapper">
        <div class="portal-title">🆔 आधार कार्ड नंबर अपडेशन मॉड्यूल</div>
        
        <div class="search-card">
            <div class="search-group">
                <div class="input-field">
                    <label>Student ID दर्ज करें:</label>
                    <input type="text" id="searchStudentId" placeholder="उदा. STU1001" autocomplete="off">
                </div>
                <button id="searchAadharBtn" class="btn-portal btn-search">खोजें (Search)</button>
            </div>
        </div>
        
        <div id="updateArea"></div>
    </div>`;

    // बटन क्लिक इवेंट्स को संभालना
    contentArea.onclick = async (e) => {
        // 1. सर्च एक्शन
        if (e.target.id === 'searchAadharBtn') {
            const studentId = document.getElementById('searchStudentId').value.trim();
            if (!studentId) return alert("कृपया Student ID दर्ज करें!");

            const updateArea = document.getElementById('updateArea');
            updateArea.innerHTML = '<div style="color: #64748b; font-weight: 500;">🔄 डेटा खोजा जा रहा है...</div>';

            try {
                // ऐप्स स्क्रिप्ट से छात्र का विवरण मंगाना
                const response = await fetch(`${sheetUrls.Database}?action=getStudentForAadhar&studentId=${encodeURIComponent(studentId)}`);
                const result = await response.json();

                if (result.status === "error") {
                    updateArea.innerHTML = `<div style="color: #ef4444; font-weight: 500; padding: 10px; background: #fef2f2; border-radius: 6px; border: 1px solid #fecaca; max-width: 500px;">⚠️ ${result.message}</div>`;
                    return;
                }

                // मिलने पर अपडेट फॉर्म दिखाना
                const student = result.data;
                updateArea.innerHTML = `
                    <div class="update-card">
                        <h4 style="margin-top:0; color: #0d3558; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">छात्र का विवरण</h4>
                        <div class="info-row"><span class="info-label">नाम:</span> <span>${student.name}</span></div>
                        <div class="info-row"><span class="info-label">पिता का नाम:</span> <span>${student.father}</span></div>
                        <div class="info-row"><span class="info-label">कक्षा / सत्र:</span> <span>${student.class} (${student.session})</span></div>
                        
                        <div class="input-field" style="margin-top: 20px;">
                            <label>Aadhar Number (12 अंक):</label>
                            <input type="text" id="newAadharInput" value="${student.aadhar || ''}" maxlength="12" placeholder="Enter Adhar Number" oninput="this.value = this.value.replace(/[^0-9]/g, '')">
                        </div>
                        
                        <input type="hidden" id="hiddenStudentId" value="${student.studentid}">
                        <input type="hidden" id="hiddenSession" value="${student.session}">
                        
                        <button id="submitAadharBtn" class="btn-portal btn-update">आधार नंबर अपडेट करें</button>
                    </div>
                `;
            } catch (err) {
                console.error(err);
                updateArea.innerHTML = '<div style="color: #dc2626;">❌ सर्च करने में कोई तकनीकी त्रुटि आई।</div>';
            }
        }

        // 2. अपडेट सबमिट एक्शन
        if (e.target.id === 'submitAadharBtn') {
            const studentId = document.getElementById('hiddenStudentId').value;
            const session = document.getElementById('hiddenSession').value;
            const aadharNo = document.getElementById('newAadharInput').value.trim();

            if (aadharNo.length > 0 && aadharNo.length !== 12) {
                return alert("आधार नंबर ठीक 12 अंकों का होना चाहिए!");
            }

            e.target.innerText = "UPDATING...";
            e.target.disabled = true;

            try {
                const res = await fetch(sheetUrls.Database, {
                    method: "POST",
                    body: JSON.stringify({
                        action: "updateAadhar",
                        studentId: studentId,
                        session: session,
                        aadhar: aadharNo
                    })
                });
                const result = await res.json();

                if (result.status === "success") {
                    alert("✅ आधार नंबर सफलतापूर्वक अपडेट कर दिया गया है!");
                    document.getElementById('updateArea').innerHTML = '';
                    document.getElementById('searchStudentId').value = '';
                } else {
                    alert("❌ त्रुटि: " + result.message);
                    e.target.innerText = "आधार नंबर अपडेट करें";
                    e.target.disabled = false;
                }
            } catch (err) {
                console.error(err);
                alert("अपडेट के दौरान सर्वर से संपर्क नहीं हो पाया।");
                e.target.innerText = "आधार नंबर अपडेट करें";
                e.target.disabled = false;
            }
        }
    };
}

export async function renderSamagraUpdate() {
    const contentArea = document.getElementById('contentArea');

    contentArea.innerHTML = `
    <style>
        /* Shiksha Portal 3.0 Portal Style */
        .portal-wrapper { font-family: 'Segoe UI', system-ui, sans-serif; background-color: #f4f6f9; padding: 10px; border-radius: 12px; }
        .portal-title { color: #0d3558; font-size: 22px; font-weight: 700; margin-bottom: 20px; border-bottom: 3px solid #1a73e8; padding-bottom: 8px; }
        
        /* Search Box Design */
        .search-card { padding: 24px; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 16px rgba(0,0,0,0.05); margin-bottom: 25px; border: 1px solid #e2e8f0; }
        .search-group { display: flex; gap: 15px; align-items: flex-end; max-width: 500px; }
        .input-field { display: flex; flex-direction: column; gap: 6px; flex-grow: 1; }
        .input-field label { color: #4a5568; font-size: 14px; font-weight: 600; }
        .input-field input { padding: 10px 14px; border: 1.5px solid #cbd5e1; border-radius: 6px; font-size: 14px; outline: none; transition: all 0.2s ease; }
        .input-field input:focus { border-color: #1a73e8; box-shadow: 0 0 0 3px rgba(26,115,232,0.15); }
        
        /* Buttons */
        .btn-portal { padding: 11px 24px; font-size: 14px; font-weight: 600; border: none; border-radius: 6px; cursor: pointer; transition: all 0.2s ease; text-transform: uppercase; }
        .btn-search { background: #1a73e8; color: white; height: 42px; }
        .btn-search:hover { background: #1557b0; }
        .btn-search:disabled { background: #cbd5e1; cursor: not-allowed; }
        .btn-update { background: #eab308; color: #000000; margin-top: 15px; width: 100%; font-weight: 700; }
        .btn-update:hover { background: #ca8a04; }
        .btn-update:disabled { background: #cbd5e1; cursor: not-allowed; }
        
        /* Result Update Form Card */
        .update-card { padding: 24px; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 16px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; max-width: 500px; margin-top: 20px; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e2e8f0; font-size: 14px; color: #334155; }
        .info-label { font-weight: 600; color: #4a5568; }
    </style>

    <div class="portal-wrapper">
        <div class="portal-title">🆔 समग्र आईडी (Samagra ID) अपडेशन मॉड्यूल</div>
        
        <div class="search-card">
            <div class="search-group">
                <div class="input-field">
                    <label>Student ID दर्ज करें:</label>
                    <input type="text" id="searchStudentId" placeholder="उदा. STU1001" autocomplete="off">
                </div>
                <button id="searchSamagraBtn" class="btn-portal btn-search">खोजें (Search)</button>
            </div>
        </div>
        
        <div id="updateArea"></div>
    </div>`;

    // बटन क्लिक इवेंट्स को संभालना
    contentArea.onclick = async (e) => {
        
        // 1. सर्च एक्शन (छात्र का डेटा खोजने के लिए)
        if (e.target.id === 'searchSamagraBtn') {
            const searchBtn = e.target;
            const studentId = document.getElementById('searchStudentId').value.trim();
            if (!studentId) return alert("कृपया Student ID दर्ज करें!");

            const updateArea = document.getElementById('updateArea');
            updateArea.innerHTML = '<div style="color: #64748b; font-weight: 500;">🔄 डेटा खोजा जा रहा है...</div>';
            
            searchBtn.disabled = true;
            searchBtn.innerText = "खोज रहे हैं...";

            try {
                // ऐप्स स्क्रिप्ट / API से छात्र का विवरण मंगाना
                const response = await fetch(`${sheetUrls.Database}?action=getStudentForSamagra&studentId=${encodeURIComponent(studentId)}`);
                const result = await response.json();

                if (result.status === "error") {
                    updateArea.innerHTML = `<div style="color: #ef4444; font-weight: 500; padding: 10px; background: #fef2f2; border-radius: 6px; border: 1px solid #fecaca; max-width: 500px;">⚠️ ${result.message}</div>`;
                    return;
                }

                const student = result.data;
                updateArea.innerHTML = `
                    <div class="update-card">
                        <h4 style="margin-top:0; color: #0d3558; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">छात्र का विवरण</h4>
                        <div class="info-row"><span class="info-label">नाम:</span> <span>${student.name}</span></div>
                        <div class="info-row"><span class="info-label">पिता का नाम:</span> <span>${student.father}</span></div>
                        <div class="info-row"><span class="info-label">कक्षा / सत्र:</span> <span>${student.class} (${student.session})</span></div>
                        
                        <div class="input-field" style="margin-top: 20px;">
                            <label>Samagra Member ID (9 अंक):</label>
                            <input type="text" id="newSamagraInput" value="${student.samagra || ''}" maxlength="9" placeholder="Enter Samgra ID" oninput="this.value = this.value.replace(/[^0-9]/g, '')">
                        </div>
                        
                        <input type="hidden" id="hiddenStudentId" value="${student.studentid}">
                        <input type="hidden" id="hiddenSession" value="${student.session}">
                        
                        <button id="submitSamagraBtn" class="btn-portal btn-update">समग्र आईडी अपडेट करें</button>
                    </div>
                `;
            } catch (err) {
                console.error(err);
                updateArea.innerHTML = '<div style="color: #dc2626;">❌ सर्च करने में कोई तकनीकी त्रुटि आई।</div>';
            } finally {
                searchBtn.disabled = false;
                searchBtn.innerText = "खोजें (Search)";
            }
        }

        // 2. अपडेट सबमिट एक्शन (नयी समग्र आईडी सेव करने के लिए)
        if (e.target.id === 'submitSamagraBtn') {
            const submitBtn = e.target;
            const studentId = document.getElementById('hiddenStudentId').value;
            const session = document.getElementById('hiddenSession').value;
            const samagraNo = document.getElementById('newSamagraInput').value.trim();

            // वैलिडेशन चेक्स
            if (!samagraNo) {
                return alert("कृपया समग्र आईडी दर्ज करें!");
            }

            if (samagraNo.length !== 9) {
                return alert("सदस्य समग्र आईडी ठीक 9 अंकों की होनी चाहिए!");
            }

            // डमी नंबर चेक (उदा. 000000000)
            if (/^(\d)\1{8}$/.test(samagraNo)) {
                return alert("कृपया एक वैध समग्र आईडी दर्ज करें!");
            }

            submitBtn.innerText = "UPDATING...";
            submitBtn.disabled = true;

            try {
                const res = await fetch(sheetUrls.Database, {
                    method: "POST",
                    headers: {
                        "Content-Type": "text/plain;charset=utf-8"
                    },
                    body: JSON.stringify({
                        action: "updateSamagra", // बैकएंड में इस एक्शन को हैंडल करना होगा
                        studentId: studentId,
                        session: session,
                        samagra: samagraNo
                    })
                });
                const result = await res.json();

                if (result.status === "success") {
                    alert("✅ समग्र आईडी सफलतापूर्वक अपडेट कर दी गई है!");
                    document.getElementById('updateArea').innerHTML = '';
                    document.getElementById('searchStudentId').value = '';
                } else {
                    alert("❌ त्रुटि: " + result.message);
                    submitBtn.innerText = "समग्र आईडी अपडेट करें";
                    submitBtn.disabled = false;
                }
            } catch (err) {
                console.error(err);
                alert("अपडेट के दौरान सर्वर से संपर्क नहीं हो पाया।");
                submitBtn.innerText = "समग्र आईडी अपडेट करें";
                submitBtn.disabled = false;
            }
        }
    };
} 

export async function renderBankUpdate() {
    const contentArea = document.getElementById('contentArea');

    contentArea.innerHTML = `
    <style>
        /* Shiksha Portal 3.0 Portal Style */
        .portal-wrapper { font-family: 'Segoe UI', system-ui, sans-serif; background-color: #f4f6f9; padding: 10px; border-radius: 12px; }
        .portal-title { color: #0d3558; font-size: 22px; font-weight: 700; margin-bottom: 20px; border-bottom: 3px solid #1a73e8; padding-bottom: 8px; }
        
        /* Search Box Design */
        .search-card { padding: 24px; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 16px rgba(0,0,0,0.05); margin-bottom: 25px; border: 1px solid #e2e8f0; }
        .search-group { display: flex; gap: 15px; align-items: flex-end; max-width: 500px; }
        .input-field { display: flex; flex-direction: column; gap: 6px; flex-grow: 1; }
        .input-field label { color: #4a5568; font-size: 14px; font-weight: 600; }
        .input-field input { padding: 10px 14px; border: 1.5px solid #cbd5e1; border-radius: 6px; font-size: 14px; outline: none; transition: all 0.2s ease; }
        .input-field input:focus { border-color: #1a73e8; box-shadow: 0 0 0 3px rgba(26,115,232,0.15); }
        
        /* Buttons */
        .btn-portal { padding: 11px 24px; font-size: 14px; font-weight: 600; border: none; border-radius: 6px; cursor: pointer; transition: all 0.2s ease; text-transform: uppercase; }
        .btn-search { background: #1a73e8; color: white; height: 42px; }
        .btn-search:hover { background: #1557b0; }
        .btn-search:disabled { background: #cbd5e1; cursor: not-allowed; }
        .btn-update { background: #1a73e8; color: white; margin-top: 15px; width: 100%; }
        .btn-update:hover { background: #1557b0; }
        .btn-update:disabled { background: #cbd5e1; cursor: not-allowed; }
        
        /* Result Update Form Card */
        .update-card { padding: 24px; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 16px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; max-width: 500px; margin-top: 20px; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e2e8f0; font-size: 14px; color: #334155; }
        .info-label { font-weight: 600; color: #4a5568; }
        .row-flex { display: flex; gap: 15px; margin-top: 15px; }
    </style>

    <div class="portal-wrapper">
        <div class="portal-title">🏦 बैंक खाता एवं IFSC कोड अपडेशन मॉड्यूल</div>
        
        <div class="search-card">
            <div class="search-group">
                <div class="input-field">
                    <label>Student ID दर्ज करें:</label>
                    <input type="text" id="searchStudentId" placeholder="उदा. STU1001" autocomplete="off">
                </div>
                <button id="searchBankBtn" class="btn-portal btn-search">खोजें (Search)</button>
            </div>
        </div>
        
        <div id="updateArea"></div>
    </div>`;

    // बटन क्लिक इवेंट्स हैंडलर
    contentArea.onclick = async (e) => {
        
        // 1. सर्च एक्शन
        if (e.target.id === 'searchBankBtn') {
            const searchBtn = e.target;
            const studentId = document.getElementById('searchStudentId').value.trim();
            if (!studentId) return alert("कृपया Student ID दर्ज करें!");

            const updateArea = document.getElementById('updateArea');
            updateArea.innerHTML = '<div style="color: #64748b; font-weight: 500;">🔄 बैंक विवरण खोजा जा रहा है...</div>';
            
            searchBtn.disabled = true;
            searchBtn.innerText = "खोज रहे हैं...";

            try {
                const response = await fetch(`${sheetUrls.Database}?action=getStudentForBank&studentId=${encodeURIComponent(studentId)}`);
                const result = await response.json();

                if (result.status === "error") {
                    updateArea.innerHTML = `<div style="color: #ef4444; font-weight: 500; padding: 10px; background: #fef2f2; border-radius: 6px; border: 1px solid #fecaca; max-width: 500px;">⚠️ ${result.message}</div>`;
                    return;
                }

                const student = result.data;
                updateArea.innerHTML = `
                    <div class="update-card">
                        <h4 style="margin-top:0; color: #0d3558; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">छात्र का विवरण</h4>
                        <div class="info-row"><span class="info-label">नाम:</span> <span>${student.name}</span></div>
                        <div class="info-row"><span class="info-label">पिता का नाम:</span> <span>${student.father}</span></div>
                        <div class="info-row"><span class="info-label">कक्षा / सत्र:</span> <span>${student.class} (${student.session})</span></div>
                        
                        <div class="input-field" style="margin-top: 15px;">
                            <label>बेंक का नाम (Bank Name):</label>
                            <input type="text" id="newBankName" value="${student.bank || ''}" placeholder="State Bank of India">
                        </div>

                        <div class="row-flex">
                            <div class="input-field">
                                <label>खाता नंबर (Account No):</label>
                                <input type="text" id="newAccountInput" value="${student.accountnumber || ''}" placeholder="1234567890" oninput="this.value = this.value.replace(/[^0-9]/g, '')">
                            </div>
                            <div class="input-field">
                                <label>IFSC कोड (11 अंक):</label>
                                <input type="text" id="newIfscInput" value="${student.ifsc || ''}" placeholder="SBIN0001234" maxlength="11" style="text-transform: uppercase;">
                            </div>
                        </div>
                        
                        <input type="hidden" id="hiddenStudentId" value="${student.studentid}">
                        <input type="hidden" id="hiddenSession" value="${student.session}">
                        
                        <button id="submitBankBtn" class="btn-portal btn-update">बैंक विवरण अपडेट करें</button>
                    </div>
                `;
            } catch (err) {
                console.error(err);
                updateArea.innerHTML = '<div style="color: #dc2626;">❌ सर्च करने में कोई तकनीकी त्रुटि आई।</div>';
            } finally {
                searchBtn.disabled = false;
                searchBtn.innerText = "खोजें (Search)";
            }
        }

        // 2. अपडेट सबमिट एक्शन
        if (e.target.id === 'submitBankBtn') {
            const submitBtn = e.target;
            const studentId = document.getElementById('hiddenStudentId').value;
            const session = document.getElementById('hiddenSession').value;
            const bankName = document.getElementById('newBankName').value.trim();
            const accountNo = document.getElementById('newAccountInput').value.trim();
            const ifscCode = document.getElementById('newIfscInput').value.trim().toUpperCase();

            // वैलिडेशन चेक्स
            if (!accountNo || !ifscCode) {
                return alert("कृपया खाता नंबर और IFSC कोड दोनों दर्ज करें!");
            }

            if (ifscCode.length !== 11) {
                return alert("IFSC कोड ठीक 11 अंकों का होना चाहिए! (उदा. SBIN0001234)");
            }

            submitBtn.innerText = "UPDATING...";
            submitBtn.disabled = true;

            try {
                const res = await fetch(sheetUrls.Database, {
                    method: "POST",
                    headers: { "Content-Type": "text/plain;charset=utf-8" },
                    body: JSON.stringify({
                        action: "updateBankDetails",
                        studentId: studentId,
                        session: session,
                        bank: bankName,
                        accountnumber: accountNo,
                        ifsc: ifscCode
                    })
                });
                const result = await res.json();

                if (result.status === "success") {
                    alert("✅ बैंक खाता और IFSC कोड सफलतापूर्वक अपडेट कर दिया गया है!");
                    document.getElementById('updateArea').innerHTML = '';
                    document.getElementById('searchStudentId').value = '';
                } else {
                    alert("❌ त्रुटि: " + result.message);
                    submitBtn.innerText = "बैंक विवरण अपडेट करें";
                    submitBtn.disabled = false;
                }
            } catch (err) {
                console.error(err);
                alert("अपडेट के दौरान सर्वर से संपर्क नहीं हो पाया।");
                submitBtn.innerText = "बैंक विवरण अपडेट करें";
                submitBtn.disabled = false;
            }
        }
    };
}

export function renderPhotoUpload() {
    const contentArea = document.getElementById('contentArea');

    contentArea.innerHTML = `
    <style>
        .portal-wrapper { font-family: 'Segoe UI', system-ui, sans-serif; background-color: #f4f6f9; padding: 10px; border-radius: 12px; }
        .portal-title { color: #0d3558; font-size: 22px; font-weight: 700; margin-bottom: 20px; border-bottom: 3px solid #1a73e8; padding-bottom: 8px; }
        
        .upload-card { padding: 24px; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 16px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; max-width: 450px; }
        .input-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 15px; }
        .input-field label { color: #4a5568; font-size: 14px; font-weight: 600; }
        .input-field input[type="text"] { padding: 10px 14px; border: 1.5px solid #cbd5e1; border-radius: 6px; font-size: 14px; outline: none; text-transform: uppercase; }
        .input-field input[type="file"] { padding: 8px 0; font-size: 14px; }
        
        /* Image Preview Style */
        .preview-box { width: 120px; height: 150px; border: 2px dashed #cbd5e1; margin-top: 10px; display: flex; align-items: center; justify-content: center; border-radius: 6px; overflow: hidden; background: #f8fafc; }
        .preview-box img { width: 100%; height: 100%; object-fit: cover; }
        .preview-text { color: #94a3b8; font-size: 12px; text-align: center; padding: 5px; }

        .btn-upload { background: #1a73e8; color: white; padding: 11px 24px; font-size: 14px; font-weight: 600; border: none; border-radius: 6px; cursor: pointer; width: 100%; margin-top: 15px; text-transform: uppercase; }
        .btn-upload:hover { background: #1557b0; }
        .btn-upload:disabled { background: #cbd5e1; cursor: not-allowed; }
    </style>

    <div class="portal-wrapper">
        <div class="portal-title">📸 छात्र फोटो अपडेशन मॉड्यूल</div>
        
        <div class="upload-card">
            <div class="input-field">
                <label>Student ID दर्ज करें:</label>
                <input type="text" id="photoStudentId" placeholder="उदा. STU1001" autocomplete="off">
            </div>
            
            <div class="input-field">
                <label>छात्र की फोटो चुनें (JPG/PNG):</label>
                <input type="file" id="photoFileArr" accept="image/*">
                
                <!-- फोटो का प्रीव्यू देखने के लिए बॉक्स -->
                <div class="preview-box" id="photoPreviewBox">
                    <span class="preview-text" id="previewTxt">कोई फोटो नहीं चुनी गई</span>
                </div>
            </div>
            
            <button id="submitPhotoBtn" class="btn-upload">फोटो अपलोड करें</button>
        </div>
    </div>`;

    const fileInput = document.getElementById('photoFileArr');
    const previewBox = document.getElementById('photoPreviewBox');
    const previewTxt = document.getElementById('previewTxt');

    // फोटो सेलेक्ट करते ही स्क्रीन पर उसका प्रीव्यू (Preview) दिखाना
    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                previewBox.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        } else {
            previewBox.innerHTML = `<span class="preview-text">कोई फोटो नहीं चुनी गई</span>`;
        }
    };

    // अपलोड बटन क्लिक इवेंट हैंडलर
    contentArea.onclick = async (e) => {
        if (e.target.id === 'submitPhotoBtn') {
            const submitBtn = e.target;
            const studentId = document.getElementById('photoStudentId').value.trim().toUpperCase();
            const file = fileInput.files[0];

            if (!studentId) return alert("कृपया Student ID दर्ज करें!");
            if (!file) return alert("कृपया अपलोड करने के लिए एक फोटो चुनें!");

            submitBtn.innerText = "UPLOADING...";
            submitBtn.disabled = true;

            // FileReader की मदद से इमेज को Base64 स्ट्रिंग में बदलना
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64Data = reader.result;
                const mimeType = file.type;

                try {
                    const res = await fetch(sheetUrls.Database, {
                        method: "POST",
                        headers: { "Content-Type": "text/plain;charset=utf-8" },
                        body: JSON.stringify({
                            action: "uploadStudentPhoto",
                            studentId: studentId,
                            photoData: base64Data,
                            mimeType: mimeType
                        })
                    });
                    const result = await res.json();

                    if (result.status === "success") {
                        alert("✅ " + result.message);
                        // फॉर्म रीसेट करें
                        document.getElementById('photoStudentId').value = '';
                        fileInput.value = '';
                        previewBox.innerHTML = `<span class="preview-text">कोई फोटो नहीं चुनी गई</span>`;
                    } else {
                        alert("❌ त्रुटi: " + result.message);
                    }
                } catch (err) {
                    console.error(err);
                    alert("फोटो अपलोड करने में तकनीकी समस्या आई।");
                } finally {
                    submitBtn.innerText = "फोटो अपलोड करें";
                    submitBtn.disabled = false;
                }
            };
        }
    };
}

export function renderNewAdmissionList() {
    const contentArea = document.getElementById('contentArea');

    // कक्षा की लिस्ट
    const classOptions = ["Nursary", "KG1", "KG2", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    const generateOptions = (list) => list.map(item => `<option value="${item}">${item}</option>`).join('');

    contentArea.innerHTML = `
    <style>
        .portal-wrapper { font-family: 'Segoe UI', sans-serif; background: #f8fafc; padding: 20px; border-radius: 12px; }
        .portal-title { color: #0d3558; font-size: 22px; font-weight: 700; margin-bottom: 20px; border-bottom: 3px solid #1a73e8; padding-bottom: 8px; }
        
        /* Shiksha Portal 3.0 Card Style */
        .search-card { background: #fff; padding: 25px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; align-items: flex-end; }
        .input-field { display: flex; flex-direction: column; gap: 8px; }
        .input-field label { font-weight: 600; color: #475569; font-size: 14px; }
        .portal-select { padding: 10px; border: 1.5px solid #cbd5e1; border-radius: 6px; font-size: 14px; outline: none; cursor: pointer; }
        .portal-select:focus { border-color: #1a73e8; }
        
        .btn-search { padding: 10px; background: #1a73e8; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; transition: 0.2s; }
        .btn-search:hover { background: #1557b0; }
        
        /* Table Design */
        .student-table { width: 100%; border-collapse: collapse; margin-top: 20px; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .student-table th { background: #0d3558; color: white; padding: 12px; text-align: left; }
        .student-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; }

        /* Print Style */
        @media print {
            .search-card, .btn-search, .portal-title, .btn-print { display: none !important; }
            .student-table { width: 100%; border: 1px solid #000; }
            .student-table th, .student-table td { border: 1px solid #000; padding: 8px; }
        }
    </style>

    <div class="portal-wrapper">
        <div class="portal-title">🎓 छात्र प्रवेश सूची (New Admission Portal)</div>
        
        <div class="search-card">
            <div class="input-field">
                <label>शैक्षणिक सत्र:</label>
                <select id="searchYear" class="portal-select">
                    <option value="2026-27">2026-27</option>
                    <option value="2027-28">2027-28</option>
                </select>
            </div>
            <div class="input-field">
                <label>कक्षा:</label>
                <select id="searchClass" class="portal-select">
                    ${generateOptions(classOptions)}
                </select>
            </div>
            <div class="input-field">
                <label>माध्यम (Medium):</label>
                <select id="searchMedium" class="portal-select">
                    <option value="Hindi">Hindi</option>
                    <option value="English">English</option>
                </select>
            </div>
            <div class="input-field">
                <label>प्रवेश प्रकार:</label>
                <select id="searchType" class="portal-select">
                    <option value="New">New</option>
                    <option value="Old">Old</option>
                </select>
            </div>
            <button id="searchBtn" class="btn-search">डेटा खोजें</button>
        </div>

        <div id="resultsContainer"></div>
    </div>`;

    document.getElementById('searchBtn').onclick = async () => {
        const filters = {
            year: document.getElementById('searchYear').value,
            class: document.getElementById('searchClass').value,
            medium: document.getElementById('searchMedium').value,
            type: document.getElementById('searchType').value
        };

        const container = document.getElementById('resultsContainer');
        container.innerHTML = `<div style="padding: 20px;">🔄 डेटा लोड हो रहा है...</div>`;

        try {
            const queryString = new URLSearchParams(filters).toString();
            const res = await fetch(`${sheetUrls.Database}?action=searchStudents&${queryString}`);
            const students = await res.json();

            if (students && students.length > 0) {
                let tableHtml = `
                <div style="margin-top: 20px; text-align: right;">
                    <button class="btn-print" onclick="window.print()" style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        🖨️ प्रिंट करें
                    </button>
                </div>
                <table class="student-table">
                    <thead>
                        <tr>
                            <th>ID</th><th>नाम</th><th>पिता</th><th>कक्षा</th><th>माध्यम</th><th>सत्र</th>
                        </tr>
                    </thead>
                    <tbody>`;
                
                students.forEach(s => {
                    tableHtml += `<tr>
                        <td>${s.studentid}</td>
                        <td>${s.name}</td>
                        <td>${s.father}</td>
                        <td>${s.class}</td>
                        <td>${s.medium || '-'}</td>
                        <td>${s.session || '-'}</td>
                    </tr>`;
                });
                
                tableHtml += `</tbody></table>`;
                container.innerHTML = tableHtml;
            } else {
                container.innerHTML = `<div style="padding: 20px; color: red;">⚠️ कोई परिणाम नहीं मिला।</div>`;
            }
        } catch (err) {
            container.innerHTML = `<div style="padding: 20px; color: red;">❌ एरर: सर्वर से कनेक्ट नहीं हो पा रहा है।</div>`;
        }
    };
}

function printStudentList() {
    const tableContent = document.getElementById("resultsContainer").innerHTML;

    if (!tableContent.trim()) {
        alert("प्रिंट करने के लिए कोई डेटा उपलब्ध नहीं है।");
        return;
    }

    const printWindow = window.open("", "_blank", "width=1000,height=700");

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Student List</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                }

                h2 {
                    text-align: center;
                    margin-bottom: 20px;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                }

                th, td {
                    border: 1px solid #000;
                    padding: 8px;
                    text-align: center;
                }

                th {
                    background: #0d3558;
                    color: #fff;
                }

                .btn-print {
                    display: none !important;
                }
            </style>
        </head>
        <body>
            <h2>छात्र प्रवेश सूची</h2>
            ${tableContent}
        </body>
        </html>
    `);

    printWindow.document.close();

    printWindow.onload = function () {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };
}

export function showClassWiseStudentList() {
    const contentArea = document.getElementById('contentArea');
    
    // सभी कक्षाएं और 2030 तक के सत्र
    const classOptions = ["Nursary", "KG1", "KG2", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    const sessionOptions = ["2026-27", "2027-28", "2028-29", "2029-30", "2030-31"];
    
    const generateOptions = (list) => list.map(item => `<option value="${item}">${item}</option>`).join('');

    contentArea.innerHTML = `
    <style>
        .portal-wrapper { font-family: 'Segoe UI', sans-serif; padding: 20px; background: #f8fafc; }
        .portal-title { color: #0d3558; font-size: 20px; font-weight: bold; margin-bottom: 20px; border-bottom: 3px solid #1a73e8; padding-bottom: 10px; }
        .search-card { background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); display: flex; gap: 15px; margin-bottom: 20px; align-items: flex-end; flex-wrap: wrap; }
        .input-group { display: flex; flex-direction: column; gap: 5px; }
        .portal-select { padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
        .btn-action { padding: 8px 20px; background: #1a73e8; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
        
        /* टेबल और प्रिंट स्टाइल */
        .result-table { width: 100%; border-collapse: collapse; font-size: 11px; background: #fff; }
        .result-table th { background: #0d3558; color: white; padding: 8px; border: 1px solid #999; }
        .result-table td { padding: 6px; border: 1px solid #999; text-align: center; }
        
        @media print {
            .no-print { display: none !important; }
            .result-table { width: 100%; }
        }
    </style>

    <div class="portal-wrapper">
        <div class="portal-title">📋 कक्षावार छात्र सूची</div>
        <div class="search-card no-print">
            <div class="input-group">
                <label>सत्र:</label>
                <select id="sYear" class="portal-select">${generateOptions(sessionOptions)}</select>
            </div>
            <div class="input-group">
                <label>कक्षा:</label>
                <select id="sClass" class="portal-select">${generateOptions(classOptions)}</select>
            </div>
            <div class="input-group">
                <label>माध्यम:</label>
                <select id="sMedium" class="portal-select">
                    <option value="Hindi">Hindi</option>
                    <option value="English">English</option>
                </select>
            </div>
            <button onclick="fetchClassWiseData()" class="btn-action">सूची देखें</button>
        </div>
        <div id="resultsArea"></div>
    </div>`;
}

// डेटा लोड करने का ग्लोबल फंक्शन
window.fetchClassWiseData = async () => {
    const container = document.getElementById('resultsArea');
    const params = {
        year: document.getElementById('sYear').value,
        class: document.getElementById('sClass').value,
        medium: document.getElementById('sMedium').value
    };

    container.innerHTML = "डेटा लोड हो रहा है...";
    try {
        const res = await fetch(`${sheetUrls.Database}?action=searchStudents&year=${params.year}&class=${params.class}&medium=${params.medium}`);
        const data = await res.json();

        if (data && data.length > 0) {
            let html = `
            <table class="result-table">
                <thead>
                    <tr>
                        <th>ID</th><th>सत्र</th><th>नाम</th><th>पिता</th><th>माता</th><th>कक्षा</th><th>माध्यम</th>
                        <th>DOB</th><th>जाति</th><th>लिंग</th><th>समग्र ID</th><th>आधार</th><th>बैंक</th><th>IFSC</th><th>मोबाइल</th><th>पता</th>
                    </tr>
                </thead>
                <tbody>`;
            data.forEach(s => {
                html += `<tr>
                    <td>${s.studentid}</td><td>${s.session}</td><td>${s.name}</td><td>${s.father}</td>
                    <td>${s.mother}</td><td>${s.class}</td><td>${s.medium}</td><td>${s.dob}</td>
                    <td>${s.cast}</td><td>${s.gender}</td><td>${s.samagra}</td><td>[Redacted]</td>
                    <td>${s.bank}</td><td>${s.ifsc}</td><td>${s.mobile}</td><td>${s.address}</td>
                </tr>`;
            });
            html += `</tbody></table>
            <button class="no-print" onclick="window.print()" style="margin-top:20px; padding:10px 20px; background:green; color:white; border:none; cursor:pointer;">🖨️ लिस्ट प्रिंट करें</button>`;
            container.innerHTML = html;
        } else {
            container.innerHTML = "कोई डेटा नहीं मिला।";
        }
    } catch (e) {
        container.innerHTML = "एरर: सर्वर कनेक्ट नहीं हो पा रहा।";
    }
};

