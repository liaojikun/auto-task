from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlmodel import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from pydantic import BaseModel
import json
from datetime import datetime

from app.db.session import get_session
from app.models.models import TestTemplate, TaskExecution, TaskStatus, TriggerType
from app.services.jenkins_service import jenkins_service

router = APIRouter()

class TriggerRequest(BaseModel):
    template_id: int
    env: Optional[str] = None
    auto_notify: Optional[bool] = None

@router.post("/trigger", response_model=TaskExecution)
async def trigger_task(
    request: TriggerRequest,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session)
):
    # 1. Get Template
    template = await session.get(TestTemplate, request.template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    # Update last_used
    template.last_used = datetime.now()
    session.add(template)
    # We commit later with execution

    # 2. Determine Env
    target_env = request.env if request.env else template.default_env
    
    # Determine Notification logic
    should_notify = request.auto_notify if request.auto_notify is not None else template.auto_notify

    # 3. Create Execution Record (QUEUED)
    execution = TaskExecution(
        template_id=template.id,
        status=TaskStatus.QUEUED,
        trigger_type=TriggerType.MANUAL,
        should_notify=should_notify,
        execution_env=target_env,
        triggered_by="admin",  # Placeholder
        template_name=template.name
    )
    session.add(execution)
    await session.commit()
    await session.refresh(execution)

    # 4. Call Jenkins
    try:
        job_params = json.loads(template.params) if template.params else {}
    except json.JSONDecodeError:
        job_params = {}
    
    job_params["env"] = target_env
    
    queue_url = await jenkins_service.trigger_job(template.jenkins_job_name, job_params)
    
    if queue_url:
        execution.jenkins_queue_item_url = queue_url
        session.add(execution)
        await session.commit()
        await session.refresh(execution)
    else:
        execution.status = TaskStatus.FAILURE
        execution.duration = 0
        session.add(execution)
        await session.commit()
        await session.refresh(execution)
        raise HTTPException(status_code=500, detail="Failed to trigger Jenkins Job")

    return execution

@router.get("/running", response_model=List[TaskExecution])
async def get_running_tasks(
    session: AsyncSession = Depends(get_session)
):
    statement = select(TaskExecution).where(
        (TaskExecution.status == TaskStatus.QUEUED) | 
        (TaskExecution.status == TaskStatus.RUNNING)
    )
    result = await session.execute(statement)
    return result.scalars().all()

@router.get("/recent", response_model=List[TaskExecution])
async def get_recent_history(
    limit: int = 20,
    session: AsyncSession = Depends(get_session)
):
    statement = select(TaskExecution).order_by(desc(TaskExecution.start_time)).limit(limit)
    result = await session.execute(statement)
    return result.scalars().all()
