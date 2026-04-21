from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from database import reports_collection
from auth_utils import get_current_user
from bson import ObjectId

router = APIRouter(prefix="/reports", tags=["Reports"])

class ReportModel(BaseModel):
    patient_name: str
    patient_id: str
    mobile: str
    test_name: str
    blood_group: str
    result: str # Normal, Abnormal, Negative
    date: str
    doctor: str

@router.get("/")
def get_reports(current_user: dict = Depends(get_current_user)):
    reports = list(reports_collection.find({}))
    for r in reports:
        r["_id"] = str(r["_id"])
    return reports

@router.post("/", dependencies=[Depends(get_current_user)])
def add_report(report: ReportModel, current_user: dict = Depends(get_current_user)):
    report_dict = report.dict()
    result = reports_collection.insert_one(report_dict)
    return {"message": "Report added successfully", "id": str(result.inserted_id)}
