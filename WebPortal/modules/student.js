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
