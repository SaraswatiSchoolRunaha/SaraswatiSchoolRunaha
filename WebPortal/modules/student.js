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
        .promote-title { color: #2c3e50; margin-bottom: 15px; font-weight: bold; }
        .filter-box { padding: 20px; background: #fff; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); margin-bottom: 20px; display: flex; flex-wrap: wrap; gap: 15px; align-items: center; }
        .student-table { width: 100%; border-collapse: collapse; margin-top: 10px; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .student-table th { background: #4a90e2; color: white; padding: 12px; text-align: left; }
        .student-table td { padding: 10px; border-bottom: 1px solid #eee; }
        .btn-primary { padding: 10px 20px; background: #4a90e2; color: white; border: none; border-radius: 5px; cursor: pointer; }
        .btn-promote { background: #27ae60; }
    </style>

    <div class="promote-title">🎓 छात्रों को प्रमोट करें</div>
    <div class="filter-box">
        <label>Class:</label>
        <select id="classSelect">${generateOptions(romanClasses)}</select>
        <label>Medium:</label>
        <select id="mediumSelect"> <option value="">Select Medium</option><option value="Hindi">Hindi</option><option value="English">English</option></select>
        <label>Session:</label>
            <select id="sessionSelect">
                <option value="">Select Session</option>
                <option value="2026-27">2026-27</option>
                <option value="2027-28">2027-28</option>
                <option value="2028-29">2028-29</option>
                <option value="2029-30">2029-30</option>
            </select>
        <button id="loadListBtn" class="btn-primary">Load List</button>
    </div>
    <div id="studentDisplayArea"></div>`;
    contentArea.onclick = async (e) => {
        // Load List
        if (e.target.id === 'loadListBtn') {
            const displayArea = document.getElementById('studentDisplayArea');
            displayArea.innerHTML = "Loading...";
            const students = await getStudentsByFilter(document.getElementById('classSelect').value, document.getElementById('mediumSelect').value,document.getElementById('sessionSelect').value);
            
            if (!students || students.length === 0) return displayArea.innerHTML = "कोई रिकॉर्ड नहीं मिला!";

            let html = `<table class="student-table"><tr><th><input type="checkbox" id="selectAll"></th><th>App No</th><th>Student ID</th><th>Session</th><th>Name</th><th>Father's Name</th></tr>`;
            students.forEach(s => {
                html += `<tr><td><input type="checkbox" class="studentCheck" value="${s.studentid}"></td><td>${s.appNo || 'N/A'}</td><td>${s.studentid}</td><td>${s.session}</td><td>${s.name}</td><td>${s.father}</td></tr>`;
            });
            
            html += `</table>
            <div style="margin-top:20px; padding:15px; background:#f9f9f9; border-radius:8px;">
                <label>Promote to Class:</label>
                <select id="targetClass">${generateOptions(romanClasses)}</select>
                
                <label style="margin-left: 15px;">Session:</label>
                <select id="targetSession">${generateOptions(sessions)}</select>
                
                <button id="promoteBtn" class="btn-primary btn-promote" style="margin-left: 15px;">Promote Selected Students</button>
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
            
            if (ids.length === 0) return alert("कृपया छात्र चुनें!");
            
            if (confirm(`क्या आप ${ids.length} छात्रों को Class ${targetClass} (${targetSession}) में प्रमोट करना चाहते हैं?`)) {
                e.target.innerText = "Processing...";
                const res = await promoteSelectedStudent(ids, targetClass, targetSession);
                if (res.status === "success") {
                    alert("सफलतापूर्वक प्रमोट किया गया!");
                    document.getElementById('loadListBtn').click(); 
                } else {
                    alert("Error: " + res.message);
                    e.target.innerText = "Promote Selected Students";
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
        .promote-title { color: #2c3e50; margin-bottom: 15px; font-weight: bold; }
        .filter-box { padding: 20px; background: #fff; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); margin-bottom: 20px; display: flex; flex-wrap: wrap; gap: 15px; align-items: center; }
        .student-table { width: 100%; border-collapse: collapse; margin-top: 10px; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .student-table th { background: #4a90e2; color: white; padding: 12px; text-align: left; }
        .student-table td { padding: 10px; border-bottom: 1px solid #eee; }
        .btn-primary { padding: 10px 20px; background: #4a90e2; color: white; border: none; border-radius: 5px; cursor: pointer; }
        .btn-danger { background: red; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; }
    </style>

    <div class="promote-title">🎓 छात्र प्रोफाइल अपडेट</div>
    <div class="filter-box">
        <label>Class:</label>
        <select id="classSelect">${generateOptions(classes)}</select>
        <label>Medium:</label>
        <select id="mediumSelect">
            <option value="Hindi">Hindi</option>
            <option value="English">English</option>
        </select>
        <label>Session:</label>
        <select id="sessionSelect">
            <option value="">Select Session</option>
            ${generateOptions(years)}
        </select>
        <button id="loadListBtn" class="btn-primary">Load List</button>
    </div>
    
    <table class="student-table">
        <thead>
            <tr>
               <th>App No</th><th>ID</th><th>Name</th><th>Father</th><th>DOB</th><th>Gender</th><th>Category</th><th>Action</th>
            </tr>
        </thead>
        <tbody id="tableBody"></tbody>
    </table>`;

    contentArea.onclick = async (e) => {
        if (e.target.id === 'loadListBtn') {
            const c = document.getElementById('classSelect').value;
            const m = document.getElementById('mediumSelect').value;
            const y = document.getElementById('sessionSelect').value;

            if (!c || !y) return alert("कृपया Class और Session दोनों select करें!");

            const tbody = document.getElementById('tableBody');
            tbody.innerHTML = "<tr><td colspan='7' style='text-align: center;'>Loading...</td></tr>";

            try {
                const students = await getStudentsByFilter(c, m, y); 
                
                if (!students || students.length === 0) {
                    tbody.innerHTML = "<tr><td colspan='7' style='text-align: center;'>कोई रिकॉर्ड नहीं मिला।</td></tr>";
                    return;
                }

               tbody.innerHTML = students.map(s => `
                    <tr>
                    <td>${s.appNo || s.appno || '-'}</td>
                    <td>${s.studentid}</td>
                    <td>${s.name}</td>
                    <td>${s.father}</td>
                    <td>${s.dob || '-'}</td>
                    <td>${s.gender || '-'}</td>
                    <td>${s.category || '-'}</td>
                    <td>
                    <div style="display: flex; gap: 6px; align-items: center;">
                    <button class="btn-primary" onclick="window.editStudent('${s.studentid}')" style="padding: 5px 10px;">Edit</button>
                    <button class="btn-danger" onclick="window.deleteStudent('${s.appNo}','${s.studentid}', '${s.session}')" style="padding: 5px 10px;">Delete</button>
                    </div>
                </td>
                </tr>
            `).join('');
            } catch (error) {
                console.error("Error fetching students:", error);
                tbody.innerHTML = "<tr><td colspan='7' style='text-align: center; color: red;'>डेटा लोड करने में त्रुटि।</td></tr>";
            }
        }
    };
}

// यह फंक्शन डिलीट बटन को चालू करेगा
window.deleteStudent = async (appNo, studentId, session) => {
    if (confirm("क्या आप सच में इस रिकॉर्ड को डिलीट करना चाहते हैं?")) {
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
    }
};

// शिक्षा पोर्टल 3.0 थीम आधारित फॉर्म रेंडरर फ़ंक्शन
function getProfileFormHTML(data) {
    return `
    <div class="main-layout">
        <div class="form-fields">
            <input type="hidden" id="uAppNo" value="${data.appNo || ''}">
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

// सुधरा हुआ एडिट फ़ंक्शन जो बाहर से कॉल होने पर काम करेगा
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

export async function renderStudentProfile() {
    const contentArea = document.getElementById('contentArea');

    contentArea.innerHTML = `
    <style>
        /* शिक्षा पोर्टल 3.0 थीम कलर्स */
        .profile-wrapper { 
            max-width: 1050px; 
            margin: 30px auto; 
            background: #f0f4f8; /* पोर्टल लाइट ग्रे-ब्लू बैकग्राउंड */
            border-radius: 12px; 
            box-shadow: 0 8px 24px rgba(0,0,0,0.12); 
            padding: 25px;
            border-top: 5px solid #1a365d; /* मुख्य विभाग का डार्क ब्लू */
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .p-header { 
            background: #1a365d; /* Education Department Dark Blue */
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
        
        /* पोर्टल स्टाइल इनपुट बॉक्स */
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
            background: #fffdf5; /* फोकस होने पर हल्का सा पोर्टल हाइलाइट कलर */
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
        
        /* बटन्स */
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
        <div class="p-header">💻 शिक्षा पोर्टल 3.0 - Student Profile Management</div>
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
                appNo: document.getElementById('uAppNo').value,
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

export async function renderIdAssignment() {
    const contentArea = document.getElementById('contentArea');

    contentArea.innerHTML = `
    <style>
        .assign-wrapper { max-width: 600px; margin: 30px auto; padding: 25px; background: #fff; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-top: 4px solid #1a365d;}
        .input-group { display: flex; gap: 10px; margin-bottom: 20px; }
        .details-card { padding: 20px; background: #f7fafc; border-radius: 6px; margin-bottom: 20px; border-left: 5px solid #3182ce; border-box: 1px solid #e2e8f0; }
        .field { margin-bottom: 12px; display: flex; flex-direction: column;}
        .field label { font-weight: bold; color: #2d3748; margin-bottom: 4px; font-size: 13px;}
    </style>

    <div class="assign-wrapper">
        <h3 style="color: #1a365d; margin-top:0;">🆔 Student ID Allocation Portal</h3>
        <div class="input-group">
            <input id="searchAppNo" class="portal-input" placeholder="Enter Application Number..." style="flex:1;">
            <button id="searchAppBtn" class="search-btn">🔍 Search</button>
        </div>
        <div id="resultArea"></div>
    </div>`;

    contentArea.onclick = async (e) => {
        if (e.target.id === 'searchAppBtn') {
            const appNo = document.getElementById('searchAppNo').value.trim();
            const resArea = document.getElementById('resultArea');
            
            if(!appNo) return alert("Please enter Application Number");
            resArea.innerHTML = "<p style='color:#1a365d; font-weight:bold;'>Searching Application...</p>";
            
            try {
                const res = await fetch(`${sheetUrls.Database}?action=getByAppNo&appNo=${appNo}`);
                const data = await res.json();

                if (data.status !== "success") {
                    return resArea.innerHTML = `<p style="color:red; font-weight:bold;">❌ ${data.message || "Record not found!"}</p>`;
                }
                resArea.innerHTML = `
                    <div class="details-card">
                        <div class="field"><label>Student Name:</label> <input class="portal-input input-disabled" value="${data.studentName}" disabled></div>
                        <div class="field"><label>Father Name:</label> <input class="portal-input input-disabled" value="${data.fatherName}" disabled></div>
                        <div class="field"><label>Mother Name:</label> <input class="portal-input input-disabled" value="${data.motherName}" disabled></div>
                        <div class="field"><label>Class:</label> <input class="portal-input input-disabled" value="${data.class}" disabled></div>
                    <hr style="border:0; border-top:1px solid #e2e8f0; margin:15px 0;">
                    <div class="field">
                        <label style="color:#1a365d;">Assign New Student ID:</label>
                        <input id="newStudentId" class="portal-input" value="${data.studentId || ''}" style="font-weight:bold; color:#2b6cb0;">
                    </div>
                    <button id="submitIdBtn" class="action-btn" style="margin-top:10px; width:100%;">🆔 Update & Allocate Student ID</button>
                </div>
                <div id="msg" style="text-align:center; font-weight:bold;"></div>`;
            } catch (err) {
                resArea.innerHTML = `<p style="color:red; font-weight:bold;">Server connection error!</p>`;
            }
        }
        
        if (e.target.id === 'submitIdBtn') {
            const newId = document.getElementById('newStudentId').value.trim();
            const appNo = document.getElementById('searchAppNo').value.trim();
            const msgDiv = document.getElementById('msg');

            if(!newId) return alert("Please enter a valid Student ID");
            msgDiv.innerHTML = "Processing allocation...";

            try {
                const formData = new FormData();
                formData.append("action", "updateStudentId");
                formData.append("appNo", appNo);
                formData.append("newId", newId);

                const response = await fetch(sheetUrls.Database, {
                    method: "POST",
                    body: formData
                });

                const result = await response.json();
                    
                if (result.status === "success") {
                    msgDiv.innerHTML = `<p style="color:#2f855a;font-weight:bold;">✅ ${result.message}</p>`;
                } else {
                    msgDiv.innerHTML = `<p style="color:#c53030;">❌ ${result.message}</p>`;
                }
            } catch (err) {
                msgDiv.innerHTML = `<p style="color:red;">Server connection error!</p>`;
            }
        }
    }; 
}
