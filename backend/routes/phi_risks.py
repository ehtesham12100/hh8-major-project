from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from database import phi_risks_collection
from auth_utils import get_current_user, require_admin
from bson import ObjectId

router = APIRouter(prefix="/phi-risks", tags=["PHI Risks"])

@router.get("/")
def get_phi_risks(current_user: dict = Depends(get_current_user)):
    risks = list(phi_risks_collection.find({}))
    for risk in risks:
        risk["_id"] = str(risk["_id"])
    return risks

@router.post("/", dependencies=[Depends(require_admin)])
def add_phi_risk(risk: dict, current_user: dict = Depends(require_admin)):
    phi_risks_collection.insert_one(risk)
    return {"message": "PHI risk added successfully"}

@router.delete("/{risk_id}", dependencies=[Depends(require_admin)])
def delete_phi_risk(risk_id: str, current_user: dict = Depends(require_admin)):
    result = phi_risks_collection.delete_one({"_id": ObjectId(risk_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="PHI risk not found")
    return {"message": "PHI risk deleted successfully"}

class ExportRequest(BaseModel):
    password: str

@router.post("/export-download", dependencies=[Depends(get_current_user)])
def export_download(payload: ExportRequest, current_user: dict = Depends(get_current_user)):
    from notifications import send_phi_risk_alert
    from database import users_collection
    from auth_utils import verify_password
    
    username = current_user.get("username", "Unknown User")
    
    # Fetch User DB password
    user_in_db = users_collection.find_one({"username": username})
    
    if not user_in_db or not verify_password(payload.password, user_in_db["password"]):
        # Password failed! Trigger the PHI Risk Trap
        risk_data = {
            "title": "Failed Authentication During Database Export",
            "severity": "Critical",
            "status": "Open",
            "system": "Patient Records Database",
            "description": f"User '{username}' attempted to download patient records but failed Step-Up Authentication (incorrect password).",
            "records_affected": 8450 # Fake number of records in db
        }
        
        from notifications import send_phi_risk_alert, record_anomaly, record_compliance_violation
        
        phi_risks_collection.insert_one(risk_data)
        send_phi_risk_alert(risk_data)
        
        # Log to Compliance Dashboard
        record_compliance_violation(
            username=username,
            title="Unauthorized PHI Access Attempt",
            category="Security Rule (Access Control)",
            description="Attempted data export without valid Step-Up Authentication credentials.",
            details=f"User '{username}' failed authentication for system: {risk_data['system']}"
        )

        # Log to Anomalies for Admin Dash
        record_anomaly(
            username=username,
            type="PHI Risk Trap Triggered",
            severity="Critical",
            description=f"Unauthorized EXPORT attempt detected. User failed Step-Up Auth for system '{risk_data['system']}'.",
            detected_by="Data Guard Subsystem"
        )
        
        # Throw a 403 Forbidden to the user
        raise HTTPException(
            status_code=403, 
            detail="SECURITY ALERT: Incorrect Password! Massive Data Exfiltration Blocked. This action has been logged and the administrator has been notified."
        )
        
    from fastapi.responses import Response
    import io
    import csv

    # Approved! Generate a real CSV file of the PHI risks to download
    risks = list(phi_risks_collection.find({}))
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write Header
    writer.writerow(["Title", "Severity", "Status", "System Affected", "Records Affected", "Description"])
    
    # Write Data
    for risk in risks:
        writer.writerow([
            risk.get("title", ""),
            risk.get("severity", ""),
            risk.get("status", ""),
            risk.get("system", ""),
            risk.get("records_affected", 0),
            risk.get("description", "")
        ])
    
    csv_content = output.getvalue()
    output.close()

    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=HealthSecure_PHI_Audit_Export.csv"}
    )
