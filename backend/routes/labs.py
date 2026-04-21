from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from database import labs_collection
from auth_utils import get_current_user
from bson import ObjectId

router = APIRouter(prefix="/labs", tags=["Labs"])

class LabModel(BaseModel):
    patient_name: str
    mrn_no: str
    mobile: str
    email: str
    test_name: str
    lab_id: str
    result: str # NORMAL, ABNORMAL, POSITIVE, PENDING
    date: str
    technician: str

@router.get("/")
async def get_labs(current_user: dict = Depends(get_current_user)):
    labs = list(labs_collection.find())
    for lab in labs:
        lab["_id"] = str(lab["_id"])
    return labs

@router.post("/")
async def add_lab(lab: LabModel, current_user: dict = Depends(get_current_user)):
    result = labs_collection.insert_one(lab.dict())
    return {"message": "Lab result added", "id": str(result.inserted_id)}

@router.delete("/{lab_id}")
async def delete_lab(lab_id: str, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
         raise HTTPException(status_code=403, detail="Only admins can delete lab results")
    result = labs_collection.delete_one({"_id": ObjectId(lab_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lab result not found")
    return {"message": "Lab result deleted"}
