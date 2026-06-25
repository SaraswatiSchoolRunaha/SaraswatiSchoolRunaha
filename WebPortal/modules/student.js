import { sheetUrls } from './config.js';

// --- API Functions ---
export async function getStudentsByFilter(className, medium) {
    const url = `${sheetUrls['Database']}?action=filter&class=${className}&medium=${medium}`;
    const response = await fetch(url);
    return await response.json();
}

export async function promoteSelectedStudent(studentIds) {
    const response = await fetch(sheetUrls['Database'], {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: 'bulkPromote', ids: studentIds })
    });
    return await response.json();
}

// --- UI Rendering ---
export async function renderStudentList() {
    const contentArea = document.getElementById('contentArea');

    // 1. बेहतर UI के लिए CSS और Layout
    contentArea.innerHTML = `
    <style>
        .filter-box { padding: 20px; background: #fff; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); margin-bottom: 20px; display: flex; gap: 15px; align-items: center; }
        .student-table { width: 100%; border-collapse: collapse; margin-top: 10px; background: #fff; border-radius: 8px; overflow: hidden; }
        .student-table th { background: #4a90e2; color: white; padding: 12px; text-align: left; }
        .student-table td { padding: 10px; border-bottom: 1px solid #eee; }
        .student-table tr:hover { background: #f9f9f9; }
        .btn-primary { padding: 10px 20px; background: #4a90e2; color: white; border: none; border-radius: 5px; cursor: pointer; transition: 0.3s; }
        .btn-primary:hover { background: #357abd; }
        .btn-promote { background: #27ae60; }
    </style>

    <div class="filter-box">
        <label>Class:</label>
        <select id="classSelect" style="padding:8px;">
            <option value="Nursery">Nursery</option>
            <option value="KG1">KG1</option>
            <option value="1">1</option>
            <option value="2">2</option>
        </select>
        <label>Medium:</label>
        <select id="mediumSelect" style="padding:8px;">
            <option value="Hindi">Hindi</option>
            <option value="English">English</option>
        </select>
        <button id="loadListBtn" class="btn-primary">Load List</button>
    </div>
    <div id="studentDisplayArea"></div>`;

    // 2. Event Delegation
    contentArea.onclick = async (e) => {
        
        // Load List Button
        if (e.target.id === 'loadListBtn') {
            const className = document.getElementById('classSelect').value;
            const medium = document.getElementById('mediumSelect').value;
            const displayArea = document.getElementById('studentDisplayArea');
            
            displayArea.innerHTML = "<p>Loading students...</p>";
            
            const students = await getStudentsByFilter(className, medium);
            
            if (!students || students.length === 0) {
                displayArea.innerHTML = "<p style='color:red;'>कोई रिकॉर्ड नहीं मिला!</p>";
                return;
            }

            let html = `
            <table class="student-table">
                <tr>
                    <th><input type="checkbox" id="selectAll"></th>
                    <th>ID</th><th>Session</th><th>Name</th><th>Father's Name</th>
                </tr>`;

            students.forEach(s => {
                html += `<tr>
                    <td><input type="checkbox" class="studentCheck" value="${s.id}"></td>
                    <td>${s.id}</td><td>${s.session}</td><td>${s.name}</td><td>${s.father}</td>
                </tr>`;
            });
            
            html += `</table>
            <div style="margin-top:20px;">
                <button id="promoteBtn" class="btn-primary btn-promote">Promote Selected Students</button>
            </div>`;
            
            displayArea.innerHTML = html;
        }

        // Select All
        if (e.target.id === 'selectAll') {
            document.querySelectorAll('.studentCheck').forEach(cb => cb.checked = e.target.checked);
        }

        // Promote Logic
        if (e.target.id === 'promoteBtn') {
            const selected = document.querySelectorAll('.studentCheck:checked');
            const ids = Array.from(selected).map(cb => cb.value);
            
            if (ids.length === 0) return alert("कृपया कम से कम एक छात्र को चुनें!");
            
            if (confirm(`क्या आप ${ids.length} छात्रों को प्रमोट करना चाहते हैं?`)) {
                e.target.innerText = "Processing...";
                const res = await promoteSelectedStudent(ids);
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
