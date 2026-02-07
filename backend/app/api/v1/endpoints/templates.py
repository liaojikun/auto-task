from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Any

from app.db.session import get_session
from app.models.models import TestTemplate
from app.services.jenkins_service import jenkins_service

router = APIRouter()

@router.post("/", response_model=TestTemplate)
async def create_template(
    template: TestTemplate, 
    session: AsyncSession = Depends(get_session)
):
    session.add(template)
    await session.commit()
    await session.refresh(template)
    return template

@router.get("/", response_model=List[TestTemplate])
async def read_templates(
    skip: int = 0, 
    limit: int = 100, 
    session: AsyncSession = Depends(get_session)
):
    result = await session.execute(select(TestTemplate).offset(skip).limit(limit))
    templates = result.scalars().all()
    return templates

@router.get("/jenkins-jobs", response_model=List[Any])
async def get_jenkins_jobs():
    """Helper to fetch available jobs from Jenkins."""
    return await jenkins_service.get_jobs()

@router.get("/{template_id}", response_model=TestTemplate)
async def read_template(
    template_id: int, 
    session: AsyncSession = Depends(get_session)
):
    template = await session.get(TestTemplate, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template

@router.put("/{template_id}", response_model=TestTemplate)
async def update_template(
    template_id: int, 
    template_in: TestTemplate, 
    session: AsyncSession = Depends(get_session)
):
    template = await session.get(TestTemplate, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    template_data = template_in.dict(exclude_unset=True)
    for key, value in template_data.items():
        if key != "id":
             setattr(template, key, value)
             
    session.add(template)
    await session.commit()
    await session.refresh(template)
    return template

@router.delete("/{template_id}")
async def delete_template(
    template_id: int, 
    session: AsyncSession = Depends(get_session)
):
    template = await session.get(TestTemplate, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    await session.delete(template)
    await session.commit()
    return {"ok": True}
