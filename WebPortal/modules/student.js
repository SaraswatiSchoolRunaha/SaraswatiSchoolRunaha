// student.js
import { sheetUrls } from './main.js';

// 1. Class aur Medium ke base par students dhundein
export async function getStudentsByFilter(className, medium) {
    const url = `${sheetUrls['Database']}?action=filter&class=${className}&medium=${medium}`;
    const response = await fetch(url);
    return await response.json();
}

// 2. Selected students ko promote karne ka function
export async function promoteSelectedStudents(studentIds) {
    const url = sheetUrls['Database'];
    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({ action: 'bulkPromote', ids: studentIds })
    });
    return await response.json();
}

// Main dashboard file mein
async function renderStudentList() {
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
    html += `</table> <button onclick="processBulkPromotion()">Promote Selected</button>`;
    
    document.getElementById('contentArea').innerHTML = html;
}
