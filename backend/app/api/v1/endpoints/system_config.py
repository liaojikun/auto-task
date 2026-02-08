from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any
from pydantic import BaseModel
from datetime import datetime

from app.db.session import get_session
from app.models.models import SystemConfig

router = APIRouter()

class SystemConfigCreate(BaseModel):
    type_name: str
    name: str
    value: str
    created_by: str

class SystemConfigResponse(BaseModel):
    data: List[Dict[str, List[str]]]

@router.post("/", response_model=SystemConfig)
async def create_system_config(
    config: SystemConfigCreate,
    session: AsyncSession = Depends(get_session)
):
    db_config = SystemConfig(
        type_name=config.type_name,
        name=config.name,
        value=config.value,
        created_by=config.created_by,
        created_at=datetime.utcnow()
    )
    session.add(db_config)
    await session.commit()
    await session.refresh(db_config)
    return db_config

@router.get("/", response_model=SystemConfigResponse)
async def get_system_configs(
    session: AsyncSession = Depends(get_session)
):
    statement = select(SystemConfig)
    results = await session.execute(statement)
    configs = results.scalars().all()
    
    # Group by type_name
    grouped_data = {}
    for config in configs:
        if config.type_name not in grouped_data:
            grouped_data[config.type_name] = []
        grouped_data[config.type_name].append(config.value)
    
    # Format as requested: [{"Type1": ["val1", "val2"]}, ...]
    data_list = []
    for type_name, values in grouped_data.items():
        data_list.append({type_name: values})
        
    return {"data": data_list}
