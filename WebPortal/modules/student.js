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
        <select id="mediumSelect"><option value="MediumSelect">Hindi</option><option value="English">English</option></select>
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

            let html = `<table class="student-table"><tr><th><input type="checkbox" id="selectAll"></th><th>Student ID</th><th>Name</th><th>Father's Name</th></tr>`;
            students.forEach(s => {
                html += `<tr><td><input type="checkbox" class="studentCheck" value="${s.studentid}"></td><td>${s.studentid}</td><td>${s.name}</td><td>${s.father}</td></tr>`;
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
        .profile-wrapper { max-width: 900px; margin: 30px auto; background: #ffffff; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); overflow: hidden; padding: 20px; position: relative; }
        .p-header { background: #357abd; color: white; padding: 20px; text-align: center; font-size: 20px; font-weight: 700; border-radius: 10px; margin-bottom: 20px; }
        
        /* Photo ko Right side aur Square banane ke liye */
        .photo-section { position: absolute; top: 80px; right: 25px; }
        .photo-section img { width: 130px; height: 130px; border-radius: 8px; border: 3px solid #357abd; object-fit: cover; display: block; }
        
        .form-grid { padding-right: 170px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
        .field { display: flex; flex-direction: column; }
        .field label { font-size: 11px; font-weight: 700; color: #7f8c8d; margin-bottom: 5px; text-transform: uppercase; }
        .field input, .field select { padding: 9px; border: 1.5px solid #dee2e6; border-radius: 8px; font-size: 14px; }
        .section-title { grid-column: span 2; font-weight: bold; color: #357abd; border-bottom: 2px solid #eee; padding-bottom: 5px; margin-top: 10px; }
        .action-btn { grid-column: span 2; padding: 12px; background: #27ae60; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; width: fit-content; }
        
        @media (max-width: 768px) { 
            .photo-section { position: relative; top: 0; right: 0; text-align: center; margin-bottom: 20px; }
            .form-grid { padding-right: 0; grid-template-columns: 1fr; }
        }
    </style>

    <div class="profile-wrapper">
        <div class="p-header">🎓 Student Profile Update</div>
        <div style="padding: 0 20px 20px 20px; display: flex; gap: 10px;">
            <input id="studentId" placeholder="Enter Student ID..." style="flex:1; padding:10px; border:1px solid #ddd; border-radius:5px;">
            <button id="searchBtn" style="padding:10px 20px; background:#2c3e50; color:#fff; border:none; border-radius:5px;">Search</button>
        </div>
        <div id="formArea"></div>
    </div>`;

    contentArea.onclick = async (e) => {
        if (e.target.id === 'searchBtn') {
            const id = document.getElementById('studentId').value.trim();
            if (!id) return alert("Enter ID");
            
            const formArea = document.getElementById('formArea');
            formArea.innerHTML = "<p style='text-align:center;'>Loading...</p>";

            const res = await fetch(`${sheetUrls.Database}?action=searchById&studentId=${id}`);
            const data = await res.json();
            if (data.status !== "found") return formArea.innerHTML = `<p style="color:red; text-align:center;">${data.message}</p>`;

            formArea.innerHTML = `
            <div class="form-grid">
                <div class="photo-section"><img src="${data.photo || 'https://via.placeholder.com/150'}"></div>
                
                <div class="section-title">Personal Information</div>
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
                
                <div class="section-title">Bank & Security</div>
                <div class="field"><label>Aadhar Number</label><input id="uAadhar" value="${data.aadhar || ''}"></div>
                <div class="field"><label>Bank Account</label><input id="uBank" value="${data.accountnumber || ''}"></div>
                <div class="field"><label>IFSC Code</label><input id="uIfsc" value="${data.ifsc || ''}"></div>

                <button class="action-btn" id="saveBtn">Update Record</button>
            </div>
            <div id="msg" style="text-align:center; padding-bottom:20px;"></div>`;
        }
        
        // ... (Save logic yahan rahega)
    };
    // ... (Toggle function yahan rahega)
}
