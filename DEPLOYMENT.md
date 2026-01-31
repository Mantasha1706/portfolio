# 🚀 MakerFest Portfolio - Deployment Guide

## 📁 Project to Deploy
Deploy the entire folder:
```
C:\Users\MANTASHA SHAIKH\.gemini\antigravity\scratch\makerfest-portfolio
```

---

## Option 1: Deploy to Vercel (Recommended)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy
```bash
cd "C:\Users\MANTASHA SHAIKH\.gemini\antigravity\scratch\makerfest-portfolio"
vercel --prod
```

### Step 4: Get Your Link
After deployment, you'll get a URL like:
```
https://makerfest-portfolio.vercel.app
```

### Step 5: Share Links with Students
- **Student Login:** `https://your-app.vercel.app/login`
- **Teacher Dashboard:** `https://your-app.vercel.app/teacher`

---

## Option 2: Local Network Access (For Same WiFi)

If students are on the same WiFi network:

### Step 1: Find Your IP Address
```bash
ipconfig
```
Look for "IPv4 Address" (e.g., `10.90.149.31`)

### Step 2: Start Development Server
```bash
npm run dev
```

### Step 3: Share Link
Students can access: `http://10.90.149.31:3000/login`

⚠️ **Note:** This only works on the same WiFi network!

---

## 📋 Login Credentials

### Students
- **Email:** Any unique email they want (e.g., `john@example.com`)
- **Password:** `student123` (or any password)
- **Role:** Student

### Teachers
- **Email:** `teacher@aischool.net`
- **Password:** `teacher123`
- **Role:** Teacher

---

## 🔧 Important Files to Check Before Deploy

### 1. Firebase Configuration
File: `src/lib/firebase.ts`
- Already configured with your Firebase URL ✅

### 2. SQLite Database
⚠️ **Note:** SQLite won't work on Vercel (serverless).

**Solution:** The app already uses Firebase for teacher dashboard, so it will work! Students submit to Firebase directly.

---

## 🔗 Final Student Access Link

After deployment, share:
```
https://your-deployed-app.vercel.app/login
```

Students will:
1. Click the link
2. Enter their email and create password
3. Fill portfolio form
4. Generate poster
5. Submit to teacher

Teachers access:
```
https://your-deployed-app.vercel.app/teacher
```

---

## 🆘 Troubleshooting

### Issue: "Database not found"
- Normal on Vercel (serverless environment)
- App uses Firebase, so it still works!

### Issue: "Firebase permission denied"
- Go to Firebase Console
- Database → Rules
- Set to:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

---

## 📱 QR Code (Optional)

After deployment, generate a QR code:
1. Go to [qr-code-generator.com](https://www.qr-code-generator.com/)
2. Enter your deployed URL
3. Print and share with students!
