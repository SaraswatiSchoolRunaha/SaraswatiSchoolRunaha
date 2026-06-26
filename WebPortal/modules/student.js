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
    
    // UI डिज़ाइन: एक व्यवस्थित फॉर्म
    contentArea.innerHTML = `
    <div style="max-width: 600px; margin: 20px auto; padding: 20px; background: #fff; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #2c3e50; text-align: center;">🎓 छात्र प्रोफाइल</h2>
        <div style="display: flex; gap: 10px; margin-bottom: 20px;">
            <input type="text" id="sId" placeholder="Student ID डालें" style="flex:1; padding:10px; border:1px solid #ddd; border-radius:5px;">
            <button id="searchBtn" style="padding:10px 20px; background:#4a90e2; color:white; border:none; border-radius:5px; cursor:pointer;">Search</button>
        </div>
        <div id="displayArea"></div>
    </div>`;

    contentArea.onclick = async (e) => {
        // 1. सर्च लॉजिक
        if (e.target.id === 'searchBtn') {
            const id = document.getElementById('sId').value;
            if(!id) return alert("कृपया Student ID दर्ज करें!");
            
            document.getElementById('displayArea').innerHTML = "Loading...";
            
            try {
                const res = await fetch(`${sheetUrls['Database']}?action=searchById&studentId=${id}`);
                const data = await res.json();
                
                if(data.status === "found") {
                    document.getElementById('displayArea').innerHTML = `
                    <form id="editForm" style="display:grid; gap:15px;">
                        <div><label>नाम:</label><input type="text" id="uName" value="${data.name}" style="width:100%; padding:8px;"></div>
                        <div><label>पिता का नाम:</label><input type="text" id="uFather" value="${data.father}" style="width:100%; padding:8px;"></div>
                        <div><label>कक्षा:</label><input type="text" id="uClass" value="${data.className}" style="width:100%; padding:8px;"></div>
                        <div><label>मोबाइल:</label><input type="text" id="uMobile" value="${data.mobile}" style="width:100%; padding:8px;"></div>
                        <button type="button" id="saveBtn" style="padding:12px; background:#27ae60; color:white; border:none; border-radius:5px; cursor:pointer;">अपडेट सुरक्षित करें (Save)</button>
                    </form>`;
                } else {
                    document.getElementById('displayArea').innerHTML = `<p style="color:red;">${data.message}</p>`;
                }
            } catch (err) {
                alert("सर्च करने में एरर आया!");
            }
        }

        // 2. अपडेट लॉजिक
        if (e.target.id === 'saveBtn') {
            const payload = {
                action: "updateById",
                studentId: document.getElementById('sId').value,
                name: document.getElementById('uName').value,
                father: document.getElementById('uFather').value,
                className: document.getElementById('uClass').value,
                mobile: document.getElementById('uMobile').value
            };
            
            e.target.innerText = "Updating...";
            
            const res = await fetch(sheetUrls['Database'], {
                method: "POST",
                body: JSON.stringify(payload)
            });
            const result = await res.json();
            alert(result.message);
            e.target.innerText = "अपडेट सुरक्षित करें (Save)";
        }
    };
}
