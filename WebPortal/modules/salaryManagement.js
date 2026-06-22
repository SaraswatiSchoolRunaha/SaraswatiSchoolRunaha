import { sheetUrls } from './config.js';

function getContainer() {
return document.getElementById('contentArea');
}

function renderPage(title, content) {
const container = getContainer();


if (!container) {
    console.error("contentArea not found");
    return;
}

container.innerHTML = 
    <style>
        .salary-page {
            animation: fadeIn .3s ease;
        }

        @keyframes fadeIn {
            from { opacity:0; transform:translateY(10px); }
            to { opacity:1; transform:translateY(0); }
        }

        .salary-card {
            border: none;
            border-radius: 18px;
            box-shadow: 0 4px 15px rgba(0,0,0,.08);
            transition: .3s;
        }

        .salary-card:hover {
            transform: translateY(-4px);
        }

        .salary-stat {
            font-size: 2rem;
            font-weight: 700;
        }

        .salary-header {
            background: linear-gradient(135deg,#2563eb,#1e40af);
            color: white;
            border-radius: 18px;
            padding: 20px;
            margin-bottom: 20px;
        }

        .quick-btn {
            border-radius: 12px;
            padding: 12px;
            font-weight: 600;
        }
    </style>

    <div class="container-fluid p-4 salary-page">

        <div class="salary-header">
            <h3 class="fw-bold mb-1">${title}</h3>
            <small>School Salary Management System</small>
        </div>

        ${content}

    </div>
`;

}

// ===============================
// Dashboard
// ===============================

export function loadSalaryDashboard() {
renderPage("💰 वेतन डैशबोर्ड", 
    <div class="row g-4">
        <div class="col-md-3">
            <div class="card salary-card">
                <div class="card-body text-center">
                    <h6>👨‍🏫 कुल शिक्षक</h6>
                    <div class="salary-stat" id="totalTeachers">0</div>
                </div>
            </div>
        </div>

        <div class="col-md-3">
            <div class="card salary-card">
                <div class="card-body text-center">
                    <h6>💰 कुल वेतन</h6>
                    <div class="salary-stat" id="totalSalary">₹0</div>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card salary-card">
                <div class="card-body text-center">
                    <h6>📊 देय वेतन</h6>
                    <div class="salary-stat" id="payableSalary">₹0</div>
                </div>
            </div>
        </div>

        <div class="col-md-3">
            <div class="card salary-card">
                <div class="card-body text-center">
                    <h6>⏳ भुगतान स्थिति</h6>
                    <div class="salary-stat" id="paymentStatus">--</div>
                </div>
            </div>
        </div>

    </div>
    <div class="card salary-card mt-4">
        <div class="card-body">
            <h5>⚡ Quick Actions</h5>
            <div class="d-flex flex-wrap gap-2 mt-3">
                <button class="btn btn-primary quick-btn">
                    📋 Salary Report
                </button>
                <button class="btn btn-success quick-btn">
                    💵 Payment
                </button>
                <button class="btn btn-warning quick-btn">
                    🧾 Payslip
                </button>
            </div>
        </div>
    </div>
`);
}

// ===============================
// Salary Report
// ===============================
export function loadSalaryReport() {
renderPage("📋 वेतन रिपोर्ट", `
    <div class="card salary-card">
        <div class="card-body">
            <div class="row g-3">
                <div class="col-md-4">
                    <label class="form-label">माह चुनें</label>
                    <input type="month"
                           class="form-control"
                           id="salaryMonth">
                </div>
                <div class="col-md-4">
                    <button class="btn btn-primary w-100"
                            id="generateSalaryBtn">
                        ⚙️ रिपोर्ट बनाएं
                    </button>
                </div>
            </div>
            <div id="salaryReportResult" class="mt-4">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>शिक्षक</th>
                            <th>उपस्थिति</th>
                            <th>वेतन</th>
                            <th>स्थिति</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colspan="4" class="text-center">
                                रिपोर्ट उपलब्ध नहीं
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

`);

document.getElementById("generateSalaryBtn")
    ?.addEventListener("click", async () => {
        const month =
            document.getElementById("salaryMonth").value;
        if (!month) {
            alert("कृपया माह चुनें");
            return;
        }
        document.getElementById(
            "salaryReportResult"
        ).innerHTML =
            '<div class="text-primary">Loading...</div>';
        // API CALL
        // fetch(...)
    });
}

// ===============================
// Salary Payment
// ===============================

export function loadSalaryPayment() {
renderPage("💵 वेतन भुगतान", `
    <div class="card salary-card">
        <div class="card-body">
            <div class="row g-3">
                <div class="col-md-4">
                    <label>शिक्षक</label>
                    <select class="form-select">
                        <option>Teacher Select</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <label>राशि</label>
                    <input type="number"
                           class="form-control">
                </div>
                <div class="col-md-4">
                    <label>भुगतान मोड</label>
                    <select class="form-select">
                        <option>Cash</option>
                        <option>UPI</option>
                        <option>Bank</option>
                    </select>
                </div>
            </div>
            <button class="btn btn-success mt-3">
                💾 Payment Save
            </button>
        </div>
    </div>
`);
}
// ===============================
// Payslip
// ===============================

export function loadPayslip() {
renderPage("🧾 पेस्लिप", `
    <div class="card salary-card">
        <div class="card-body">
            <div id="payslipArea">
                <h4 class="text-center">
                    Saraswati School Runaha
                </h4>
                <hr>
                <p><b>Teacher:</b> __________</p>
                <p><b>Month:</b> __________</p>

                <table class="table">
                    <tr>
                        <td>Basic Salary</td>
                        <td>₹0</td>
                    </tr>
                    <tr>
                        <td>Present Days</td>
                        <td>0</td>
                    </tr>
                    <tr>
                        <td>Net Salary</td>
                        <td>₹0</td>
                    </tr>
                </table>
            </div>
            <button class="btn btn-primary"
                    onclick="window.print()">
                🖨️ Print Payslip
            </button>
        </div>
    </div>
`);
}
