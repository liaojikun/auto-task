from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db.session import get_session
from app.models.models import NotificationConfig
from app.services.notification_service import notification_service

router = APIRouter()

@router.post("/", response_model=NotificationConfig)
async def create_notification_config(
    config: NotificationConfig, 
    session: AsyncSession = Depends(get_session)
):
    session.add(config)
    await session.commit()
    await session.refresh(config)
    return config

@router.get("/", response_model=List[NotificationConfig])
async def read_notification_configs(
    skip: int = 0, 
    limit: int = 100, 
    session: AsyncSession = Depends(get_session)
):
    result = await session.execute(select(NotificationConfig).offset(skip).limit(limit))
    configs = result.scalars().all()
    return configs

@router.get("/{config_id}", response_model=NotificationConfig)
async def read_notification_config(
    config_id: int, 
    session: AsyncSession = Depends(get_session)
):
    config = await session.get(NotificationConfig, config_id)
    if not config:
        raise HTTPException(status_code=404, detail="Notification Config not found")
    return config

@router.put("/{config_id}", response_model=NotificationConfig)
async def update_notification_config(
    config_id: int, 
    config_in: NotificationConfig, 
    session: AsyncSession = Depends(get_session)
):
    config = await session.get(NotificationConfig, config_id)
    if not config:
        raise HTTPException(status_code=404, detail="Notification Config not found")
    
    config_data = config_in.dict(exclude_unset=True)
    for key, value in config_data.items():
        if key != "id": # Prevent ID update
             setattr(config, key, value)
             
    session.add(config)
    await session.commit()
    await session.refresh(config)
    return config

@router.delete("/{config_id}")
async def delete_notification_config(
    config_id: int, 
    session: AsyncSession = Depends(get_session)
):
    config = await session.get(NotificationConfig, config_id)
    if not config:
        raise HTTPException(status_code=404, detail="Notification Config not found")
    await session.delete(config)
    await session.commit()
    return {"ok": True}

@router.post("/test", response_model=bool)
async def test_notification_config(
    config: NotificationConfig
):
    return await notification_service.send_test_message(config)

@router.post("/test/{config_id}", response_model=bool)
async def test_existing_notification_config(
    config_id: int,
    session: AsyncSession = Depends(get_session)
):
    config = await session.get(NotificationConfig, config_id)
    if not config:
        raise HTTPException(status_code=404, detail="Notification Config not found")
    return await notification_service.send_test_message(config)
