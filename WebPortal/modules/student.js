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
        .wrap {
            max-width: 1000px;
            margin: 20px auto;
            background: #fff;
            border-radius: 15px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            overflow: hidden;
        }

        .header {
            background: #4a90e2;
            color: white;
            padding: 15px;
            text-align: center;
            font-size: 20px;
            font-weight: bold;
        }

        .search {
            display: flex;
            gap: 10px;
            padding: 15px;
            border-bottom: 1px solid #eee;
        }

        .search input {
            flex: 1;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 8px;
        }

        .search button {
            padding: 10px 15px;
            background: #4a90e2;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
        }

        .form {
            padding: 20px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }

        .field {
            display: flex;
            flex-direction: column;
        }

        .field label {
            font-size: 13px;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .field input {
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 6px;
        }

        .full { grid-column: span 2; }

        .readonly input {
            background: #f3f3f3;
        }

        .photo {
            grid-column: span 2;
            text-align: center;
        }

        .photo img {
            width: 120px;
            height: 150px;
            border-radius: 10px;
            border: 2px solid #ddd;
        }

        .btn {
            grid-column: span 2;
            padding: 12px;
            background: green;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
        }

        .msg {
            text-align: center;
            margin-top: 10px;
        }
    </style>

    <div class="wrap">
        <div class="header">🎓 Student Profile Update System</div>

        <div class="search">
            <input id="studentId" placeholder="Enter Student ID">
            <button id="searchBtn">Search</button>
        </div>

        <div id="formArea"></div>
    </div>
    `;

    contentArea.onclick = async (e) => {

        /* ---------------- SEARCH ---------------- */
        if (e.target.id === 'searchBtn') {

            const id = document.getElementById('studentId').value.trim();
            if (!id) return alert("Enter Student ID");

            document.getElementById('formArea').innerHTML = "Loading...";

            const res = await fetch(`${sheetUrls.Database}?action=searchById&studentId=${id}`);
            const data = await res.json();

            if (data.status !== "found") {
                document.getElementById('formArea').innerHTML =
                    `<p style="color:red;text-align:center">${data.message}</p>`;
                return;
            }

            document.getElementById('formArea').innerHTML = `
            <div class="form">

                <!-- PHOTO -->
                <div class="photo">
                    <img src="${data.photo || ''}">
                </div>

                <!-- READ ONLY -->
                <div class="field readonly">
                    <label>Student ID</label>
                    <input id="uId" value="${data.studentId}" disabled>
                </div>

                <div class="field readonly">
                    <label>Session</label>
                    <input value="${data.session || ''}" disabled>
                </div>

                <div class="field">
                    <label>Student Name</label>
                    <input id="uName" value="${data.name || ''}">
                </div>

                <div class="field">
                    <label>Father Name</label>
                    <input id="uFather" value="${data.father || ''}">
                </div>

                <div class="field">
                    <label>Mother Name</label>
                    <input id="uMother" value="${data.mother || ''}">
                </div>

                <div class="field">
                    <label>DOB</label>
                    <input id="uDob" value="${data.dob || ''}">
                </div>

                <div class="field">
                    <label>Medium</label>
                    <input id="uMedium" value="${data.medium || ''}">
                </div>

                <div class="field">
                    <label>Class</label>
                    <input id="uClass" value="${data.class || ''}">
                </div>

                <div class="field">
                    <label>Gender</label>
                    <input id="uGender" value="${data.gender || ''}">
                </div>

                <div class="field">
                    <label>Cast</label>
                    <input id="uCast" value="${data.category || ''}">
                </div>

                <div class="field">
                    <label>Subject (11th/12th)</label>
                    <input id="uSubject" value="${data.subject || ''}">
                </div>

                <div class="field full">
                    <label>Full Address</label>
                    <input id="uAddress" value="${data.address || ''}">
                </div>

                <div class="field">
                    <label>Aadhaar</label>
                    <input id="uAadhaar" value="${data.adhar || ''}">
                </div>

                <div class="field">
                    <label>Bank Account</label>
                    <input id="uBank" value="${data.accountnumber || ''}">
                </div>

                <div class="field">
                    <label>IFSC</label>
                    <input id="uIfsc" value="${data.ifsc || ''}">
                </div>

                <div class="field">
                    <label>Mobile</label>
                    <input id="uMobile" value="${data.mobile1 || ''}">
                </div>

                <div class="field">
                    <label>Samagra ID</label>
                    <input id="uSamagra" value="${data.samgra || ''}">
                </div>

                <button class="btn" id="saveBtn">💾 Update Student</button>

                <div class="msg" id="msg"></div>
            </div>
            `;
        }

        /* ---------------- SAVE ---------------- */
        if (e.target.id === 'saveBtn') {

            const payload = new URLSearchParams();

            payload.append("action", "update");
            payload.append("appNo", document.getElementById('uId').value);

            payload.append("studentName", document.getElementById('uName').value);
            payload.append("fatherName", document.getElementById('uFather').value);
            payload.append("motherName", document.getElementById('uMother').value);

            payload.append("dob", document.getElementById('uDob').value);
            payload.append("medium", document.getElementById('uMedium').value);
            payload.append("class", document.getElementById('uClass').value);
            payload.append("gender", document.getElementById('uGender').value);
            payload.append("category", document.getElementById('uCast').value);
            payload.append("subject", document.getElementById('uSubject').value);

            payload.append("address", document.getElementById('uAddress').value);
            payload.append("adhar", document.getElementById('uAadhaar').value);
            payload.append("accountnumber", document.getElementById('uBank').value);
            payload.append("ifsc", document.getElementById('uIfsc').value);
            payload.append("mobile1", document.getElementById('uMobile').value);
            payload.append("samgra", document.getElementById('uSamagra').value);

            e.target.innerText = "Updating...";

            const res = await fetch(sheetUrls.Database, {
                method: "POST",
                body: payload
            });

            const result = await res.json();

            document.getElementById('msg').innerText = result.message;

            e.target.innerText = "💾 Update Student";
        }
    };
}
