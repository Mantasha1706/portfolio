// Script to generate student login credentials
const fs = require('fs');

// Configuration
const TOTAL_STUDENTS = 50; // Adjust as needed
const CLASSES = ['4E', '4F', '4G', '5D', '5E', '5F'];

// Generate student credentials
const students = [];

for (let i = 1; i <= TOTAL_STUDENTS; i++) {
    const classIndex = Math.floor((i - 1) / (TOTAL_STUDENTS / CLASSES.length));
    const studentClass = CLASSES[Math.min(classIndex, CLASSES.length - 1)];

    students.push({
        id: i,
        email: `student${i}@aischool.net`,
        password: 'student123', // Default password
        class: studentClass,
        loginUrl: `http://localhost:3000/login?email=student${i}@aischool.net`
    });
}

// Generate HTML page with all login links
const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MakerFest Student Login Links</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 1200px;
            margin: 40px auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            background: white;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 10px;
        }
        .subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 40px;
        }
        .class-section {
            margin-bottom: 40px;
        }
        .class-title {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 18px;
            font-weight: bold;
        }
        .student-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 15px;
        }
        .student-card {
            background: #f8f9fa;
            border: 2px solid #e9ecef;
            border-radius: 10px;
            padding: 15px;
            transition: all 0.3s;
        }
        .student-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            border-color: #667eea;
        }
        .student-number {
            font-weight: bold;
            color: #667eea;
            margin-bottom: 8px;
        }
        .student-email {
            font-size: 12px;
            color: #666;
            margin-bottom: 10px;
            word-break: break-all;
        }
        .login-btn {
            display: block;
            width: 100%;
            padding: 10px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            transition: opacity 0.3s;
        }
        .login-btn:hover {
            opacity: 0.9;
        }
        .instructions {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin-bottom: 30px;
            border-radius: 4px;
        }
        .instructions h3 {
            margin-top: 0;
            color: #856404;
        }
        .instructions p {
            margin: 5px 0;
            color: #856404;
        }
        .download-csv {
            display: inline-block;
            margin: 20px auto;
            padding: 12px 24px;
            background: #28a745;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            display: block;
            text-align: center;
            max-width: 200px;
            margin: 20px auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 MakerFest Student Login Portal</h1>
        <p class="subtitle">Click on your student number to access your portfolio</p>
        
        <div class="instructions">
            <h3>📋 Instructions for Students</h3>
            <p>1. Find your student number below</p>
            <p>2. Click the "Login as Student X" button</p>
            <p>3. Password for all accounts: <strong>student123</strong></p>
            <p>4. Fill in your project details and create your poster!</p>
        </div>

        ${CLASSES.map(className => {
    const classStudents = students.filter(s => s.class === className);
    return `
                <div class="class-section">
                    <div class="class-title">📚 Class ${className} (${classStudents.length} students)</div>
                    <div class="student-grid">
                        ${classStudents.map(student => `
                            <div class="student-card">
                                <div class="student-number">Student ${student.id}</div>
                                <div class="student-email">${student.email}</div>
                                <a href="${student.loginUrl}" class="login-btn" target="_blank">
                                    Login as Student ${student.id}
                                </a>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
}).join('')}
    </div>
</body>
</html>`;

// Save HTML file
fs.writeFileSync('student-logins.html', html);

// Save CSV for backup
const csv = 'Student ID,Email,Password,Class,Login URL\n' +
    students.map(s => `${s.id},${s.email},${s.password},${s.class},${s.loginUrl}`).join('\n');
fs.writeFileSync('student-credentials.csv', csv);

// Save JSON
fs.writeFileSync('student-credentials.json', JSON.stringify(students, null, 2));

console.log('✅ Generated login portal!');
console.log(`📄 Open: student-logins.html`);
console.log(`👥 Generated ${students.length} student accounts`);
console.log(`📊 CSV exported to: student-credentials.csv`);
console.log(`📋 JSON exported to: student-credentials.json`);
