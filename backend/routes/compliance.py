from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from database import compliance_collection
from auth_utils import get_current_user, require_admin
from bson import ObjectId

router = APIRouter(prefix="/compliance", tags=["Compliance"])

class ComplianceItem(BaseModel):
    title: str
    category: str
    status: str   # Compliant / Non-Compliant / Partial
    description: str | None = None

@router.post("/", dependencies=[Depends(require_admin)])
def add_compliance(item: ComplianceItem, current_user: dict = Depends(require_admin)):
    compliance_collection.insert_one(item.dict())
    return {"message": "Compliance item added successfully"}

@router.get("/")
def get_compliance(current_user: dict = Depends(get_current_user)):
    items = list(compliance_collection.find({}, {"_id": 0}))
    return items

@router.delete("/{item_id}", dependencies=[Depends(require_admin)])
def delete_compliance(item_id: str, current_user: dict = Depends(require_admin)):
    result = compliance_collection.delete_one({"_id": ObjectId(item_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Compliance item not found")
    return {"message": "Compliance item deleted successfully"}

@router.post("/scan", dependencies=[Depends(require_admin)])
def scan_compliance(current_user: dict = Depends(require_admin)):
    from database import db, compliance_collection
    from notifications import send_compliance_alert
    
    violations_found = []
    
    # Check 1: Any CRITICAL vulnerabilities left open?
    critical_vulns = list(db["vulnerabilities"].find({"severity": "Critical", "status": "Open"}))
    if len(critical_vulns) > 0:
        violations_found.append({
            "title": f"Unpatched Critical Vulnerability '{critical_vulns[0].get('title', 'Unknown')}' Detected",
            "category": "Technical Safeguards",
            "status": "Non-Compliant",
            "description": f"System scan found {len(critical_vulns)} Critical vulnerability that has not been remediated."
        })
        
    # Check 2: Are there users with excessive failed logins?
    locked_users = list(db["users"].find({"failed_attempts": {"$gte": 3}}))
    if len(locked_users) > 0:
        violations_found.append({
            "title": f"Unresolved Intrusion on user '{locked_users[0].get('username', 'Unknown')}'",
            "category": "Access Control",
            "status": "Non-Compliant",
            "description": f"System scan found {len(locked_users)} user account(s) currently locked out due to security intrusion alerts."
        })
        
    if not violations_found:
        return {"message": "Audit complete", "violation": None, "detail": "Your system is perfectly compliant! No violations discovered."}
        
    # Pick the first actual violation found
    violation = violations_found[0]
    
    # Save to MongoDB
    compliance_collection.insert_one(violation)
    
    # Trigger email notification
    send_compliance_alert(violation["title"])
    
    violation["_id"] = str(violation["_id"])
    
    return {"message": "Audit complete", "violation": violation}
