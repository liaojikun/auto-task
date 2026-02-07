from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from pydantic import BaseModel
from datetime import datetime

from app.db.session import get_session
from app.models.models import ScheduleConfig
from app.services.scheduler_service import scheduler_service

router = APIRouter()

class CronPreviewRequest(BaseModel):
    cron_expression: str

@router.post("/", response_model=ScheduleConfig)
async def create_schedule(
    schedule: ScheduleConfig, 
    session: AsyncSession = Depends(get_session)
):
    session.add(schedule)
    await session.commit()
    await session.refresh(schedule)
    
    if schedule.is_active:
        await scheduler_service.add_job(schedule)
        
    return schedule

@router.get("/", response_model=List[ScheduleConfig])
async def read_schedules(
    skip: int = 0, 
    limit: int = 100, 
    session: AsyncSession = Depends(get_session)
):
    result = await session.execute(select(ScheduleConfig).offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/{schedule_id}", response_model=ScheduleConfig)
async def read_schedule(
    schedule_id: int, 
    session: AsyncSession = Depends(get_session)
):
    schedule = await session.get(ScheduleConfig, schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return schedule

@router.put("/{schedule_id}", response_model=ScheduleConfig)
async def update_schedule(
    schedule_id: int, 
    schedule_in: ScheduleConfig, 
    session: AsyncSession = Depends(get_session)
):
    schedule = await session.get(ScheduleConfig, schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    
    schedule_data = schedule_in.dict(exclude_unset=True)
    for key, value in schedule_data.items():
        if key != "id":
             setattr(schedule, key, value)
             
    session.add(schedule)
    await session.commit()
    await session.refresh(schedule)
    
    # Update Job
    await scheduler_service.add_job(schedule)
    
    return schedule

@router.delete("/{schedule_id}")
async def delete_schedule(
    schedule_id: int, 
    session: AsyncSession = Depends(get_session)
):
    schedule = await session.get(ScheduleConfig, schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    
    scheduler_service.remove_job(schedule.id)
    
    await session.delete(schedule)
    await session.commit()
    return {"ok": True}

@router.post("/toggle/{schedule_id}", response_model=ScheduleConfig)
async def toggle_schedule(
    schedule_id: int, 
    session: AsyncSession = Depends(get_session)
):
    schedule = await session.get(ScheduleConfig, schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    
    schedule.is_active = not schedule.is_active
    session.add(schedule)
    await session.commit()
    await session.refresh(schedule)
    
    await scheduler_service.add_job(schedule) 
    
    return schedule

@router.post("/preview-next", response_model=List[datetime])
async def preview_next_run_times(
    request: CronPreviewRequest
):
    return scheduler_service.get_next_run_times(request.cron_expression)
