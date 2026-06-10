let lastData = null; // Global cache for student database

function showDashboard() {
    document.getElementById('pageTitle').innerText = translations[currentLang]['डैशबोर्ड'];
    document.getElementById('contentArea').innerHTML = `
        <div id="dashboardResults">
            <div style="text-align:center; padding:40px; color:#1e3a8a;">
                <i class="fa-solid fa-spinner fa-spin"></i> डेटा लोड हो रहा है...
            </div>
        </div>`;

    fetch(sheetUrls['Database'] + "?action=getDashboard")
        .then(response => {
            if (!response.ok) throw new Error("Server Response Error");
            return response.json();
        })
        .then(data => {
            if (!Array.isArray(data) || data.length === 0) {
                document.getElementById('dashboardResults').innerHTML = "<div style='padding:20px;color:red;'>कोई डेटा नहीं मिला।</div>";
                return;
            }

            lastData = data;
            let classCount = {};
            data.forEach(student => {
                const cls = student.Class || student.class || "N/A";
                classCount[cls] = (classCount[cls] || 0) + 1;
            });

            const html = `
                <div style="display:flex; gap:20px; margin-bottom:20px; flex-wrap:wrap;">
                    <div style="background:#1e3a8a; color:white; padding:20px; border-radius:12px; flex:1;">
                        <div>कुल छात्र</div><div style="font-size:32px; font-weight:700;">${data.length}</div>
                    </div>
                    <div style="background:#334155; color:white; padding:20px; border-radius:12px; flex:1;">
                        <div>कुल कक्षाएं</div><div style="font-size:32px; font-weight:700;">${Object.keys(classCount).length}</div>
                    </div>
                </div>
                <table>
                    <thead><tr><th>कक्षा</th><th>कुल छात्र</th></tr></thead>
                    <tbody>
                        ${Object.keys(classCount).map(cls => `
                            <tr style="cursor:pointer" onclick="showClassList('${cls}')">
                                <td>${cls}</td><td>${classCount[cls]}</td>
                            </tr>`).join('')}
                    </tbody>
                </table>`;
            document.getElementById('dashboardResults').innerHTML = html;
        })
        .catch(error => {
            document.getElementById('dashboardResults').innerHTML = `<div style="color:red; padding:20px;">त्रुटि: ${error.message}</div>`;
        });
}

function showClassList(cls) {
    let filtered = lastData.filter(item => (item['class'] || 'N/A') === cls);
    let headers = Object.keys(filtered[0]);
    let html = `<button onclick="showDashboard()" class="btn-action">← वापस</button><table><tr>` 
                + headers.map(h => `<th>${h}</th>`).join('') + `</tr>`;
    filtered.forEach(row => {
        html += "<tr>" + headers.map(h => `<td>${row[h]}</td>`).join('') + "</tr>";
    });
    document.getElementById('contentArea').innerHTML = html + "</table>";
}
