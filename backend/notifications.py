import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from database import anomalies_collection
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# SMTP Configuration
# Use environment variables for security. On Render, these should be added to environment variables.
SMTP_USER = os.getenv("SMTP_USER", "eh722783@gmail.com")

SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "mjyl odzx wekw ivhj")
SECURITY_CONTACT_EMAIL = os.getenv("SECURITY_CONTACT_EMAIL", SMTP_USER)

def send_security_email(user_email, username, details="Multiple failed login attempts detected."):
    """Sends a security alert email to the user and the security contact."""
    if SMTP_USER == "your-email@gmail.com":
        print("DEBUG: SMTP_USER not configured. Skipping email.")
        return False

    try:
        # Send to both the user and the admin (security contact)
        recipients = [user_email]
        if SECURITY_CONTACT_EMAIL and SECURITY_CONTACT_EMAIL not in recipients:
            recipients.append(SECURITY_CONTACT_EMAIL)

        for recipient in recipients:
            msg = MIMEMultipart()
            msg['From'] = SMTP_USER
            msg['To'] = recipient
            msg['Subject'] = f"Security Alert: Failed Login Attempts for {username}"

            is_admin_copy = " [ADMIN COPY]" if recipient == SECURITY_CONTACT_EMAIL and recipient != user_email else ""
            
            body = f"""
            Hello,

            Our system detected multiple failed login attempts on the account: {username}{is_admin_copy}
            
            Details: {details}
            Time: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
            Target Email: {user_email}

            If this was not you, please secure your account immediately.
            """
            msg.attach(MIMEText(body, 'plain'))

            server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
            server.quit()
            print(f"STMP: Security email sent to {recipient}")
        
        return True
    except Exception as e:
        print(f"SMTP Error: {e}")
        return False

def record_anomaly(username, type="Unauthorized Access", severity="High", description="", detected_by="Security System"):
    """Records a security anomaly in the database."""
    try:
        anomaly = {
            "type": type,
            "description": description or f"Security event involving user '{username}'.",
            "severity": severity,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "status": "Active",
            "detected_by": detected_by
        }
        anomalies_collection.insert_one(anomaly)
        print(f"DB: Anomaly recorded for user {username}")
        return True
    except Exception as e:
        print(f"DB Error recording anomaly: {e}")
        return False

def record_compliance_violation(username, title="Policy Violation", category="Security Rule", description="", details=""):
    """Records a compliance failure in the audit log."""
    try:
        from database import compliance_collection
        violation = {
            "title": title,
            "category": category,
            "status": "Non-Compliant",
            "criticality": "Critical",
            "last_audit": datetime.now().strftime("%Y-%m-%d"),
            "owner": username,
            "description": description or details,
            "details": details
        }
        compliance_collection.insert_one(violation)
        print(f"DB: Compliance violation recorded for {username}")
        return True
    except Exception as e:
        print(f"DB Error recording compliance: {e}")
        return False

def send_vulnerability_alert(vuln_data):
    """Sends a security alert email when a new vulnerability is added."""
    if not SECURITY_CONTACT_EMAIL:
        print("DEBUG: SECURITY_CONTACT_EMAIL not set. Skipping vuln alert.")
        return False

    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_USER
        msg['To'] = SECURITY_CONTACT_EMAIL
        msg['Subject'] = f"New Vulnerability Detected: {vuln_data.get('title', 'Unknown')}"

        body = f"""
        Hello Admin,

        A new vulnerability has been logged in the system.
        
        Asset Name: {vuln_data.get('asset_name', 'Unknown')}
        Title: {vuln_data.get('title', 'Unknown')}
        Severity: {vuln_data.get('severity', 'Unknown')}
        CVSS Score: {vuln_data.get('cvss_score', 'N/A')}
        Time: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
        
        Please review this vulnerability in the dashboard immediately.
        """
        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        print(f"SMTP: Vulnerability alert sent to {SECURITY_CONTACT_EMAIL}")
        return True
    except Exception as e:
        print(f"SMTP Error: {e}")
def send_phi_risk_alert(risk_data):
    """Sends a critical security alert email when a PHI Risk is generated."""
    if not SECURITY_CONTACT_EMAIL:
        return False

    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_USER
        msg['To'] = SECURITY_CONTACT_EMAIL
        msg['Subject'] = f"CRITICAL: PHI Security Alert - {risk_data.get('title', 'Unknown')}"

        body = f"""
        WARNING: Real-Time Security Alert

        A critical PHI (Protected Health Information) risk has been detected in your infrastructure.
        
        System Affected: {risk_data.get('system', 'Unknown')}
        Risk Title: {risk_data.get('title', 'Unknown')}
        Severity: {risk_data.get('severity', 'Critical')}
        Description: {risk_data.get('description', 'Unknown')}
        Time: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
        
        Immediate action is recommended. Please review the dashboard.
        """
        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        print(f"SMTP: PHI Risk alert sent to {SECURITY_CONTACT_EMAIL}")
        return True
    except Exception as e:
        print(f"SMTP Error: {e}")
        return False
        return False

def send_login_alert(username, ip_address="Unknown"):
    """Sends an email notification when a user successfully logs in."""
    if not SECURITY_CONTACT_EMAIL:
        return False

    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_USER
        msg['To'] = SECURITY_CONTACT_EMAIL
        msg['Subject'] = f"Security Notice: New Login Detected ({username})"

        body = f"""
        HealthSecure Dashboard Security Notice

        A successful login was just detected on the dashboard.
        
        User: {username}
        IP Address: {ip_address}
        Time: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
        
        If this was not authorized, please review your active sessions immediately.
        """
        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        print(f"SMTP: Login alert sent to {SECURITY_CONTACT_EMAIL} for user {username}")
        return True
    except Exception as e:
        print(f"SMTP Error: {e}")
        return False

def send_compliance_alert(violation_title):
    """Sends an email notification when a live compliance audit fails."""
    if not SECURITY_CONTACT_EMAIL:
        return False

    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_USER
        msg['To'] = SECURITY_CONTACT_EMAIL
        msg['Subject'] = f"CRITICAL: HIPAA Audit Failure Detected"

        body = f"""
        HealthSecure Dashboard - Continuous Compliance Monitor

        A Live System Audit just detected a HIPAA violation on your network.
        
        Violation Details: {violation_title}
        Status: Non-Compliant
        Time: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
        
        Please log into the Compliance Dashboard immediately to review and remediate this finding.
        """
        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        print(f"SMTP: Compliance alert sent to {SECURITY_CONTACT_EMAIL}")
        return True
    except Exception as e:
        print(f"SMTP Error: {e}")
        return False
