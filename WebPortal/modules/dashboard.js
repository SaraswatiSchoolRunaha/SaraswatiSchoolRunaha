import { sheetUrls, translations, state } from './config.js';

export function showDashboard() {
    const pageTitle = document.getElementById('pageTitle');
    const contentArea = document.getElementById('contentArea');
    
    if (pageTitle) pageTitle.innerText = translations[state.currentLang]['डैशबोर्ड'];
    
    contentArea.innerHTML = `
        <div id="dashboardResults">
            <div style="text-align:center; padding:50px; color:#1e3a8a; font-weight:bold;">
                <i class="fa-solid fa-spinner fa-spin fa-2xl"></i><br><br>मास्टर डेटाबेस लोड हो रहा है...
            </div>
        </div>`;

    fetch(sheetUrls['Database'] + "?action=getDashboard")
        .then(response => {
            if (!response.ok) throw new Error("डेटाबेस कनेक्शन एरर!");
            return response.json();
        })
        .then(data => {
            if (!Array.isArray(data) || data.length === 0) {
                document.getElementById('dashboardResults').innerHTML = "<div style='padding:20px;color:red;font-weight:bold;'>कोई छात्र रिकॉर्ड नहीं मिल सका।</div>";
                return;
            }

            state.lastData = data;
            let classCount = {};
            data.forEach(student => {
                const cls = String(student.Class || student.class || "N/A").trim();
                classCount[cls] = (classCount[cls] || 0) + 1;
            });

            const totalStudents = data.length;
            const totalClasses = Object.keys(classCount).length;

            // Updated UI for Dashboard
            let html = `
                <div style="display: flex; gap: 15px; width: 100%; margin-bottom: 25px; flex-wrap: wrap;">
                    <div style="background:#1e3a8a; color:white; padding:20px; border-radius:12px; flex: 1; min-width: 250px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                        <div style="font-size:14px; text-transform:uppercase; opacity:0.9; font-weight:bold;">📊 कुल पंजीकृत छात्र</div>
                        <div style="font-size:36px; font-weight:800; margin-top:5px;">${totalStudents}</div>
                    </div>
                    <div style="background:#334155; color:white; padding:20px; border-radius:12px; flex: 1; min-width: 250px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                        <div style="font-size:14px; text-transform:uppercase; opacity:0.9; font-weight:bold;">🏫 कुल सक्रिय कक्षाएं</div>
                        <div style="font-size:36px; font-weight:800; margin-top:5px;">${totalClasses}</div>
                    </div>
                </div>
                
                <h3 style="color:#1e3a8a; margin-bottom:15px; padding-top:10px; border-top:2px dashed #e2e8f0;">📊 कक्षा अनुसार छात्र विवरण</h3>
                <table style="width:100%; border-collapse: collapse; border-radius:8px; overflow:hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <thead>
                        <tr style="background:#1e3a8a; color:white;">
                            <th style="padding:15px; text-align:left;">Class</th>
                            <th style="padding:15px; text-align:right;">Total Students</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.keys(classCount).map(cls => {
                            const safeId = btoa(encodeURIComponent(cls)).replace(/=/g, "");
                            return `
                            <tr style="cursor:pointer; background:#ffffff; transition:0.2s;" id="row_cls_${safeId}" 
                            onmouseover="this.style.background='#f1f5f9'" 
                            onmouseout="this.style.background='#ffffff'">
            
                        <td style="padding:15px; border-bottom:1px solid #e2e8f0; font-weight:bold; color:#1e3a8a;">
                        <i class="fa-solid fa-folder-open" style="margin-right:8px;"></i> Class ${cls}
                        </td>
            
                        <td style="padding:15px; border-bottom:1px solid #e2e8f0; text-align:right;">
                        <span style="background:#dbeafe; padding:5px 12px; border-radius:15px; color:#1e40af; font-weight:bold;">
                         ${classCount[cls]} Students
                        </span>
                        </td>
                        </tr>`;
                        }).join('')}
                    </tbody>
                </table>`;

            document.getElementById('dashboardResults').innerHTML = html;

            Object.keys(classCount).forEach(cls => {
                const safeId = btoa(encodeURIComponent(cls)).replace(/=/g, "");
                const rowElement = document.getElementById(`row_cls_${safeId}`);
                if (rowElement) {
                    rowElement.addEventListener('click', () => showClassList(cls));
                }
            });
        })
        .catch(error => {
            document.getElementById('dashboardResults').innerHTML = `<div style="color:red; padding:20px; font-weight:bold;">⚠️ त्रुटि: ${error.message}</div>`;
        });
}

function showClassList(cls) {
    if (!state.lastData || state.lastData.length === 0) return;
    
    let filtered = state.lastData.filter(item => String(item['Class'] || item['class'] || '').trim() === String(cls).trim());
    let headers = Object.keys(filtered[0] || {});
    
    let html = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; flex-wrap:wrap; gap:10px;">
            <h3 style="color:#1e3a8a; margin:0; font-weight:bold;">📋 Class ${cls} Student List (${filtered.length})</h3>
            <button id="btnBackToDashboard" style="background:#1e3a8a; color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer; font-weight:bold;"><i class="fa-solid fa-arrow-left"></i> वापस डैशबोर्ड</button>
        </div>
        <div style="overflow-x:auto; border:1px solid #e2e8f0; border-radius:8px; background:#fff;">
            <table style="width:100%; border-collapse: collapse; text-align:left; font-size:14px;">
                <thead>
                    <tr style="background:#f1f5f9; color:#1e3a8a;">
                        ${headers.map(h => `<th style="padding:12px; border-bottom:2px solid #e2e8f0;">${h}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${filtered.map(row => `<tr>${headers.map(h => `<td style="padding:12px; border-bottom:1px solid #e2e8f0;">${row[h] || ''}</td>`).join('')}</tr>`).join('')}
                </tbody>
            </table>
        </div>`;
    
    document.getElementById('contentArea').innerHTML = html;
    document.getElementById('btnBackToDashboard').addEventListener('click', showDashboard);
}
