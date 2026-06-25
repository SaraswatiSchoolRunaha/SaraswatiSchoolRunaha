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
    const className = document.getElementById('classSelect').value;
    const medium = document.getElementById('mediumSelect').value;
    const contentArea = document.getElementById('contentArea');

    // 1. लोडिंग स्टेट दिखाएं
    contentArea.innerHTML = `<div style="padding:20px;">Loading students, please wait...</div>`;

    try {
        const students = await getStudentsByFilter(className, medium);

        if (!students || students.length === 0) {
            contentArea.innerHTML = `<div style="padding:20px;">कोई छात्र नहीं मिला!</div>`;
            return;
        }

        // 2. HTML स्ट्रक्चर तैयार करें
        let html = `
        <table class="student-table" style="width:100%; border-collapse: collapse;">
            <tr style="background:#f1f5f9;">
                <th style="padding:10px;"><input type="checkbox" id="selectAll"></th>
                <th style="padding:10px;">ID</th>
                <th style="padding:10px;">Session</th>
                <th style="padding:10px;">Name</th>
                <th style="padding:10px;">Father's Name</th>
            </tr>`;

        students.forEach(s => {
            html += `<tr>
                <td style="text-align:center;"><input type="checkbox" class="studentCheck" value="${s.id}"></td>
                <td style="text-align:center;">${s.id}</td>
                <td>${s.session}</td>
                <td>${s.name}</td>
                <td>${s.father}</td>
            </tr>`;
        });
        
        html += `</table>
        <div style="margin-top:20px;">
            <button id="promoteBtn" class="btn-primary" style="padding:10px 20px; cursor:pointer;">Promote Selected Students</button>
        </div>`;

        contentArea.innerHTML = html;

        // 3. 'Select All' चेकबॉक्स का लॉजिक
        document.getElementById('selectAll').addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.studentCheck');
            checkboxes.forEach(cb => cb.checked = this.checked);
        });

        // 4. 'Promote' बटन का लॉजिक
        document.getElementById('promoteBtn').addEventListener('click', async () => {
            const selected = document.querySelectorAll('.studentCheck:checked');
            const ids = Array.from(selected).map(cb => cb.value);

            if (ids.length === 0) return alert("कृपया कम से कम एक छात्र को चुनें!");

            if (!confirm(`क्या आप वाकई ${ids.length} छात्रों को प्रमोट करना चाहते हैं?`)) return;

            // बटन को डिसेबल करें ताकि डबल क्लिक न हो
            const btn = document.getElementById('promoteBtn');
            btn.innerText = "Processing...";
            btn.disabled = true;

            const res = await promoteSelectedStudent(ids);
            
            if (res.status === "success") {
                alert("सफलतापूर्वक प्रमोट किया गया!");
                renderStudentList(); // लिस्ट रीफ्रेश करें
            } else {
                alert("एरर: " + (res.message || "Something went wrong"));
                btn.innerText = "Promote Selected";
                btn.disabled = false;
            }
        });

    } catch (err) {
        contentArea.innerHTML = `<div style="color:red; padding:20px;">डेटा लोड करने में समस्या: ${err.message}</div>`;
    }
}
