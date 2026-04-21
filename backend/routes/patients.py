from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from database import patients_collection
from auth_utils import get_current_user, require_admin
from bson import ObjectId

router = APIRouter(prefix="/patients", tags=["Patients"])

class PatientModel(BaseModel):
    name: str
    mrn: str
    mobile: str
    email: str
    address: str
    blood: str
    status: str
    age: str = "N/A"
    gender: str = "N/A"
    provider: str = "N/A"
    policy_no: str = "N/A"
    valid_until: str = "N/A"

@router.get("/")
def get_patients(current_user: dict = Depends(get_current_user)):
    patients = list(patients_collection.find({}))
    for p in patients:
        p["_id"] = str(p["_id"])
    return patients

@router.post("/", dependencies=[Depends(get_current_user)])
def add_patient(patient: PatientModel, current_user: dict = Depends(get_current_user)):
    patient_dict = patient.dict()
    result = patients_collection.insert_one(patient_dict)
    return {"message": "Patient registered successfully", "id": str(result.inserted_id)}

@router.put("/{patient_id}", dependencies=[Depends(get_current_user)])
def update_patient(patient_id: str, updated_data: dict, current_user: dict = Depends(get_current_user)):
    from database import bills_collection
    from notifications import record_anomaly, record_compliance_violation

    # Find the existing patient
    patient = patients_collection.find_one({"_id": ObjectId(patient_id)})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Financial Sync check - case-insensitive
    target_status = updated_data.get("status", "").upper()
    if target_status == "DISCHARGED":
        # CRITICAL: Check if there are any PENDING bills for this patient's MRN or Name
        # Using regex for case-insensitive 'pending' match and stripping whitespace mentally (matching frontend)
        pending_bills = bills_collection.count_documents({
            "$and": [
                {"status": {"$regex": "^pending$", "$options": "i"}},
                {"$or": [
                    {"mrn": patient["mrn"]},
                    {"patient": patient["name"]}
                ]}
            ]
        })
        if pending_bills > 0:
            details = f"Attempted to discharge patient {patient['name']} (MRN: {patient['mrn']}) while {pending_bills} bills are pending."
            record_compliance_violation(
                current_user.get("username"), 
                title="Discharge Audit Failure", 
                category="Administrative Safeguards",
                description="Unauthorized clinical status change without financial clearance.",
                details=details
            )
            record_anomaly(current_user.get("username"), type="Policy Violation", severity="High", description=details)
            
            raise HTTPException(
                status_code=403, 
                detail=f"CRITICAL: Discharge BLOCKED! Patient has {pending_bills} pending bills. This violation has been logged in the Compliance Audit and Security Dashboard."
            )

    # Remove _id if present to avoid immutable field error
    updated_data.pop("_id", None)
    
    patients_collection.update_one({"_id": ObjectId(patient_id)}, {"$set": updated_data})
    return {"message": "Patient updated successfully"}

@router.delete("/{patient_id}", dependencies=[Depends(require_admin)])
def delete_patient(patient_id: str, current_user: dict = Depends(require_admin)):
    result = patients_collection.delete_one({"_id": ObjectId(patient_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Patient not found")
    return {"message": "Patient deleted successfully"}
