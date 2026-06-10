import { state, currentUserRole, permissions, translations, icons, fetchSheetData } from './config.js';
import { showDashboard } from './dashboard.js';
import { 
    showAttendanceForm, showAttendanceDashboard, showCorrectionPortal, 
    showAbsentReport, showAddStudentForm, showDeleteStudentPortal 
} from './attendance.js';

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
            document.getElementById(`menu_root_${module}`).addEventListener('click', showDashboard);
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
        });
    });
}

function executeModuleRouting(title) {
    document.getElementById('pageTitle').innerText = translations[state.currentLang][title] || title;

    switch(title) {
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
        default:
            fetchSheetData(title);
            break;
    }
}

document.getElementById('brandLogo').addEventListener('click', showDashboard);
document.getElementById('btnLangEN').addEventListener('click', () => { state.currentLang = 'EN'; buildPortalMenu(); showDashboard(); });
document.getElementById('btnLangHN').addEventListener('click', () => { state.currentLang = 'HN'; buildPortalMenu(); showDashboard(); });

// ✅ FIXED LOGOUT: Ab yeh refresh karne ke bajaye user ko wapas login page par bhej dega
document.getElementById('btnLogout').addEventListener('click', () => { 
    if(confirm("क्या आप लॉग आउट करना चाहते हैं?")) {
        // Agar aapke login file ka naam login.html hai, toh index.html ki jagah login.html likhein
        window.location.href = "index.html"; 
    } 
});

window.addEventListener('DOMContentLoaded', () => {
    buildPortalMenu();
    showDashboard();
});
