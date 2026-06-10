// Global Configuration Variables
let currentLang = 'HN';
const urlParams = new URLSearchParams(window.location.search);
const currentUserRole = urlParams.get('role') || 'teacher';

// Web App URLs for Google Sheets
const sheetUrls = {
    'Database': 'https://script.google.com/macros/s/AKfycbxEQpFakRt3gJ5z8i1yQbGTfKTRUpRqc5xhJoviGiWhHFX3N3eIzviFQVEgaRNoxRhh/exec',
    'StudentData':'https://script.google.com/macros/s/AKfycbxZJYBYZKp4iaAqiTeSlEJ-iR6J43kEDUH6COhy_jxm8eqvxBmybdmedyxqbYD8DI6y/exec',
    'Attendance':'https://script.google.com/macros/s/AKfycbxZJYBYZKp4iaAqiTeSlEJ-iR6J43kEDUH6COhy_jxm8eqvxBmybdmedyxqbYD8DI6y/exec',
    'बकाया लिस्ट': 'https://script.google.com/macros/s/FEES_ID/exec',
    'जारी करें': 'https://script.google.com/macros/s/TC_ID/exec'
};

// Language Translation Dataset
const translations = {
    'HN': {
        'डैशबोर्ड': 'डैशबोर्ड', 'छात्र मॉड्यूल': 'छात्र मॉड्यूल', 'उपस्थिति मॉड्यूल': 'उपस्थिति मॉड्यूल', 'फीस मॉड्यूल': 'फीस मॉड्यूल', 'TC मॉड्यूल': 'TC मॉड्यूल', 'Exam मॉड्यूल': 'Exam मॉड्यूल', 'Admit Card मॉड्यूल': 'Admit Card मॉड्यूल',
        'छात्र प्रमोट': 'छात्र प्रमोट', 'छात्र प्रोफ़ाइल': 'छात्र प्रोफ़ाइल', 'छात्र फोटो अपडेट': 'छात्र फोटो अपडेट', 'छात्र समग्र अपडेट': 'छात्र समग्र अपडेट', 'छात्र आधार अपडेट': 'छात्र आधार अपडेट', 'छात्र बैंक खाता': 'छात्र बैंक खाता',
        'दैनिक उपस्थिति': 'दैनिक उपस्थिति','उपस्थिति सुधार':'उपस्थिति सुधार', 'अवकाश प्रबंधन': 'अवकाश प्रबंधन', 'उपस्थिति डैशबोर्ड': 'उपस्थिति डैशबोर्ड', 'उपस्थिति रिपोर्ट': 'उपस्थिति रिपोर्ट',
        'फीस भुगतान': 'फीस भुगतान', 'बकाया लिस्ट': 'बकाया लिस्ट', 'रसीद हिस्ट्री': 'रसीद हिस्ट्री', 'फीस स्ट्रक्चर': 'फीस स्ट्रक्चर', 'कुल आय रिपोर्ट': 'कुल आय रिपोर्ट',
        'सत्यापन': 'सत्यापन', 'विवरण चेक करें': 'विवरण चेक करें', 'TC जनरेट करना': 'TC जनरेट करना', 'जारी करना': 'जारी करना',
        'परीक्षा सूची': 'परीक्षा सूची', 'अंक प्रविष्टि': 'अंक प्रविष्टि', 'परीक्षा रिपोर्ट': 'परीक्षा रिपोर्ट',
        'एडमिट कार्ड जारी करें': 'एडमिट कार्ड जारी करें', 'प्रिंट एडमिट कार्ड': 'प्रिंट एडमिट कार्ड', 'छात्र को जोड़ें': 'छात्र को जोड़ें', 'छात्र को हटाएँ': 'छात्र को हटाएँ', 'अनुपस्थित छात्रों की सूची': 'अनुपस्थित छात्रों की सूची',
    },
    'EN': {
        'डैशबोर्ड': 'Dashboard', 'छात्र मॉड्यूल': 'Student Module', 'उपस्थिति मॉड्यूल': 'Attendance Module', 'फीस मॉड्यूल': 'Fee Module', 'TC मॉड्यूल': 'TC Module', 'Exam मॉड्यूल': 'Exam Module', 'Admit Card मॉड्यूल': 'Admit Card Module',
        'छात्र प्रमोट': 'Student Promote', 'छात्र प्रोफ़ाइल': 'Student Profile', 'छात्र फोटो अपडेट': 'Photo Update', 'छात्र समग्र अपडेट': 'Samagra Update', 'छात्र आधार अपडेट': 'Aadhaar Update', 'छात्र बैंक खाता': 'Bank Account',
        'दैनिक उपस्थिति': 'Daily Attendance', 'अवकाश प्रबंधन': 'Leave Management', 'उपस्थिति डैशबोर्ड': 'Attendance Dashboard', 'उपस्थिति रिपोर्ट': 'Attendance Report', 'उपस्थिति सुधार': 'Attendance Update',
        'फीस भुगतान': 'Fee Payment', 'बकाया लिस्ट': 'Pending List', 'रसीद हिस्ट्री': 'Receipt History', 'फीस स्ट्रक्चर': 'Fee Structure', 'कुल आय रिपोर्ट': 'Income Report',
        'सत्यापन': 'Verification', 'विवरण चेक करें': 'Check Details', 'TC जनरेट करना': 'Generate TC', 'जारी करना': 'Issue TC',
        'परीक्षा सूची': 'Exam List', 'अंक प्रविष्टि': 'Marks Entry', 'परीक्षा रिपोर्ट': 'Exam Report', 'छात्र को जोड़ें': 'Add Students', 'छात्र को हटाएँ': 'Delete Student', 'अनुपस्थित छात्रों की सूची':'Absent List',
        'एडमिट कार्ड जारी करें': 'Issue Admit Card', 'प्रिंट एडमिट कार्ड': 'Print Admit Card',
    }
};

// Icons Data Mapping
const icons = {
    'डैशबोर्ड': 'fa-house',
    'छात्र मॉड्यूल': 'fa-user-graduate',
    'उपस्थिति मॉड्यूल': 'fa-calendar-check',
    'फीस मॉड्यूल': 'fa-money-bill-wave',
    'TC मॉड्यूल': 'fa-file-signature',
    'Exam मॉड्यूल': 'fa-file-lines',
    'Admit Card मॉड्यूल': 'fa-id-card'
};

// Role Based Permissions Management
const permissions = {
    'admin': {
        'डैशबोर्ड': [],
        'छात्र मॉड्यूल': ['छात्र प्रमोट', 'छात्र प्रोफ़ाइल', 'छात्र फोटो अपडेट', 'छात्र समग्र अपडेट', 'छात्र आधार अपडेट', 'छात्र बैंक खाता'],
        'उपस्थिति मॉड्यूल': ['उपस्थिति डैशबोर्ड', 'छात्र को जोड़ें','छात्र को हटाएँ', 'दैनिक उपस्थिति','उपस्थिति सुधार', 'अनुपस्थित छात्रों की सूची', 'अवकाश प्रबंधन', 'उपस्थिति रिपोर्ट'],
        'फीस मॉड्यूल': ['फीस भुगतान', 'बकाया लिस्ट', 'रसीद हिस्ट्री', 'फीस स्ट्रक्चर', 'कुल आय रिपोर्ट'],
        'TC मॉड्यूल': ['सत्यापन', 'विवरण चेक करें', 'TC जनरेट करना', 'जारी करना'],
        'Exam मॉड्यूल': ['परीक्षा सूची', 'अंक प्रविष्टि', 'परीक्षा रिपोर्ट'],
        'Admit Card मॉड्यूल': ['एडमिट कार्ड जारी करें', 'प्रिंट एडमिट कार्ड']
    },
    'teacher': {
        'डैशबोर्ड': [],
        'छात्र मॉड्यूल': ['छात्र प्रोफ़ाइल'],
        'उपस्थिति मॉड्यूल': ['दैनिक उपस्थिति']
    },
    'principal': {
        'डैशबोर्ड': [],
        'छात्र मॉड्यूल': ['छात्र प्रोफ़ाइल'],
        'उपस्थिति मॉड्यूल': ['उपस्थिति रिपोर्ट'],
        'फीस मॉड्यूल': ['बकाया लिस्ट']
     }
};
