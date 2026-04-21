from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from database import bills_collection
from auth_utils import get_current_user
from bson import ObjectId

router = APIRouter(prefix="/bills", tags=["Bills"])

class BillModel(BaseModel):
    patient: str
    mrn: str
    invoice: str
    amount: float
    services: str
    date: str
    status: str # PAID, PENDING

@router.get("/")
async def get_bills(current_user: dict = Depends(get_current_user)):
    bills = list(bills_collection.find())
    for bill in bills:
        bill["_id"] = str(bill["_id"])
    return bills

@router.post("/")
async def add_bill(bill: BillModel, current_user: dict = Depends(get_current_user)):
    result = bills_collection.insert_one(bill.dict())
    return {"message": "Bill added", "id": str(result.inserted_id)}

@router.delete("/{bill_id}")
async def delete_bill(bill_id: str, current_user: dict = Depends(get_current_user)):
    result = bills_collection.delete_one({"_id": ObjectId(bill_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Bill not found")
    return {"message": "Bill deleted"}

@router.patch("/{bill_id}")
async def update_bill_status(bill_id: str, payload: dict, current_user: dict = Depends(get_current_user)):
    # Simple status update: {"status": "PAID"}
    if "status" not in payload:
        raise HTTPException(status_code=400, detail="Missing status field")
    
    result = bills_collection.update_one(
        {"_id": ObjectId(bill_id)},
        {"$set": {"status": payload["status"].upper()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Bill not found")
    
    return {"message": "Bill updated successfully"}
