import { sheetUrls } from './config.js';

// --- API Functions ---
export async function getStudentsByFilter(className, medium) {
    const url = `${sheetUrls['Database']}?action=filter&class=${className}&medium=${medium}`;
    const response = await fetch(url);
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
    const romanClasses = ["Select Class", "Nursery", "KG1", "KG2", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    const sessions = ["Select Year", "2027-28", "2028-29", "2029-30"];

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
        <select id="mediumSelect"><option value="Hindi">Hindi</option><option value="English">English</option></select>
        <button id="loadListBtn" class="btn-primary">Load List</button>
    </div>
    <div id="studentDisplayArea"></div>`;

    contentArea.onclick = async (e) => {
        // Load List
        if (e.target.id === 'loadListBtn') {
            const displayArea = document.getElementById('studentDisplayArea');
            displayArea.innerHTML = "Loading...";
            const students = await getStudentsByFilter(document.getElementById('classSelect').value, document.getElementById('mediumSelect').value);
            
            if (!students || students.length === 0) return displayArea.innerHTML = "कोई रिकॉर्ड नहीं मिला!";

            let html = `<table class="student-table"><tr><th><input type="checkbox" id="selectAll"></th><th>Student ID</th><th>Session</th><th>Name</th><th>Father's Name</th></tr>`;
            students.forEach(s => {
                html += `<tr><td><input type="checkbox" class="studentCheck" value="${s.studentid}"></td><td>${s.studentid}</td><td>${s.session}</td><td>${s.name}</td><td>${s.father}</td></tr>`;
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


export async function renderStudentProfile() {
    const contentArea = document.getElementById('contentArea');

    contentArea.innerHTML = `
    <style>
        .profile-wrapper { max-width: 950px; margin: 30px auto; background: #f8f9fa; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); padding: 30px; }
        .p-header { background: linear-gradient(135deg, #357abd, #2c3e50); color: white; padding: 25px; text-align: center; font-size: 24px; font-weight: 700; border-radius: 15px; margin-bottom: 30px; box-shadow: 0 5px 15px rgba(53, 122, 189, 0.3); }
        
        .main-layout { display: grid; grid-template-columns: 1fr 220px; gap: 30px; align-items: start; }
        
        /* Form Box */
        .form-fields { background: white; padding: 25px; border-radius: 15px; border: 1px solid #eee; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        
        /* Photo Box */
        .photo-section { background: white; padding: 20px; border-radius: 15px; border: 1px solid #eee; text-align: center; }
        .photo-section img { width: 180px; height: 180px; border-radius: 12px; border: 4px solid #fff; box-shadow: 0 8px 20px rgba(0,0,0,0.15); object-fit: cover; margin-bottom: 15px; }
        
        .field { display: flex; flex-direction: column; }
        .field label { font-size: 11px; font-weight: 700; color: #7f8c8d; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
        .field input, .field select { padding: 12px; border: 1.5px solid #e1e8ed; border-radius: 10px; font-size: 14px; background: #fafafa; transition: 0.3s; }
        .field input:focus { border-color: #357abd; background: #fff; outline: none; }
        
        .section-title { grid-column: span 2; font-size: 15px; font-weight: 700; color: #357abd; border-left: 4px solid #357abd; padding-left: 10px; margin: 15px 0 5px 0; text-transform: uppercase; }
        
        .action-btn { grid-column: span 2; padding: 15px; background: #27ae60; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: bold; font-size: 15px; transition: 0.3s; margin-top: 10px; }
        .action-btn:hover { background: #219150; transform: translateY(-2px); box-shadow: 0 5px 15px rgba(39, 174, 96, 0.3); }
        .change-photo-btn { background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; width: 100%; font-weight: 600; }
        
        @media (max-width: 850px) { .main-layout { grid-template-columns: 1fr; } }
    </style>

    <div class="profile-wrapper">
    <div class="p-header">🎓 Student Profile Management</div>
    
    <div class="search-wrapper">
        <input id="studentId" placeholder="Search by Student ID..." style="flex:1; padding:15px; border:1px solid #ddd; border-radius:10px; font-size: 16px;">
        <button id="searchBtn" style="padding: 15px 30px; background: #2c3e50; color: #fff; border:none; border-radius:10px; cursor:pointer; font-weight: 600;">Search</button>
    </div>
    <div id="formArea"></div>
</div>`;

    contentArea.onclick = async (e) => {
        if (e.target.id === 'searchBtn') {
            const id = document.getElementById('studentId').value.trim();
            if (!id) return alert("Enter ID");
            
            const formArea = document.getElementById('formArea');
            formArea.innerHTML = "<p style='text-align:center; padding:50px;'>Loading profile...</p>";

            const res = await fetch(`${sheetUrls.Database}?action=searchById&studentId=${id}`);
            const data = await res.json();
            if (data.status !== "found") return formArea.innerHTML = `<p style="color:red; text-align:center;">${data.message}</p>`;

            formArea.innerHTML = `
            <div class="main-layout">
                <div class="form-fields">
                    <div class="section-title">Personal Details</div>
                    <div class="field"><label>Student ID</label><input value="${data.studentId}" disabled></div>
                    <div class="field"><label>Samagra ID</label><input id="uSamagra" value="${data.samgra || ''}"></div>
                    <div class="field"><label>Student Name</label><input id="uName" value="${data.name || ''}"></div>
                    <div class="field"><label>Father Name</label><input id="uFather" value="${data.father || ''}"></div>
                    <div class="field"><label>Mother Name</label><input id="uMother" value="${data.mother || ''}"></div>
                    <div class="field"><label>Date of Birth</label><input id="uDob" type="date" value="${data.dob || ''}"></div>
                    <div class="field"><label>Gender</label><select id="uGender"><option ${data.gender=='Male'?'selected':''}>Male</option><option ${data.gender=='Female'?'selected':''}>Female</option></select></div>
                    <div class="field"><label>Category</label><select id="uCast"><option ${data.category=='General'?'selected':''}>General</option><option ${data.category=='OBC'?'selected':''}>OBC</option><option ${data.category=='SC'?'selected':''}>SC</option><option ${data.category=='ST'?'selected':''}>ST</option></select></div>

                    <div class="section-title">Academic & Contact</div>
                    <div class="field"><label>Class</label>
                        <select id="uClass" onchange="window.toggleSub()">
                            ${['Nursery','KG1','KG2','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'].map(c => `<option value="${c}" ${data.class == c ? 'selected' : ''}>${c}</option>`).join('')}
                        </select>
                    </div>
                    <div class="field"><label>Medium</label><select id="uMedium"><option ${data.medium=='Hindi'?'selected':''}>Hindi</option><option ${data.medium=='English'?'selected':''}>English</option></select></div>
                    <div class="field"><label>Enrollment No</label><input id="uEnrol" value="${data.enrolment || ''}"></div>
                    <div class="field"><label>Mobile Number</label><input id="uMobile" value="${data.mobile1 || ''}"></div>
                    <div class="field" id="subField" style="display:${(data.class=='XI'||data.class=='XII')?'flex':'none'}"><label>Subject</label><input id="uSubject" value="${data.subject || ''}"></div>
                    <div class="field" style="grid-column: span 2;">
                        <label>Address</label>
                        <input id="uAddress" value="${data.address || ''}">
                    </div>
                    
                    <div class="section-title">Bank & Security</div>
                    <div class="field"><label>Aadhar Number</label><input id="uAadhar" value="[Redacted]"></div>
                    <div class="field"><label>Bank Account</label><input id="uBank" value="${data.accountnumber || ''}"></div>
                    <div class="field"><label>IFSC Code</label><input id="uIfsc" value="${data.ifsc || ''}"></div>

                    <button class="action-btn" id="saveBtn">Update Record</button>
                </div>
                
                <div class="photo-section">
                    <img id="profileImg" src="${data.photo || 'https://via.placeholder.com/150'}">
                    <input type="file" id="photoInput" style="display:none" accept="image/*">
                    <button class="change-photo-btn" onclick="document.getElementById('photoInput').click()">Change Photo</button>
                </div>
            </div>
            <div id="msg" style="text-align:center; margin-top:20px; font-weight:bold; font-size:16px;"></div>`;
        }

        // Save logic remains the same...
        if (e.target.id === 'saveBtn') {
            const btn = e.target;
            btn.innerText = "Updating...";
            const payload = new URLSearchParams();
            payload.append("action", "update");
            payload.append("appNo", document.getElementById('studentId').value);
            payload.append("samgra", document.getElementById('uSamagra').value);
            payload.append("studentName", document.getElementById('uName').value);
            payload.append("father", document.getElementById('uFather').value);
            payload.append("mother", document.getElementById('uMother').value);
            payload.append("dob", document.getElementById('uDob').value);
            payload.append("gender", document.getElementById('uGender').value);
            payload.append("category", document.getElementById('uCast').value);
            payload.append("class", document.getElementById('uClass').value);
            payload.append("medium", document.getElementById('uMedium').value);
            payload.append("enrolment", document.getElementById('uEnrol').value);
            payload.append("mobile1", document.getElementById('uMobile').value);
           payload.append("address", document.getElementById('uAddress').value);
            payload.append("subject", document.getElementById('uSubject')?.value || "");
            payload.append("accountnumber", document.getElementById('uBank').value);
            payload.append("ifsc", document.getElementById('uIfsc').value);

            const res = await fetch(sheetUrls.Database, { method: "POST", body: payload });
            const result = await res.json();
            document.getElementById('msg').innerText = result.message;
            document.getElementById('msg').style.color = result.status === "success" ? "green" : "red";
            btn.innerText = "Update Record";
        }
    };

    window.toggleSub = () => {
        const c = document.getElementById('uClass').value;
        document.getElementById('subField').style.display = (c == 'XI' || c == 'XII') ? 'flex' : 'none';
    };
}
