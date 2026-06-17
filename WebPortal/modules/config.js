// Global memory store for layout state tracking
export let state = {
    currentLang: 'HN',
    lastData: null,
    studentDataList: null
};

// URL parameters mapping logic for User Permissions
export const urlParams = new URLSearchParams(window.location.search);
export const currentUserRole = urlParams.get('role') || 'admin';

// Aapke live active Google Apps Script endpoints URL
export const sheetUrls = {
    'Database': 'https://script.google.com/macros/s/AKfycbxEQpFakRt3gJ5z8i1yQbGTfKTRUpRqc5xhJoviGiWhHFX3N3eIzviFQVEgaRNoxRhh/exec',
    'StudentData':'https://script.google.com/macros/s/AKfycbxZJYBYZKp4iaAqiTeSlEJ-iR6J43kEDUH6COhy_jxm8eqvxBmybdmedyxqbYD8DI6y/exec', 
    'Attendance':'https://script.google.com/macros/s/AKfycbxZJYBYZKp4iaAqiTeSlEJ-iR6J43kEDUH6COhy_jxm8eqvxBmybdmedyxqbYD8DI6y/exec', 
    'Teachers' :'https://script.google.com/macros/s/AKfycbztzZj_bSZd6kJ8jKyco_K2SxIOXrF5TQ4WqwbFCSI-0b1gAA1_Hf-qUJtOT1ckFwnQ/exec',
    'TeacherAttendance':'https://script.google.com/macros/s/AKfycbztzZj_bSZd6kJ8jKyco_K2SxIOXrF5TQ4WqwbFCSI-0b1gAA1_Hf-qUJtOT1ckFwnQ/exec',
};

// Double Language System Array Map (Hindi + English)
export const translations = {
    'HN': {
        'डैशबोर्ड': 'डैशबोर्ड', 'छात्र मॉड्यूल': 'छात्र मॉड्यूल', 'उपस्थिति मॉड्यूल': 'उपस्थिति मॉड्यूल', 'फीस मॉड्यूल': 'फीस मॉड्यूल', 'TC मॉड्यूल': 'TC मॉड्यूल', 'Exam मॉड्यूल': 'Exam मॉड्यूल', 'Admit Card मॉड्यूल': 'Admit Card मॉड्यूल',
        'छात्र प्रमोट': 'छात्र प्रमोट', 'छात्र प्रोफ़ाइल': 'छात्र प्रोफ़ाइल', 'छात्र फोटो अपडेट': 'छात्र फोटो अपडेट', 'छात्र समग्र अपडेट': 'छात्र समग्र अपडेट', 'छात्र आधार अपडेट': 'छात्र आधार अपडेट', 'छात्र बैंक खाता': 'छात्र बैंक खाता',
        'दैनिक उपस्थिति': 'दैनिक उपस्थिति','उपस्थिति सुधार':'उपस्थिति सुधार (Auto Load)', 'अवकाश प्रबंधन': 'अवकाश प्रबंधन', 'उपस्थिति डैशबोर्ड': 'उपस्थिति डैशबोर्ड',  'छात्र को जोड़ें': 'छात्र को जोड़ें (Sync)', 'छात्र को हटाएँ': 'छात्र को हटाएँ', 'उपस्थित छात्रों की सूची':'उपस्थित छात्रों की सूची', 'अनुपस्थित छात्रों की सूची': 'अनुपस्थित छात्रों की सूची','छात्र उपस्थिति रिपोर्ट': 'छात्र उपस्थिति रिपोर्ट',
        'फीस भुगतान': 'फीस भुगतान', 'बकाया लिस्ट': 'बकाया लिस्ट', 'रसीद हिस्ट्री': 'रसीद हिस्ट्री', 'फीस स्ट्रक्चर': 'फीस स्ट्रक्चर', 'कुल आय रिपोर्ट': 'कुल आय रिपोर्ट',
        'सत्यापन': 'सत्यापन', 'विवरण चेक करें': 'विवरण चेक करें', 'TC जनरेट करना': 'TC जनरेट करना', 'जारी करना': 'जारी करना',
        'परीक्षा सूची': 'परीक्षा सूची', 'अंक प्रविष्टि': 'अंक प्रविष्टि', 'परीक्षा रिपोर्ट': 'परीक्षा रिपोर्ट',
        'एडमिट कार्ड जारी करें': 'एडमिट कार्ड जारी करें', 'प्रिंट एडमिट कार्ड': 'प्रिंट एडमिट कार्ड', 'शिक्षक प्रबंधन मॉड्यूल': 'शिक्षक प्रबंधन मॉड्यूल', 'शिक्षक उपस्थिति Dashboard': 'शिक्षक उपस्थिति Dashboard', 'शिक्षक उपस्थिति': 'शिक्षक उपस्थिति', 'नया शिक्षक जोड़ें': 'नया शिक्षक जोड़ें', 'अपडेट/डिलीट': 'अपडेट/डिलीट', 'वेतन Salary': 'वेतन Salary', 'शिक्षक उपस्थिति रिपोर्ट': 'शिक्षक उपस्थिति रिपोर्ट','QR कोड प्रबंधन': 'QR कोड प्रबंधन',
    },
    'EN': {
        'डैशबोर्ड': 'Dashboard', 'छात्र मॉड्यूल': 'Student Module', 'उपस्थिति मॉड्यूल': 'Attendance Module', 'फीस मॉड्यूल': 'Fee Module', 'TC मॉड्यूल': 'TC Module', 'Exam मॉड्यूल': 'Exam Module', 'Admit Card मॉड्यूल': 'Admit Card Module',
        'छात्र प्रमोट': 'Student Promote', 'छात्र प्रोफ़ाइल': 'Student Profile', 'छात्र फोटो अपडेट': 'Photo Update', 'छात्र समग्र अपडेट': 'Samagra Update', 'छात्र आधार अपडेट': 'Aadhaar Update', 'छात्र बैंक खाता': 'Bank Account',
        'दैनिक उपस्थिति': 'Daily Attendance', 'अवकाश प्रबंधन': 'Leave Management', 'उपस्थिति डैशबोर्ड': 'Attendance Dashboard', 'छात्र उपस्थिति रिपोर्ट': 'Students Attendance Report', 'उपस्थिति सुधार': 'Attendance Update', 'छात्र को जोड़ें': 'Add Students (Sync)', 'छात्र को हटाएँ': 'Delete Student', 'अनुपस्थित छात्रों की सूची':'Absent Student List', 'उपस्थित छात्रों की सूची': 'List of Present Students', 
        'फीस भुगतान': 'Fee Payment', 'बकाया लिस्ट': 'Pending List', 'रसीद हिस्ट्री': 'Receipt History', 'फीस स्ट्रक्चर': 'Fee Structure', 'कुल आय रिपोर्ट': 'Income Report',
        'सत्यापन': 'Verification', 'विवरण चेक करें': 'Check Details', 'TC जनरेट करना': 'Generate TC', 'जारी करना': 'Issue TC', 'शिक्षक प्रबंधन मॉड्यूल': 'Teacher Attendance Moudle', 'शिक्षक उपस्थिति Dashboard': 'Teacher Attendance Dashboard', 'शिक्षक उपस्थिति': 'Teacher Attendance', 'नया शिक्षक जोड़ें': 'Add New Teacher', 'अपडेट/डिलीट': 'Update/Delete', 'वेतन Salary': 'Salary', 'शिक्षक उपस्थिति रिपोर्ट': 'Teacher Attendance Report',
                  'QR Code Management': 'QR कोड प्रबंधन',
        'परीक्षा सूची': 'Exam List', 'अंक प्रविष्टि': 'Marks Entry', 'परीक्षा रिपोर्ट': 'Exam Report', 
        'एडमिट कार्ड जारी करें': 'Issue Admit Card', 'प्रिंट एडमिट कार्ड': 'Print Admit Card',
    }
};

export const icons = {
    'डैशबोर्ड': 'fa-house', 'छात्र मॉड्यूल': 'fa-user-graduate', 'उपस्थिति मॉड्यूल': 'fa-calendar-check',
    'फीस मॉड्यूल': 'fa-money-bill-wave', 'TC मॉड्यूल': 'fa-file-signature', 'Exam मॉड्यूल': 'fa-file-lines', 'Admit Card मॉड्यूल': 'fa-id-card', 'शिक्षक प्रबंधन मॉड्यूल': 'fa-chalkboard-user',
};

// Permission Mapping Framework
export const permissions = {
    'admin': {
        'डैशबोर्ड': [],
        'छात्र मॉड्यूल': ['छात्र प्रमोट', 'छात्र प्रोफ़ाइल', 'छात्र फोटो अपडेट', 'छात्र समग्र अपडेट', 'छात्र आधार अपडेट', 'छात्र बैंक खाता'],
        'उपस्थिति मॉड्यूल': ['उपस्थिति डैशबोर्ड', 'छात्र को जोड़ें','छात्र को हटाएँ', 'दैनिक उपस्थिति','उपस्थिति सुधार', 'उपस्थित छात्रों की सूची','अनुपस्थित छात्रों की सूची', 'अवकाश प्रबंधन', 'छात्र उपस्थिति रिपोर्ट'],
        'फीस मॉड्यूल': ['फीस भुगतान', 'बकाया लिस्ट', 'रसीद हिस्ट्री', 'फीस स्ट्रक्चर', 'कुल आय रिपोर्ट'],
        'TC मॉड्यूल': ['सत्यापन', 'विवरण चेक करें', 'TC जनरेट करना', 'जारी करना'],
        'Exam मॉड्यूल': ['परीक्षा सूची', 'अंक प्रविष्टि', 'परीक्षा रिपोर्ट'],
        'Admit Card मॉड्यूल': ['एडमिट कार्ड जारी करें', 'प्रिंट एडमिट कार्ड'],
        'शिक्षक प्रबंधन मॉड्यूल': ['शिक्षक उपस्थिति Dashboard', 'शिक्षक उपस्थिति', 'नया शिक्षक जोड़ें', 'अपडेट/डिलीट', 'वेतन Salary', 'शिक्षक उपस्थिति रिपोर्ट','QR कोड प्रबंधन']
    },
    'teacher': {
        'डैशबोर्ड': [], 
        'छात्र मॉड्यूल': ['छात्र प्रोफ़ाइल'], 
        'उपस्थिति मॉड्यूल': ['दैनिक उपस्थिति'],
        'शिक्षक प्रबंधन मॉड्यूल': ['शिक्षक उपस्थिति']
    },
    'principal': {
        'डैशबोर्ड': [], 
        'छात्र मॉड्यूल': ['छात्र प्रोफ़ाइल'], 
        'उपस्थिति मॉड्यूल': ['छात्र उपस्थिति रिपोर्ट'], 
        'फीस मॉड्यूल': ['बकाया लिस्ट']
    }
};

// Under Development Modules Fallback screen renderer
export async function fetchSheetData(title) {
    // 1. अगर URL मौजूद है तो उसे फेच करें, नहीं तो Fallback दिखाएं
    const url = sheetUrls[title]; 
    
    if (!url) {
        document.getElementById('contentArea').innerHTML = `
            <div style="padding:20px; border-left: 5px solid #1e3a8a; background:#f8fafc;">
                <h3 style="color:#1e3a8a; margin-top:0;"><i class="fa-solid fa-screwdriver-wrench"></i> ${title}</h3>
                <p style="color:#64748b; font-size:15px; line-height:1.6;">
                    यह मॉड्यूल अभी सेटअप किया जा रहा है। <br> 
                    (Module: <b>${title}</b> का डेटा लिंक कॉन्फ़िगर नहीं है।)
                </p>
            </div>`;
        return;
    }

    // यहाँ आप अपना API कॉल का लॉजिक लिख सकते हैं
    console.log("Fetching data for:", title, "from:", url);
}
