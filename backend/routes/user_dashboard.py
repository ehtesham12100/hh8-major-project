from fastapi import APIRouter, Depends
from database import patients_collection, reports_collection, appointments_collection, bills_collection
from auth_utils import get_current_user

router = APIRouter(prefix="/user-dashboard", tags=["User Dashboard"])

@router.get("/summary")
async def get_user_summary(current_user: dict = Depends(get_current_user)):
    # Basic counts
    total_patients = patients_collection.count_documents({})
    total_reports = reports_collection.count_documents({})
    total_appointments = appointments_collection.count_documents({})
    
    # Financial aggregate
    bills = list(bills_collection.find())
    total_billed = sum(b.get("amount", 0) for b in bills)
    amount_paid = sum(b.get("amount", 0) for b in bills if b.get("status") == "PAID")
    balance_due = total_billed - amount_paid

    # Recent items
    recent_appts = list(appointments_collection.find().sort("_id", -1).limit(5))
    for a in recent_appts: a["_id"] = str(a["_id"])

    recent_reports = list(reports_collection.find().sort("_id", -1).limit(5))
    for r in recent_reports: r["_id"] = str(r["_id"])

    return {
        "stats": {
            "patients": total_patients,
            "reports": total_reports,
            "appointments": total_appointments,
            "balance": balance_due
        },
        "recent_appointments": recent_appts,
        "recent_reports": recent_reports
    }
