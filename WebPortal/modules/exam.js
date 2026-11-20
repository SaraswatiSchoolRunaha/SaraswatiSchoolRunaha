import { sheetUrls, translations, state } from './config.js';
import { showDashboard } from './dashboard.js';

const EXAM_CLASSES = ["Nursery", "KG1", "KG2", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
const EXAM_SESSIONS = ["2026-27", "2025-26", "2027-28"];
const EXAM_TYPES = [
    { value: "T", label: "Terminal (T)" },
    { value: "H", label: "Half-Yearly (H)" },
    { value: "A", label: "Annual (A)" }
];
const EXAM_SUBJECTS = ["HINDI", "ENGLISH", "SANSKRIT", "MATHS", "SCIENCE", "SO-SCIENCE", "ENVS", "GK"];

function normHeaderKey(k) {
    return String(k || "")
        .trim()
        .replace(/\s+/g, ".")
        .replace(/\.+/g, ".")
        .toUpperCase();
}

function getScholarNo(student) {
    return String(
        student["REG.SCHOLOR.NO"] ||
        student["REG.SCHOLOR.NO."] ||
        student["Reg. Scholor. No"] ||
        student["Student ID"] ||
        ""
    ).trim();
}

function getStudentName(student) {
    return student["STUDENT.NAME"] || student["Student Name"] || student["Name"] || "-";
}

function getFatherName(student) {
    return student["FATHER.NAME"] || student["Father Name"] || "-";
}

function getRollNo(student) {
    return student["ROLL.NO."] || student["ROLL.NO"] || student["ROLL NO."] || "-";
}

function getSubjectValue(student, exam, component, subject) {
    const keys = [
        normHeaderKey(`${exam}.${component}.${subject}`),
        normHeaderKey(`${exam}.${subject}`),
        normHeaderKey(`${exam}.TOTAL.${subject}`)
    ];
    for (const k of keys) {
        if (student[k] !== undefined && student[k] !== "") return student[k];
    }
    return "";
}

function getMaxValue(student, subject) {
    const val = student[normHeaderKey(`MAX.${subject}`)];
    return val !== undefined && val !== "" ? Number(val) : null;
}

// ==========================================
// 1. EXAM MARKS ENTRY (पूरी कक्षा के अंक भरें)
// ==========================================
export function showExamMarksEntry() {
    document.getElementById("contentArea").innerHTML = `
        <div>
            <h2 style="color:#1e3a8a; margin-top:0;">
                <i class="fa-solid fa-file-pen"></i> परीक्षा अंक प्रविष्टि (Exam Marks Entry)
            </h2>

            <div style="display:flex; gap:10px; flex-wrap:wrap; background:#f8fafc; padding:15px; margin-bottom:12px; align-items:flex-end; border-radius:8px; border:1px solid #e2e8f0;">
                <div style="flex:1; min-width:130px;">
                    <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:4px;">शैक्षणिक सत्र</label>
                    <select id="examEntrySession" style="width:100%; height:40px; border:1px solid #cbd5e1; border-radius:6px; padding:0 8px;">
                        ${EXAM_SESSIONS.map(s => `<option value="${s}">${s}</option>`).join('')}
                    </select>
                </div>

                <div style="flex:1; min-width:130px;">
                    <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:4px;">कक्षा</label>
                    <select id="examEntryClass" style="width:100%; height:40px; border:1px solid #cbd5e1; border-radius:6px; padding:0 8px;">
                        <option value="">-- कक्षा चुनें --</option>
                        ${EXAM_CLASSES.map(c => `<option value="${c}">${c}</option>`).join('')}
                    </select>
                </div>

                <div style="flex:1; min-width:140px;">
                    <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:4px;">परीक्षा</label>
                    <select id="examEntryType" style="width:100%; height:40px; border:1px solid #cbd5e1; border-radius:6px; padding:0 8px;">
                        ${EXAM_TYPES.map(e => `<option value="${e.value}">${e.label}</option>`).join('')}
                    </select>
                </div>

                <div style="flex:1; min-width:140px;">
                    <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:4px;">विषय</label>
                    <select id="examEntrySubject" style="width:100%; height:40px; border:1px solid #cbd5e1; border-radius:6px; padding:0 8px;">
                        ${EXAM_SUBJECTS.map(sub => `<option value="${sub}">${sub}</option>`).join('')}
                    </select>
                </div>

                <div style="flex:1; min-width:120px;">
                    <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:4px;">अंक प्रकार</label>
                    <select id="examEntryComponent" style="width:100%; height:40px; border:1px solid #cbd5e1; border-radius:6px; padding:0 8px;">
                        <option value="TOTAL">TOTAL</option>
                        <option value="TH">TH (Theory)</option>
                        <option value="PR">PR (Practical)</option>
                    </select>
                </div>

                <button id="btnLoadExamStudents"
                    style="height:40px; padding:0 20px; background:#1e3a8a; color:white; border:none; border-radius:6px; cursor:pointer; font-weight:bold;">
                    🔍 छात्र लोड करें
                </button>
            </div>

            <div id="examEntryContainer" style="margin-top:15px;">
                <p style="text-align:center; color:#64748b;">कृपया सत्र, कक्षा, परीक्षा और विषय चुनकर "छात्र लोड करें" दबाएँ</p>
            </div>
        </div>
    `;

    document.getElementById("btnLoadExamStudents").addEventListener("click", loadStudentsForMarksEntry);
}

async function loadStudentsForMarksEntry() {
    const session = document.getElementById("examEntrySession").value;
    const cls = document.getElementById("examEntryClass").value;
    const exam = document.getElementById("examEntryType").value;
    const subject = document.getElementById("examEntrySubject").value;
    const component = document.getElementById("examEntryComponent").value;
    const container = document.getElementById("examEntryContainer");

    if (!cls) {
        container.innerHTML = "<p style='color:red; font-weight:bold;'>कृपया कक्षा चुनें!</p>";
        return;
    }

    container.innerHTML = `<p style="text-align:center;"><i class="fa-solid fa-spinner fa-spin"></i> सत्र ${session} का डेटा लोड हो रहा है...</p>`;

    try {
        const url = `${sheetUrls['Exam']}?action=getExamStudents&session=${encodeURIComponent(session)}&class=${encodeURIComponent(cls)}`;
        const res = await fetch(url);
        const data = await res.json();
        const students = Array.isArray(data) ? data : (data.students || []);

        if (!students.length) {
            container.innerHTML = `<p style='color:red; text-align:center;'>सत्र ${session} की कक्षा ${cls} में कोई छात्र नहीं मिला।</p>`;
            return;
        }

        renderMarksEntryGrid(students, { session, cls, exam, subject, component });
    } catch (err) {
        console.error(err);
        container.innerHTML = "<p style='color:red; text-align:center;'>डेटा लोड करने में त्रुटि हुई।</p>";
    }
}

function renderMarksEntryGrid(students, meta) {
    const container = document.getElementById("examEntryContainer");

    let html = `
        <div style="background:#eff6ff; padding:10px 14px; border-radius:6px; margin-bottom:10px; font-size:13px; color:#1e3a8a; font-weight:600;">
            सत्र: ${meta.session} | कक्षा: ${meta.cls} | परीक्षा: ${meta.exam} | विषय: ${meta.subject} (${meta.component})
        </div>

        <div style="overflow-x:auto; border-radius:8px; box-shadow:0 4px 6px -1px rgb(0 0 0 / 0.1);">
            <table style="width:100%; border-collapse:collapse; background:white; font-family:sans-serif;">
                <thead>
                    <tr style="background:#1e3a8a; color:white; text-align:left;">
                        <th style="padding:12px;">Scholar No</th>
                        <th style="padding:12px;">Roll No</th>
                        <th style="padding:12px;">छात्र का नाम</th>
                        <th style="padding:12px;">पिता का नाम</th>
                        <th style="padding:12px;">MAX अंक</th>
                        <th style="padding:12px;">अंक (${meta.exam}.${meta.component}.${meta.subject})</th>
                        <th style="padding:12px;">स्थिति</th>
                    </tr>
                </thead>
                <tbody>
    `;

    students.forEach(st => {
        const scholarNo = getScholarNo(st);
        const currentVal = getSubjectValue(st, meta.exam, meta.component, meta.subject);
        const maxVal = getMaxValue(st, meta.subject);
        const isLocked = String(st["VERIFIED"] || st["Verified"] || "").trim().toUpperCase() === "YES";

        html += `
            <tr style="border-bottom:1px solid #e2e8f0; background:${isLocked ? '#fef2f2' : 'white'};">
                <td style="padding:10px;">${scholarNo}</td>
                <td style="padding:10px;">${getRollNo(st)}</td>
                <td style="padding:10px; font-weight:600;">${getStudentName(st)}</td>
                <td style="padding:10px;">${getFatherName(st)}</td>
                <td style="padding:10px; font-weight:bold; color:#1e3a8a;">${maxVal !== null ? maxVal : '-'}</td>
                <td style="padding:10px;">
                    <input type="number"
                        class="examMarkInput"
                        data-scholar="${scholarNo}"
                        data-max="${maxVal !== null ? maxVal : ''}"
                        value="${currentVal}"
                        step="any"
                        min="0"
                        ${maxVal !== null ? `max="${maxVal}"` : ''}
                        ${isLocked ? 'disabled' : ''}
                        style="width:100px; padding:6px 8px; border:1px solid #cbd5e1; border-radius:4px;">
                </td>
                <td style="padding:10px;">
                    ${isLocked
                        ? '<span style="background:#fee2e2; color:#991b1b; padding:3px 8px; border-radius:4px; font-size:12px; font-weight:bold;">Locked</span>'
                        : '<span style="background:#dcfce7; color:#166534; padding:3px 8px; border-radius:4px; font-size:12px; font-weight:bold;">Open</span>'}
                </td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>

        <div style="margin-top:16px; display:flex; flex-wrap:wrap; gap:12px; justify-content:center; align-items:center;">
            <input type="text" id="entryTeacherName" placeholder="शिक्षक का नाम लिखें"
                style="height:42px; padding:0 12px; border:1px solid #cbd5e1; border-radius:6px; min-width:220px;">
            <button id="btnSaveBatchMarks"
                style="height:42px; padding:0 28px; background:#10b981; color:white; border:none; border-radius:6px; font-size:15px; cursor:pointer; font-weight:bold;">
                <i class="fa-solid fa-save"></i> सभी अंक सुरक्षित करें
            </button>
        </div>
    `;

    container.innerHTML = html;

    document.getElementById("btnSaveBatchMarks").addEventListener("click", () => {
        saveBatchExamMarks(students, meta);
    });
}

async function saveBatchExamMarks(students, meta) {
    const teacherName = document.getElementById("entryTeacherName")?.value.trim();
    if (!teacherName) {
        alert("⚠️ कृपया शिक्षक का नाम दर्ज करें!");
        return;
    }

    const inputs = document.querySelectorAll(".examMarkInput:not([disabled])");
    const records = [];
    let hasError = false;

    inputs.forEach(inp => {
        const valStr = inp.value.trim();
        if (valStr === "") return;

        const numVal = Number(valStr);
        const maxAttr = inp.getAttribute("data-max");
        const maxVal = maxAttr !== "" ? Number(maxAttr) : null;

        if (isNaN(numVal) || numVal < 0 || (maxVal !== null && numVal > maxVal)) {
            inp.style.border = "2px solid red";
            hasError = true;
            return;
        }

        inp.style.border = "1px solid #cbd5e1";
        records.push({
            regScholarNo: inp.getAttribute("data-scholar"),
            newMarks: numVal
        });
    });

    if (hasError) {
        alert("⚠️ कुछ अंक MAX सीमा से अधिक या गलत हैं। लाल बॉक्स की जाँच करें!");
        return;
    }

    if (!records.length) {
        alert("⚠️ सेव करने के लिए कम से कम एक छात्र के अंक भरें!");
        return;
    }

    const btn = document.getElementById("btnSaveBatchMarks");
    btn.disabled = true;
    btn.innerText = "⏳ सेव हो रहा है...";

    try {
        const res = await fetch(sheetUrls['Exam'], {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({
                action: "saveBatchMarks",
                session: meta.session,
                class: meta.cls,
                exam: meta.exam,
                subject: meta.subject,
                component: meta.component,
                changedBy: teacherName,
                records: records
            })
        });

        const result = await res.json();
        if (result.status === "ok" || result.status === "success") {
            alert("✔ परीक्षा अंक सफलतापूर्वक सुरक्षित हो गए!");
            if (typeof showDashboard === "function") showDashboard();
        } else {
            alert("❌ सेव विफल: " + (result.message || "अज्ञात त्रुटि"));
        }
    } catch (err) {
        alert("नेटवर्क त्रुटि: " + err.message);
    } finally {
        btn.disabled = false;
        btn.innerText = "सभी अंक सुरक्षित करें";
    }
}

// ==========================================
// 2. EXAM MARKS CORRECTION (अंक सुधार पोर्टल)
// ==========================================
export function showExamMarksCorrection() {
    document.getElementById("contentArea").innerHTML = `
        <div style="max-width:1050px; margin:10px auto; font-family:sans-serif;">
            <div style="background:#ffffff; padding:20px; border-radius:10px; box-shadow:0 4px 6px rgba(0,0,0,0.08); margin-bottom:18px; border:1px solid #e2e8f0;">
                <h2 style="color:#1e3a8a; margin-top:0;">
                    <i class="fa-solid fa-pen-to-square"></i> परीक्षा अंक सुधार पोर्टल (Audit Log सहित)
                </h2>

                <div style="display:flex; flex-wrap:wrap; gap:12px; align-items:flex-end;">
                    <div style="flex:1 1 140px;">
                        <label style="display:block; font-size:12px; font-weight:bold; color:#475569; margin-bottom:4px;">शैक्षणिक सत्र</label>
                        <select id="corrSession" style="width:100%; height:40px; border:1px solid #cbd5e1; border-radius:6px; padding:0 8px;">
                            ${EXAM_SESSIONS.map(s => `<option value="${s}">${s}</option>`).join('')}
                        </select>
                    </div>

                    <div style="flex:1 1 140px;">
                        <label style="display:block; font-size:12px; font-weight:bold; color:#475569; margin-bottom:4px;">कक्षा</label>
                        <select id="corrClass" style="width:100%; height:40px; border:1px solid #cbd5e1; border-radius:6px; padding:0 8px;">
                            <option value="">-- कक्षा --</option>
                            ${EXAM_CLASSES.map(c => `<option value="${c}">${c}</option>`).join('')}
                        </select>
                    </div>

                    <div style="flex:1 1 140px;">
                        <label style="display:block; font-size:12px; font-weight:bold; color:#475569; margin-bottom:4px;">परीक्षा</label>
                        <select id="corrExam" style="width:100%; height:40px; border:1px solid #cbd5e1; border-radius:6px; padding:0 8px;">
                            ${EXAM_TYPES.map(e => `<option value="${e.value}">${e.label}</option>`).join('')}
                        </select>
                    </div>

                    <div style="flex:1 1 140px;">
                        <label style="display:block; font-size:12px; font-weight:bold; color:#475569; margin-bottom:4px;">विषय</label>
                        <select id="corrSubject" style="width:100%; height:40px; border:1px solid #cbd5e1; border-radius:6px; padding:0 8px;">
                            ${EXAM_SUBJECTS.map(sub => `<option value="${sub}">${sub}</option>`).join('')}
                        </select>
                    </div>

                    <div style="flex:1 1 120px;">
                        <label style="display:block; font-size:12px; font-weight:bold; color:#475569; margin-bottom:4px;">अंक प्रकार</label>
                        <select id="corrComponent" style="width:100%; height:40px; border:1px solid #cbd5e1; border-radius:6px; padding:0 8px;">
                            <option value="TOTAL">TOTAL</option>
                            <option value="TH">TH</option>
                            <option value="PR">PR</option>
                        </select>
                    </div>

                    <button id="btnSearchExamCorrection"
                        style="height:40px; background:#1e3a8a; color:white; border:none; padding:0 20px; cursor:pointer; border-radius:6px; font-weight:bold;">
                        🔍 खोजें
                    </button>
                </div>
            </div>

            <div id="examCorrectionTable"></div>
        </div>
    `;

    document.getElementById("btnSearchExamCorrection").addEventListener("click", fetchExamMarksForCorrection);
}

async function fetchExamMarksForCorrection() {
    const session = document.getElementById("corrSession").value;
    const cls = document.getElementById("corrClass").value;
    const exam = document.getElementById("corrExam").value;
    const subject = document.getElementById("corrSubject").value;
    const component = document.getElementById("corrComponent").value;
    const container = document.getElementById("examCorrectionTable");

    if (!cls) {
        alert("कृपया कक्षा चुनें!");
        return;
    }

    container.innerHTML = `<p style="text-align:center; padding:20px;">रिकॉर्ड लोड हो रहा है...</p>`;

    try {
        const url = `${sheetUrls['Exam']}?action=getExamStudents&session=${encodeURIComponent(session)}&class=${encodeURIComponent(cls)}`;
        const res = await fetch(url);
        const data = await res.json();
        const students = Array.isArray(data) ? data : (data.students || []);

        if (!students.length) {
            container.innerHTML = `<p style="color:red; text-align:center;">कोई रिकॉर्ड नहीं मिला।</p>`;
            return;
        }

        let html = `
            <div style="background:white; border-radius:10px; overflow-x:auto; box-shadow:0 4px 6px rgba(0,0,0,0.08); border:1px solid #e2e8f0;">
                <div style="padding:12px 15px; background:#f8fafc; border-bottom:1px solid #e2e8f0; display:flex; flex-wrap:wrap; gap:10px; align-items:center; justify-content:space-between;">
                    <span style="font-weight:bold; color:#1e3a8a;">सत्र: ${session} | कक्षा: ${cls} | ${exam} - ${subject} (${component})</span>
                    <input type="text" id="corrTeacherName" placeholder="सुधार करने वाले शिक्षक का नाम"
                        style="padding:7px 10px; border:1px solid #cbd5e1; border-radius:6px; min-width:220px;">
                </div>
                <table style="width:100%; border-collapse:collapse; text-align:left;">
                    <thead>
                        <tr style="background:#1e3a8a; color:white;">
                            <th style="padding:12px;">Scholar No</th>
                            <th style="padding:12px;">छात्र का नाम</th>
                            <th style="padding:12px;">पिता का नाम</th>
                            <th style="padding:12px;">पुराने अंक</th>
                            <th style="padding:12px;">MAX</th>
                            <th style="padding:12px;">नया अंक</th>
                            <th style="padding:12px;">सुधार का कारण (Reason)</th>
                            <th style="padding:12px;">Action</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        students.forEach((st, i) => {
            const scholarNo = getScholarNo(st);
            const oldMark = getSubjectValue(st, exam, component, subject);
            const maxMark = getMaxValue(st, subject);
            const locked = String(st["VERIFIED"] || st["Verified"] || "").trim().toUpperCase() === "YES";

            html += `
                <tr style="border-bottom:1px solid #f1f5f9;">
                    <td style="padding:12px;">${scholarNo}</td>
                    <td style="padding:12px;"><strong>${getStudentName(st)}</strong></td>
                    <td style="padding:12px;">${getFatherName(st)}</td>
                    <td style="padding:12px; font-weight:bold;" id="old_mk_${i}">${oldMark === "" ? "-" : oldMark}</td>
                    <td style="padding:12px;">${maxMark !== null ? maxMark : "-"}</td>
                    <td style="padding:12px;">
                        <input type="number" id="new_mk_${i}" value="${oldMark}" step="any" min="0"
                            ${maxMark !== null ? `max="${maxMark}"` : ''}
                            ${locked ? 'disabled' : ''}
                            style="width:85px; padding:6px; border:1px solid #cbd5e1; border-radius:4px;">
                    </td>
                    <td style="padding:12px;">
                        <input type="text" id="rsn_${i}" placeholder="सुधार का कारण लिखें"
                            ${locked ? 'disabled' : ''}
                            style="width:180px; padding:6px; border:1px solid #cbd5e1; border-radius:4px;">
                    </td>
                    <td style="padding:12px;">
                        ${locked
                            ? '<span style="color:#b91c1c; font-weight:bold;">Verified Lock</span>'
                            : `<button class="btn-update-exam-mark" data-scholar="${scholarNo}" data-idx="${i}"
                                style="background:#059669; color:white; border:none; padding:8px 12px; border-radius:6px; cursor:pointer; font-weight:bold;">
                                Update
                               </button>`}
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table></div>`;
        container.innerHTML = html;

        document.querySelectorAll(".btn-update-exam-mark").forEach(btn => {
            btn.addEventListener("click", function () {
                updateSingleExamMark(
                    this.getAttribute("data-scholar"),
                    this.getAttribute("data-idx"),
                    { session, exam, subject, component },
                    this
                );
            });
        });
    } catch (err) {
        container.innerHTML = "<p style='color:red; text-align:center;'>त्रुटि: डेटा लोड करने में विफलता।</p>";
    }
}

async function updateSingleExamMark(scholarNo, idx, meta, btn) {
    const newMarksVal = document.getElementById(`new_mk_${idx}`).value.trim();
    const reasonVal = document.getElementById(`rsn_${idx}`).value.trim();
    const teacherName = document.getElementById("corrTeacherName").value.trim();

    if (!teacherName) {
        alert("⚠️ ऊपर शिक्षक का नाम लिखें!");
        return;
    }
    if (newMarksVal === "" || isNaN(Number(newMarksVal)) || Number(newMarksVal) < 0) {
        alert("⚠️ सही नया अंक दर्ज करें!");
        return;
    }
    if (!reasonVal) {
        alert("⚠️ अंक सुधार का कारण (Reason) लिखना अनिवार्य है!");
        return;
    }

    btn.disabled = true;
    btn.innerText = "Saving...";

    try {
        const res = await fetch(sheetUrls['Exam'], {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({
                action: "updateSingleMark",
                session: meta.session,
                regScholarNo: scholarNo,
                exam: meta.exam,
                subject: meta.subject,
                component: meta.component,
                newMarks: Number(newMarksVal),
                reason: reasonVal,
                changedBy: teacherName
            })
        });

        const data = await res.json();
        if (data.status === "ok" || data.status === "success") {
            document.getElementById(`old_mk_${idx}`).innerText = data.newMarks;
            document.getElementById(`rsn_${idx}`).value = "";
            alert(`✔ अंक सफलतापूर्वक अपडेट हो गए! (Log ID: ${data.logId || 'Saved'})`);
        } else {
            alert("❌ अपडेट फेल: " + (data.message || "त्रुटि"));
        }
    } catch (err) {
        alert("नेटवर्क / सर्वर त्रुटि: " + err.message);
    } finally {
        btn.disabled = false;
        btn.innerText = "Update";
    }
}

// ==========================================
// 3. EXAM RESULT / MARKS REPORT PRINT
// ==========================================
export function showExamReport() {
    document.getElementById("contentArea").innerHTML = `
        <div>
            <h3 style="color:#1e3a8a; margin-top:0;">
                <i class="fa-solid fa-print"></i> परीक्षा अंक तालिका रिपोर्ट (Exam Report)
            </h3>

            <div style="display:flex; flex-wrap:wrap; gap:10px; align-items:flex-end; background:#f8fafc; padding:12px; border-radius:8px; border:1px solid #e2e8f0;">
                <div style="display:flex; flex-direction:column;">
                    <label style="font-size:12px; font-weight:bold;">शैक्षणिक सत्र</label>
                    <select id="repSession" style="height:38px; width:140px; border:1px solid #ccc; border-radius:6px;">
                        ${EXAM_SESSIONS.map(s => `<option value="${s}">${s}</option>`).join('')}
                    </select>
                </div>

                <div style="display:flex; flex-direction:column;">
                    <label style="font-size:12px; font-weight:bold;">कक्षा</label>
                    <select id="repClass" style="height:38px; width:150px; border:1px solid #ccc; border-radius:6px;">
                        <option value="">-- कक्षा चुनें --</option>
                        ${EXAM_CLASSES.map(c => `<option value="${c}">${c}</option>`).join('')}
                    </select>
                </div>

                <div style="display:flex; flex-direction:column;">
                    <label style="font-size:12px; font-weight:bold;">परीक्षा</label>
                    <select id="repExam" style="height:38px; width:160px; border:1px solid #ccc; border-radius:6px;">
                        ${EXAM_TYPES.map(e => `<option value="${e.value}">${e.label}</option>`).join('')}
                    </select>
                </div>

                <button id="btnSearchExamReport"
                    style="height:38px; padding:0 18px; background:#1e3a8a; color:white; border:none; border-radius:6px; cursor:pointer; font-weight:bold;">
                    🔍 रिपोर्ट देखें
                </button>

                <button id="btnPrintExamReport"
                    style="height:38px; padding:0 18px; background:#16a34a; color:white; border:none; border-radius:6px; cursor:pointer; font-weight:bold;">
                    🖨 प्रिंट
                </button>
            </div>

            <div id="examReportContainer" style="margin-top:15px;"></div>
        </div>
    `;

    document.getElementById("btnSearchExamReport").addEventListener("click", loadExamReportTable);
    document.getElementById("btnPrintExamReport").addEventListener("click", printExamReportWindow);
}

async function loadExamReportTable() {
    const session = document.getElementById("repSession").value;
    const cls = document.getElementById("repClass").value;
    const exam = document.getElementById("repExam").value;
    const container = document.getElementById("examReportContainer");

    if (!cls) {
        alert("कृपया कक्षा चुनें!");
        return;
    }

    container.innerHTML = "<p style='font-weight:bold; color:#1e3a8a;'>⏳ परीक्षा सूची तैयार हो रही है...</p>";

    try {
        const url = `${sheetUrls['Exam']}?action=getExamStudents&session=${encodeURIComponent(session)}&class=${encodeURIComponent(cls)}`;
        const res = await fetch(url);
        const data = await res.json();
        const students = Array.isArray(data) ? data : (data.students || []);

        if (!students.length) {
            container.innerHTML = "<p style='color:#dc2626; font-weight:bold; background:#fee2e2; padding:15px; border-radius:6px; text-align:center;'>❌ इस कक्षा का कोई रिकॉर्ड नहीं मिला।</p>";
            return;
        }

        container.innerHTML = `
            <div style="width:100%; overflow-x:auto; margin-top:12px;">
                <table style="width:100%; border-collapse:collapse; background:white; font-size:13px;">
                    <thead>
                        <tr style="background:#1e3a8a; color:white; text-align:left;">
                            <th style="padding:10px; border:1px solid #cbd5e1;">Scholar No</th>
                            <th style="padding:10px; border:1px solid #cbd5e1;">Roll No</th>
                            <th style="padding:10px; border:1px solid #cbd5e1;">छात्र का नाम</th>
                            ${EXAM_SUBJECTS.map(sub => `<th style="padding:10px; border:1px solid #cbd5e1;">${sub}</th>`).join('')}
                            <th style="padding:10px; border:1px solid #cbd5e1;">GRAND TOTAL</th>
                            <th style="padding:10px; border:1px solid #cbd5e1;">%</th>
                            <th style="padding:10px; border:1px solid #cbd5e1;">RESULT</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${students.map(st => {
                            const grandTotal = st[normHeaderKey(`${exam}.GRAND.TOTAL`)] || "-";
                            const pct = st[normHeaderKey(`${exam}.PERCENTAGE`)] || "-";
                            const resVal = st[normHeaderKey(`${exam}.RESULT`)] || "-";
                            return `
                                <tr style="border-bottom:1px solid #e2e8f0;">
                                    <td style="padding:8px 10px; border:1px solid #cbd5e1;">${getScholarNo(st)}</td>
                                    <td style="padding:8px 10px; border:1px solid #cbd5e1;">${getRollNo(st)}</td>
                                    <td style="padding:8px 10px; border:1px solid #cbd5e1; font-weight:600;">${getStudentName(st)}</td>
                                    ${EXAM_SUBJECTS.map(sub => {
                                        const m = getSubjectValue(st, exam, "TOTAL", sub);
                                        return `<td style="padding:8px 10px; border:1px solid #cbd5e1;">${m === "" ? "-" : m}</td>`;
                                    }).join('')}
                                    <td style="padding:8px 10px; border:1px solid #cbd5e1; font-weight:bold;">${grandTotal}</td>
                                    <td style="padding:8px 10px; border:1px solid #cbd5e1;">${pct}</td>
                                    <td style="padding:8px 10px; border:1px solid #cbd5e1; font-weight:bold;">${resVal}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (err) {
        container.innerHTML = "<p style='color:red;'>त्रुटि: " + err.message + "</p>";
    }
}

function printExamReportWindow() {
    const content = document.getElementById("examReportContainer").innerHTML;
    if (!content || content.includes("तैयार हो रही है") || content.includes("कोई रिकॉर्ड नहीं मिला")) {
        alert("पहले रिपोर्ट देखें बटन दबाएँ!");
        return;
    }

    const sessionVal = document.getElementById("repSession").value;
    const classVal = document.getElementById("repClass").value;
    const examVal = document.getElementById("repExam").value;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
        <html>
        <head>
            <title>Exam Report - ${classVal}</title>
            <style>
                @page { size: A4 landscape; margin: 12mm; }
                body { font-family: sans-serif; padding: 10px; }
                h2, h4 { margin: 4px 0; text-align: center; }
                p { text-align: center; font-size: 13px; }
                table { width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 12px; }
                th, td { border: 1px solid #000; padding: 6px 8px; text-align: left; }
                th { background: #f2f2f2; color: #000; }
            </style>
        </head>
        <body>
            <h2>सरस्वती बाल विद्या मंदिर हाई स्कूल, रुनाहा</h2>
            <h4>परीक्षा अंक तालिका सूची (${examVal})</h4>
            <p><strong>सत्र:</strong> ${sessionVal} | <strong>कक्षा:</strong> ${classVal}</p>
            ${content}
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}
