import { state, currentUserRole, permissions, translations, icons, fetchSheetData } from './config.js';
import { showDashboard } from './dashboard.js';
import { 
    showAttendanceForm, showAttendanceDashboard, showCorrectionPortal, 
    showAbsentReport, showAddStudentForm, showDeleteStudentPortal, showPresentReport
} from './attendance.js';

import { loadTeacherAttendance, loadTeacherAttendanceDashboard, loadAddNewTeacherForm, loadTeacherListWithActions } from './teacherAttendance.js';
import { loadAdminAttendancePanel } from './adminAttendance.js';
import { loadSalaryDashboard, loadSalaryReport, loadSalaryPayment, loadPayslip } from './salaryManagement.js';
import { renderStudentList, renderSearchList,renderIdAssignment } from './student.js';

function buildPortalMenu() {
    const container = document.getElementById('sideMenuContainer');
    container.innerHTML = "";

    
    const roleData = permissions[currentUserRole];
    document.getElementById('userRoleBadge').innerText = currentUserRole.toUpperCase();
    
    for (const [module, options] of Object.entries(roleData)) {
        const iconClass = icons[module] || 'fa-bars';
        const li = document.createElement('li');
        
        if (options.length === 0) {
            li.innerHTML = `<div class="module-btn" id="menu_root_${module}"><span><i class="fa-solid ${iconClass}" style="margin-right:10px; color:#1e3a8a;"></i> ${translations[state.currentLang][module]}</span></div>`;
        } else {
            li.innerHTML = `
                <div class="module-btn type-expandable">
                    <span><i class="fa-solid ${iconClass}" style="margin-right:10px; color:#1e3a8a;"></i> ${translations[state.currentLang][module]}</span>
                    <i class="fa-solid fa-chevron-down fa-xs" style="color:#64748b;"></i>
                </div>
                <div class="sub-menu">
                    ${options.map(opt => `<a href="#" class="sub-menu-item" data-opt="${opt}"><i class="fa-solid fa-circle-notch fa-2xs" style="margin-right:6px;"></i> ${translations[state.currentLang][opt]}</a>`).join('')}
                </div>`;
        }
        container.appendChild(li);

       if (options.length === 0) {
        document.getElementById(`menu_root_${module}`).addEventListener('click', () => {
        showDashboard();
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) sidebar.classList.remove('active'); // 📱 मोबाइल पर साइडबार बंद करें
    });
}
}
    // Expand / Collapse animations toggle click listeners
    document.querySelectorAll('.module-btn.type-expandable').forEach(btn => {
        btn.addEventListener('click', function() {
            const subMenu = this.nextElementSibling;
            const chevron = this.querySelector('.fa-chevron-down, .fa-chevron-up');
            
            if (subMenu.style.display === "block") {
                subMenu.style.display = "none";
                if(chevron) chevron.className = "fa-solid fa-chevron-down fa-xs";
            } else {
                subMenu.style.display = "block";
                if(chevron) chevron.className = "fa-solid fa-chevron-up fa-xs";
            }
        });
    });

   document.querySelectorAll('.sub-menu-item').forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        executeModuleRouting(this.getAttribute('data-opt'));
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) sidebar.classList.remove('active'); // 📱 क्लिक होते ही साइडबार बंद करें
    });
});
}

function executeModuleRouting(title) {
    document.getElementById('pageTitle').innerText = translations[state.currentLang][title] || title;

    switch(title) {
     case 'छात्र आईडी जोड़ें':
            renderIdAssignment();
             break;
        case 'छात्र प्रमोट':
            renderStudentList();
             break;
        case 'छात्र प्रोफ़ाइल':
           renderSearchList();
             break;
        case 'उपस्थिति डैशबोर्ड':
            showAttendanceDashboard();
            break;
        case 'दैनिक उपस्थिति':
            showAttendanceForm();
            break;
        case 'उपस्थिति सुधार':
            showCorrectionPortal();
            break;
        case 'अनुपस्थित छात्रों की सूची':
            showAbsentReport();
            break;
        case 'छात्र को जोड़ें':
            showAddStudentForm(); 
            break;
        case 'छात्र को हटाएँ':
            showDeleteStudentPortal();
            break;
        case 'उपस्थित छात्रों की सूची':
            showPresentReport();
            break;
        case 'शिक्षक उपस्थिति Dashboard': 
            loadTeacherAttendanceDashboard();
            break;
        case 'शिक्षक उपस्थिति': 
            loadTeacherAttendance(); 
            break;
        case 'नया शिक्षक जोड़ें': 
           loadAddNewTeacherForm()
            break;
        case 'अपडेट/डिलीट': 
           loadTeacherListWithActions()
            break;
        case 'वेतन डैशबोर्ड':
            loadSalaryDashboard();
            break;
        case 'वेतन रिपोर्ट':
            loadSalaryReport();
            break;
        case 'वेतन भुगतान':
            loadSalaryPayment();
            break;
        case 'वेतन पर्ची':
            loadPayslip();
            break;
        case 'QR कोड प्रबंधन': 
          loadAdminAttendancePanel('qr');
            break;
        case 'मैन्युअल उपस्थिति': 
            loadAdminAttendancePanel('manual');
            break;
        default:
            fetchSheetData(title);
            break;
    }
}

document.getElementById('brandLogo').addEventListener('click', showDashboard);
document.getElementById('btnLangEN').addEventListener('click', () => { state.currentLang = 'EN'; buildPortalMenu(); showDashboard(); });
document.getElementById('btnLangHN').addEventListener('click', () => { state.currentLang = 'HN'; buildPortalMenu(); showDashboard(); });

// ✅ FIXED LOGOUT: Ab logout karne par user seedhe aapki sahi school website par chala jayega
document.getElementById('btnLogout').addEventListener('click', () => { 
    if(confirm("क्या आप लॉग आउट करना चाहते हैं?")) {
        // Aapki school ki sahi website ka link yahan set kar diya hai
        window.location.href = "https://saraswatischoolrunaha.in/"; 
    } 
});

window.addEventListener('DOMContentLoaded', () => {
    buildPortalMenu();
    showDashboard();

// 📱 मोबाइल मेन्यू ओपन/क्लोज़ लॉजिक (अब सुरक्षित रूप से DOMContentLoaded के अंदर है)
    const menuBtn = document.getElementById('menuToggleBtn');
    const sidebar = document.querySelector('.sidebar');

    if (menuBtn && sidebar) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('active'); 
        });

        document.addEventListener('click', (e) => {
            if (sidebar.classList.contains('active') && !sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
                sidebar.classList.remove('active'); 
            }
        });
    }
});
