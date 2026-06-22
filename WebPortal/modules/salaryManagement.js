import { sheetUrls } from './config.js';

/** * UI हेल्पर फंक्शन: कंटेंट को रेंडर करने के लिए 
 */
function renderPage(title, content) {
    const container = document.getElementById('contentArea');
    if (!container) return;

    container.innerHTML = `
        <div class="container-fluid p-4 animate__animated animate__fadeIn">
            <div class="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
                <div>
                    <h3 class="fw-bold text-primary mb-0">${title}</h3>
                    <small class="text-muted">सरस्वती बाल विद्या मंदिर - वेतन प्रबंधन प्रणाली</small>
                </div>
            </div>
            ${content}
        </div>
    `;
}

// ===============================
// 1. Dashboard
// ===============================
export function loadSalaryDashboard() {
    renderPage("💰 वेतन डैशबोर्ड", `
        <div class="row g-4">
            ${statCard("कुल शिक्षक", "0", "totalTeachers", "primary")}
            ${statCard("कुल मासिक वेतन", "₹0", "totalSalary", "success")}
            ${statCard("देय वेतन", "₹0", "payableSalary", "warning")}
            ${statCard("भुगतान स्थिति", "--", "paymentStatus", "info")}
        </div>
        <div class="card mt-4 border-0 shadow-sm rounded-4">
            <div class="card-body p-4">
                <h5>⚡ क्विक एक्शन्स</h5>
                <div class="d-flex flex-wrap gap-3 mt-3">
                    <button class="btn btn-outline-primary px-4 py-2" onclick="loadSalaryReport()">📋 वेतन रिपोर्ट</button>
                    <button class="btn btn-outline-success px-4 py-2" onclick="loadSalaryPayment()">💵 वेतन भुगतान</button>
                    <button class="btn btn-outline-warning px-4 py-2" onclick="loadPayslip()">🧾 पेस्लिप</button>
                </div>
            </div>
        </div>
    `);
}

function statCard(title, val, id, color) {
    return `
        <div class="col-md-3">
            <div class="card border-0 shadow-sm rounded-4 p-3 text-center">
                <div class="card-body">
                    <h6 class="text-muted mb-2">${title}</h6>
                    <h2 class="fw-bold text-${color}" id="${id}">${val}</h2>
                </div>
            </div>
        </div>
    `;
}

// ===============================
// 2. Salary Report
// ===============================
export function loadSalaryReport() {
    renderPage("📋 वेतन रिपोर्ट", `
        <div class="card border-0 shadow-sm rounded-4 p-3">
            <div class="card-body">
                <div class="row g-3 align-items-end">
                    <div class="col-md-4">
                        <label class="form-label">माह चुनें</label>
                        <input type="month" class="form-control form-control-lg" id="salaryMonth">
                    </div>
                    <div class="col-md-4">
                        <button class="btn btn-primary btn-lg w-100" id="generateSalaryBtn">⚙️ रिपोर्ट बनाएं</button>
                    </div>
                </div>
                <div id="salaryReportResult" class="mt-4 table-responsive">
                    <table class="table table-hover align-middle">
                        <thead class="table-light">
                            <tr><th>शिक्षक</th><th>उपस्थिति</th><th>वेतन</th><th>स्थिति</th></tr>
                        </thead>
                        <tbody>
                            <tr><td colspan="4" class="text-center py-4">रिपोर्ट लोड करने के लिए माह चुनें</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `);
}

// ===============================
// 3. Salary Payment
// ===============================
export function loadSalaryPayment() {
    renderPage("💵 वेतन भुगतान", `
        <div class="card border-0 shadow-sm rounded-4 p-3">
            <div class="card-body">
                <div class="row g-3">
                    <div class="col-md-4"><label class="form-label">शिक्षक का नाम</label><select class="form-select form-select-lg"><option>शिक्षक चुनें...</option></select></div>
                    <div class="col-md-4"><label class="form-label">राशि (₹)</label><input type="number" class="form-control form-control-lg" placeholder="0.00"></div>
                    <div class="col-md-4"><label class="form-label">मोड</label><select class="form-select form-select-lg"><option>Cash</option><option>UPI</option><option>Bank</option></select></div>
                </div>
                <button class="btn btn-success btn-lg mt-4 px-5">💾 भुगतान सुरक्षित करें</button>
            </div>
        </div>
    `);
}

// ===============================
// 4. Payslip
// ===============================
export function loadPayslip() {
    renderPage("🧾 पेस्लिप", `
        <div class="card border-0 shadow-sm rounded-4 p-4" style="max-width: 600px; margin: auto;">
            <div id="payslipArea" class="text-center">
                <h4 class="fw-bold">सरस्वती बाल विद्या मंदिर, रुनहा</h4>
                <p class="text-muted">मासिक वेतन रसीद</p>
                <hr>
                <div class="text-start">
                    <p><b>शिक्षक:</b> __________</p>
                    <p><b>माह:</b> __________</p>
                    <table class="table table-bordered">
                        <tr><td>बेसिक वेतन</td><td>₹0</td></tr>
                        <tr><td>कुल कार्य दिवस</td><td>22</td></tr>
                        <tr><td>उपस्थिति</td><td>0</td></tr>
                        <tr class="table-primary"><td><b>नेट पे (Net Salary)</b></td><td><b>₹0</b></td></tr>
                    </table>
                </div>
            </div>
            <button class="btn btn-primary btn-lg mt-3" onclick="window.print()">🖨️ पेस्लिप प्रिंट करें</button>
        </div>
    `);
}
