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
        .profile-container { max-width: 800px; margin: 30px auto; padding: 30px; background: #f9f9f9; border-radius: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border-top: 5px solid #4a90e2; }
        .profile-header { text-align: center; margin-bottom: 25px; color: #2c3e50; }
        .search-box { display: flex; gap: 10px; margin-bottom: 30px; }
        .search-box input { flex: 1; padding: 12px; border: 2px solid #ddd; border-radius: 8px; outline: none; transition: 0.3s; }
        .search-box input:focus { border-color: #4a90e2; }
        .grid-form { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .input-group label { display: block; font-weight: 600; color: #555; margin-bottom: 5px; font-size: 0.9em; }
        .input-group input { width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 6px; box-sizing: border-box; }
        .btn-action { grid-column: span 2; padding: 15px; background: #27ae60; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; transition: 0.3s; font-weight: bold; }
        .btn-action:hover { background: #219150; }
        .btn-search { padding: 10px 25px; background: #4a90e2; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; }
    </style>

    <div class="profile-container">
        <h2 class="profile-header">🎓 छात्र प्रोफाइल प्रबंधन</h2>
        <div class="search-box">
            <input type="text" id="sId" placeholder="यहाँ Student ID दर्ज करें...">
            <button id="searchBtn" class="btn-search">Search</button>
        </div>
        <div id="displayArea"></div>
    </div>`;

    contentArea.onclick = async (e) => {
        if (e.target.id === 'searchBtn') {
            const id = document.getElementById('sId').value;
            if(!id) return alert("कृपया Student ID दर्ज करें!");
            
            document.getElementById('displayArea').innerHTML = "<p style='text-align:center;'>प्रोफ़ाइल ढूँढ रहे हैं...</p>";
            
            try {
                const res = await fetch(`${sheetUrls['Database']}?action=searchById&studentId=${id}`);
                const data = await res.json();
                
               if(data.status === "found") {
    document.getElementById('displayArea').innerHTML = `
    <form id="editForm" class="grid-form">
        <!-- फोटो बॉक्स -->
        <div style="grid-column: span 2; text-align:center; padding:10px;">
            <img src="${data.photo || ''}" style="width:120px; height:150px; border:2px solid #ddd; border-radius:10px;" alt="Photo">
        </div>

        <!-- 1. केवल देखने योग्य (ReadOnly) फील्ड्स -->
        <div class="input-group"><label>Student ID:</label><input type="text" value="${data.studentId}" disabled></div>
        <div class="input-group"><label>Session:</label><input type="text" value="${data.session || ''}" disabled></div>
        <div class="input-group"><label>DOB:</label><input type="text" value="${data.dob || ''}" disabled></div>
        <div class="input-group"><label>Medium:</label><input type="text" value="${data.medium || ''}" disabled></div>
        <div class="input-group"><label>Gender:</label><input type="text" value="${data.gender || ''}" disabled></div>
        <div class="input-group"><label>Cast:</label><input type="text" value="${data.category || ''}" disabled></div>
        <div class="input-group"><label>Subject:</label><input type="text" value="${data.subject || ''}" disabled></div>
        <div class="input-group"><label>Aadhaar:</label><input type="text" value="[Aadhaar Redacted]" disabled></div>
        <div class="input-group"><label>Samagra ID:</label><input type="text" value="${data.samgra || ''}" disabled></div>

        <!-- 2. अपडेट करने योग्य फील्ड्स -->
        <div class="input-group"><label>नाम:</label><input type="text" id="uName" value="${data.name || ''}"></div>
        <div class="input-group"><label>पिता का नाम:</label><input type="text" id="uFather" value="${data.father || ''}"></div>
        <div class="input-group"><label>माता का नाम:</label><input type="text" id="uMother" value="${data.mother || ''}"></div>
        <div class="input-group"><label>कक्षा:</label><input type="text" id="uClass" value="${data.className || ''}"></div>
        <div class="input-group"><label>मोबाइल:</label><input type="text" id="uMobile" value="${data.mobile1 || ''}"></div>
        <div class="input-group"><label>बैंक खाता:</label><input type="text" id="uBank" value="${data.accountnumber || ''}"></div>
        <div class="input-group"><label>IFSC:</label><input type="text" id="uIfsc" value="${data.ifsc || ''}"></div>
        <div class="input-group" style="grid-column: span 2;"><label>पूरा पता:</label><input type="text" id="uAddress" value="${data.address || ''}"></div>
        
        <button type="button" id="saveBtn" class="btn-action">अपडेट सुरक्षित करें</button>
    </form>`;
        } else {
                    document.getElementById('displayArea').innerHTML = `<p style="color:red; text-align:center;">${data.message}</p>`;
                }
            } catch (err) {
                alert("सर्वर से संपर्क करने में समस्या आई!");
            }
        }

        if (e.target.id === 'saveBtn') {
            const payload = {
                action: "update",
                appNo: document.getElementById('sId').value,
                studentName: document.getElementById('uName').value,
                fatherName: document.getElementById('uFather').value,
                motherName: document.getElementById('uMother').value,
                class: document.getElementById('uClass').value,
                mobile1: document.getElementById('uMobile').value,
                adhar: "[Aadhaar Redacted]",
                accountnumber: document.getElementById('uBank').value,
                ifsc: document.getElementById('uIfsc').value,
                address: document.getElementById('uAddress').value
            };
            
            e.target.innerText = "अपडेट हो रहा है...";
            
            const res = await fetch(sheetUrls['Database'], {
                method: "POST",
                body: JSON.stringify(payload)
            });
            const result = await res.json();
            alert(result.message);
            e.target.innerText = "प्रोफ़ाइल सुरक्षित करें (Save Changes)";
        }
    };
}
