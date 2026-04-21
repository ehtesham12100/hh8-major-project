# hh8-major-project
Healthcare Security &amp; Analytics Dashboard that monitors patient data, detects anomalies, ensures HIPAA compliance, and provides real-time alerts. It integrates security tools, analytics, and dashboards to protect sensitive healthcare information from cyber threats.
# HealthSecure: Security-First Healthcare Dashboard

**HealthSecure** is a modern, full-stack Healthcare Analytics and Security Dashboard designed to protect sensitive patient data while providing real-time clinical insights. It bridges the gap between healthcare administration and cybersecurity monitoring.

---

## 🚀 Key Features

### 🛡️ Cybersecurity & Asset Management
- **Vulnerability Scanning**: Automatically scan devices and log infrastructure threats (e.g., "Outdated Firmware") with real-time status tracking.
- **Security Alerts**: Instant SMTP email notifications for critical events, including new vulnerabilities and unauthorized access attempts.
- **Asset Inventory**: Intelligent tracking of hospital assets (Servers, Medical Devices, Applications) with IP and ownership details.

### 🏥 Clinical & Patient Management
- **Intelligent EHR**: Unified management of patient records, admissions, and discharge workflows.
- **Anomalies Detection**: AI-inspired monitoring of behavioral patterns to detect unusual data access or privilege escalation.
- **Patient Stats**: Real-time dynamic visualization of patient demographics (Gender, Age, Insurance).

### ⚖️ Compliance & Risk
- **HIPAA Compliance Tracker**: Continuous auditing of institutional standards against federal requirements.
- **PHI Risk Detection**: Real-time alerts for potential Protected Health Information (PHI) exposure.
- **Financial-Clinical Sync**: Smart validation logic that blocks discharge for patients with pending settlement invoices.

---

## 🛠️ Tech Stack

**Frontend:** React, Vanilla CSS (Premium Dark/Glassmorphic Design)  
**Backend:** FastAPI (Python), Motor (BSON/MongoDB Driver)  
**Database:** MongoDB Atlas (Cloud)  
**Security:** JWT Token Authentication, Bcrypt Password Hashing, RBAC (Role-Based Access Control)

---

## ⚙️ Setup & Installation

### 1. Prerequisites
- Python 3.9+
- Node.js (v16+)
- MongoDB Atlas Account

### 2. Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/Scripts/activate  # Windows
pip install -r requirements.txt
python main.py
```

### 3. Frontend Setup
```bash
cd frontend/my-app
npm install
npm start
```

### 4. Seed Data
```bash
python backend/seed.py
```

---

## 📊 Environment Variables
Create a `.env` file in the root directory:
```env
MONGO_URL=your_mongodb_atlas_url
SMTP_USER=your_gmail@gmail.com
SMTP_PASSWORD=your_app_password
SECURITY_CONTACT_EMAIL=admin@example.com
```

---

## 🏆 Results & UI
The system provides a premium, responsive interface with deep analytics:

*   **Vulnerability Dashboard**: Monitors threats and provides a one-click "Fix" workflow.
*   **Billing Portal**: Integrated settlement system with PDF export functionality.
*   **PHI Risk Monitor**: Critical alert window for high-severity data privacy risks.

---

## 📜 License
*Developed as part of HealthSecure Analytics Research.*

