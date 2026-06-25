import { sheetUrls, translations, state } from './config.js';


// 1. फ़िल्टर फंक्शन (इसे बदलने की जरूरत नहीं है)
export async function getStudentsByFilter(className, medium) {
    const url = `${sheetUrls['Database']}?action=filter&class=${className}&medium=${medium}`;
    const response = await fetch(url);
    return await response.json();
}

// 2. प्रमोट फंक्शन (no-cors हटा दिया गया है)
export async function promoteSelectedStudent (studentIds) {
    const url = sheetUrls['Database'];
    const response = await fetch(url, {
        method: 'POST',
        headers: { "Content-Type": "application/json" }, // हेडर जोड़ना जरूरी है
        body: JSON.stringify({ action: 'bulkPromote', ids: studentIds })
    });
    return await response.json();
}

// 3. Main Dashboard रेंडरिंग और बटन हैंडलर
export async function renderStudentList() {
    const contentArea = document.getElementById('contentArea');

    // 1. फिल्टर बार का HTML रेंडर करें
    contentArea.innerHTML = `
    <div id="filterBar" style="padding:15px; background:#f1f5f9; border-radius:8px; margin-bottom:20px;">
        <select id="classSelect" style="padding:8px; margin-right:10px;">
            <option value="Nursery">Nursery</option>
            <option value="KG1">KG1</option>
            <option value="1">1</option>
            <option value="2">2</option>
        </select>
        <select id="mediumSelect" style="padding:8px; margin-right:10px;">
            <option value="Hindi">Hindi</option>
            <option value="English">English</option>
        </select>
        <button id="loadListBtn" class="btn-primary" style="padding:8px 20px; cursor:pointer;">Load List</button>
    </div>
    <div id="studentDisplayArea"></div>`; // लिस्ट इस एरिया में आएगी

    // 2. पूरे contentArea पर क्लिक मॉनिटर करें (Event Delegation)
    contentArea.onclick = async (e) => {
        
        // जब 'Load List' बटन क्लिक हो
        if (e.target && e.target.id === 'loadListBtn') {
            const className = document.getElementById('classSelect').value;
            const medium = document.getElementById('mediumSelect').value;
            const displayArea = document.getElementById('studentDisplayArea');
            
            displayArea.innerHTML = "Loading...";
            
            const students = await getStudentsByFilter(className, medium);
            
            if (!students || students.length === 0) {
                displayArea.innerHTML = "कोई छात्र नहीं मिला!";
                return;
            }

            let html = `
            <table class="student-table" style="width:100%; border-collapse: collapse;">
                <tr style="background:#e2e8f0;">
                    <th style="padding:10px;"><input type="checkbox" id="selectAll"></th>
                    <th style="padding:10px;">ID</th><th>Session</th><th>Name</th><th>Father's Name</th>
                </tr>`;

            students.forEach(s => {
                html += `<tr>
                    <td style="text-align:center;"><input type="checkbox" class="studentCheck" value="${s.id}"></td>
                    <td>${s.id}</td><td>${s.session}</td><td>${s.name}</td><td>${s.father}</td>
                </tr>`;
            });
            
            html += `</table>
            <div style="margin-top:20px;">
                <button id="promoteBtn" class="btn-primary" style="padding:10px 20px;">Promote Selected</button>
            </div>`;
            
            displayArea.innerHTML = html;
        }

        // 'Select All' चेकबॉक्स
        if (e.target && e.target.id === 'selectAll') {
            document.querySelectorAll('.studentCheck').forEach(cb => cb.checked = e.target.checked);
        }

        // 'Promote' बटन
        if (e.target && e.target.id === 'promoteBtn') {
            const selected = document.querySelectorAll('.studentCheck:checked');
            const ids = Array.from(selected).map(cb => cb.value);
            if (ids.length === 0) return alert("कम से कम एक छात्र चुनें!");
            
            if (confirm(`क्या आप ${ids.length} छात्रों को प्रमोट करना चाहते हैं?`)) {
                const res = await promoteSelectedStudent(ids);
                if (res.status === "success") {
                    alert("सफलतापूर्वक प्रमोट किया गया!");
                    document.getElementById('loadListBtn').click(); // लिस्ट को रिफ्रेश करें
                }
            }
        }
    };
}export async function renderStudentList() {
    const contentArea = document.getElementById('contentArea');

    // 1. फिल्टर बार का HTML रेंडर करें
    contentArea.innerHTML = `
    <div id="filterBar" style="padding:15px; background:#f1f5f9; border-radius:8px; margin-bottom:20px;">
        <select id="classSelect" style="padding:8px; margin-right:10px;">
            <option value="Nursery">Nursery</option>
            <option value="KG1">KG1</option>
            <option value="1">1</option>
            <option value="2">2</option>
        </select>
        <select id="mediumSelect" style="padding:8px; margin-right:10px;">
            <option value="Hindi">Hindi</option>
            <option value="English">English</option>
        </select>
        <button id="loadListBtn" class="btn-primary" style="padding:8px 20px; cursor:pointer;">Load List</button>
    </div>
    <div id="studentDisplayArea"></div>`; // लिस्ट इस एरिया में आएगी

    // 2. पूरे contentArea पर क्लिक मॉनिटर करें (Event Delegation)
    contentArea.onclick = async (e) => {
        
        // जब 'Load List' बटन क्लिक हो
        if (e.target && e.target.id === 'loadListBtn') {
            const className = document.getElementById('classSelect').value;
            const medium = document.getElementById('mediumSelect').value;
            const displayArea = document.getElementById('studentDisplayArea');
            
            displayArea.innerHTML = "Loading...";
            
            const students = await getStudentsByFilter(className, medium);
            
            if (!students || students.length === 0) {
                displayArea.innerHTML = "कोई छात्र नहीं मिला!";
                return;
            }

            let html = `
            <table class="student-table" style="width:100%; border-collapse: collapse;">
                <tr style="background:#e2e8f0;">
                    <th style="padding:10px;"><input type="checkbox" id="selectAll"></th>
                    <th style="padding:10px;">ID</th><th>Session</th><th>Name</th><th>Father's Name</th>
                </tr>`;

            students.forEach(s => {
                html += `<tr>
                    <td style="text-align:center;"><input type="checkbox" class="studentCheck" value="${s.id}"></td>
                    <td>${s.id}</td><td>${s.session}</td><td>${s.name}</td><td>${s.father}</td>
                </tr>`;
            });
            
            html += `</table>
            <div style="margin-top:20px;">
                <button id="promoteBtn" class="btn-primary" style="padding:10px 20px;">Promote Selected</button>
            </div>`;
            
            displayArea.innerHTML = html;
        }

        // 'Select All' चेकबॉक्स
        if (e.target && e.target.id === 'selectAll') {
            document.querySelectorAll('.studentCheck').forEach(cb => cb.checked = e.target.checked);
        }

        // 'Promote' बटन
        if (e.target && e.target.id === 'promoteBtn') {
            const selected = document.querySelectorAll('.studentCheck:checked');
            const ids = Array.from(selected).map(cb => cb.value);
            if (ids.length === 0) return alert("कम से कम एक छात्र चुनें!");
            
            if (confirm(`क्या आप ${ids.length} छात्रों को प्रमोट करना चाहते हैं?`)) {
                const res = await promoteSelectedStudent(ids);
                if (res.status === "success") {
                    alert("सफलतापूर्वक प्रमोट किया गया!");
                    document.getElementById('loadListBtn').click(); // लिस्ट को रिफ्रेश करें
                }
            }
        }
    };
}
