import { sheetUrls } from './config.js';

// salaryManagement.js

export function loadSalaryDashboard() {
    const container = document.getElementById('contentArea');

    container.innerHTML = `
        <div class="container-fluid p-4">
            <h3 class="fw-bold mb-4">💰 वेतन डैशबोर्ड</h3>

            <div class="row g-3">

                <div class="col-md-3">
                    <div class="card shadow-sm border-0">
                        <div class="card-body text-center">
                            <h6>कुल शिक्षक</h6>
                            <h2 id="totalTeachers">0</h2>
                        </div>
                    </div>
                </div>

                <div class="col-md-3">
                    <div class="card shadow-sm border-0">
                        <div class="card-body text-center">
                            <h6>कुल मासिक वेतन</h6>
                            <h2 id="totalSalary">₹0</h2>
                        </div>
                    </div>
                </div>

                <div class="col-md-3">
                    <div class="card shadow-sm border-0">
                        <div class="card-body text-center">
                            <h6>देय वेतन</h6>
                            <h2 id="payableSalary">₹0</h2>
                        </div>
                    </div>
                </div>

                <div class="col-md-3">
                    <div class="card shadow-sm border-0">
                        <div class="card-body text-center">
                            <h6>भुगतान स्थिति</h6>
                            <h2 id="paymentStatus">--</h2>
                        </div>
                    </div>
                </div>

            </div>

            <div class="card mt-4 shadow-sm border-0">
                <div class="card-body">
                    <h5>📊 वेतन प्रबंधन प्रणाली</h5>
                    <p class="text-muted mb-0">
                        यहाँ से वेतन रिपोर्ट, भुगतान और पेस्लिप प्रबंधन किया जाएगा।
                    </p>
                </div>
            </div>
        </div>
    `;
}

export function loadSalaryReport() {
    const container = document.getElementById('contentArea');

    container.innerHTML = `
        <div class="container-fluid p-4">

            <h3 class="fw-bold mb-4">📋 वेतन रिपोर्ट</h3>

            <div class="card shadow-sm border-0">
                <div class="card-body">

                    <div class="row g-3 align-items-end">

                        <div class="col-md-4">
                            <label class="form-label">माह चुनें</label>
                            <input type="month" class="form-control" id="salaryMonth">
                        </div>

                        <div class="col-md-4">
                            <button class="btn btn-primary w-100" id="generateSalaryBtn">
                                ⚙️ वेतन रिपोर्ट बनाएं
                            </button>
                        </div>

                    </div>

                    <div id="salaryReportResult" class="mt-4"></div>

                </div>
            </div>

        </div>
    `;
}

export function loadSalaryPayment() {
    const container = document.getElementById('contentArea');

    container.innerHTML = `
        <div class="container-fluid p-4">

            <h3 class="fw-bold mb-4">💵 वेतन भुगतान</h3>

            <div class="card shadow-sm border-0">
                <div class="card-body">

                    <p class="text-muted">
                        यहाँ शिक्षक का वेतन भुगतान रिकॉर्ड किया जाएगा।
                    </p>

                </div>
            </div>

        </div>
    `;
}

export function loadPayslip() {
    const container = document.getElementById('contentArea');

    container.innerHTML = `
        <div class="container-fluid p-4">

            <h3 class="fw-bold mb-4">🧾 पेस्लिप</h3>

            <div class="card shadow-sm border-0">
                <div class="card-body">

                    <p class="text-muted">
                        यहाँ शिक्षक की पेस्लिप जनरेट और प्रिंट की जाएगी।
                    </p>

                </div>
            </div>

        </div>
    `;
}
