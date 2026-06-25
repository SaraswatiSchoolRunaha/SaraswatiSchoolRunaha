import { sheetUrls } from './main.js';

// 1. फ़िल्टर फंक्शन (इसे बदलने की जरूरत नहीं है)
export async function getStudentsByFilter(className, medium) {
    const url = `${sheetUrls['Database']}?action=filter&class=${className}&medium=${medium}`;
    const response = await fetch(url);
    return await response.json();
}

// 2. प्रमोट फंक्शन (no-cors हटा दिया गया है)
export async function promoteSelectedStudents(studentIds) {
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
    
    const students = await getStudentsByFilter(className, medium);
    
    let html = `<table>
        <tr><th><input type="checkbox" id="selectAll"></th><th>Student ID</th><th>Session</th><th>Name</th><th>Father's Name</th></tr>`;
    
    students.forEach(s => {
        html += `<tr>
            <td><input type="checkbox" class="studentCheck" value="${s.id}"></td>
            <td>${s.id}</td><td>${s.session}</td><td>${s.name}</td><td>${s.father}</td>
        </tr>`;
    });
    html += `</table> <button id="promoteBtn">Promote Selected</button>`;
    
    document.getElementById('contentArea').innerHTML = html;

    // बटन क्लिक इवेंट
    document.getElementById('promoteBtn').addEventListener('click', async () => {
        const checkboxes = document.querySelectorAll('.studentCheck:checked');
        const ids = Array.from(checkboxes).map(cb => cb.value);

        if (ids.length === 0) return alert("कम से कम एक छात्र चुनें!");

        const res = await promoteSelectedStudents(ids);
        if (res.status === "success") {
            alert("सफलतापूर्वक प्रमोट किया गया!");
            renderStudentList(); // लिस्ट रीफ्रेश करें
        } else {
            alert("एरर: " + res.message);
        }
    });
}
