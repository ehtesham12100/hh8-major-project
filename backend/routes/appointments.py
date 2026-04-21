from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from database import appointments_collection
from auth_utils import get_current_user
from bson import ObjectId
import json

router = APIRouter(prefix="/appointments", tags=["Appointments"])

class AppointmentModel(BaseModel):
    patient_name: str
    patient_id: str
    doctor: str
    department: str
    date: str
    time: str
    type: str # Follow-up, Routine, X-Ray, Emergency
    status: str # UPCOMING, COMPLETED
    notes: str = ""

@router.get("/")
async def get_appointments(current_user: dict = Depends(get_current_user)):
    appointments = list(appointments_collection.find())
    for appointment in appointments:
        appointment["_id"] = str(appointment["_id"])
    return appointments

@router.post("/")
async def add_appointment(appointment: AppointmentModel, current_user: dict = Depends(get_current_user)):
    result = appointments_collection.insert_one(appointment.dict())
    return {"message": "Appointment created", "id": str(result.inserted_id)}

@router.delete("/{appointment_id}")
async def delete_appointment(appointment_id: str, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
         raise HTTPException(status_code=403, detail="Only admins can delete appointments")
    result = appointments_collection.delete_one({"_id": ObjectId(appointment_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"message": "Appointment deleted"}
