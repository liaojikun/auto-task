import asyncio
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from datetime import datetime

from app.db.session import async_session
from app.models.models import TaskExecution, TaskStatus, TestTemplate, NotificationConfig
from app.services.jenkins_service import jenkins_service
from app.services.notification_service import notification_service

logger = logging.getLogger(__name__)

class StatusPoller:
    def __init__(self):
        self.running = False

    async def start(self):
        self.running = True
        logger.info("Status Poller started")
        while self.running:
            try:
                await self.poll()
            except Exception as e:
                logger.error(f"Error in poller loop: {e}")
            await asyncio.sleep(10)

    async def stop(self):
        self.running = False

    async def poll(self):
        async with async_session() as session:
            # 1. Handle QUEUED tasks
            await self._process_queued_tasks(session)
            
            # 2. Handle RUNNING tasks
            await self._process_running_tasks(session)

    async def _process_queued_tasks(self, session: AsyncSession):
        result = await session.execute(
            select(TaskExecution).where(TaskExecution.status == TaskStatus.QUEUED)
        )
        tasks = result.scalars().all()
        
        for task in tasks:
            template = await session.get(TestTemplate, task.template_id)
            if not template:
                continue

            last_build = await jenkins_service.get_build_info(template.jenkins_job_name, "lastBuild")
            if last_build:
                build_number = last_build.get("number")
                task.build_number = build_number
                task.status = TaskStatus.RUNNING
                
                if "timestamp" in last_build:
                    task.start_time = datetime.fromtimestamp(last_build["timestamp"] / 1000)

                session.add(task)
                await session.commit()

    async def _process_running_tasks(self, session: AsyncSession):
        result = await session.execute(
            select(TaskExecution).where(TaskExecution.status == TaskStatus.RUNNING)
        )
        tasks = result.scalars().all()

        for task in tasks:
            if not task.build_number:
                continue 

            template = await session.get(TestTemplate, task.template_id)
            if not template:
                continue

            build_info = await jenkins_service.get_build_info(template.jenkins_job_name, task.build_number)
            if not build_info:
                continue

            if build_info.get("building"):
                continue 

            result_str = build_info.get("result", "UNKNOWN")
            
            if result_str == "SUCCESS":
                task.status = TaskStatus.SUCCESS
            elif result_str == "FAILURE":
                task.status = TaskStatus.FAILURE
            elif result_str == "ABORTED":
                task.status = TaskStatus.ABORTED
            else:
                task.status = TaskStatus.FAILURE 

            task.duration = build_info.get("duration", 0)
            
            jenkins_url = jenkins_service.base_url
            task.allure_report_url = f"{jenkins_url}/job/{template.jenkins_job_name}/{task.build_number}/allure/"
            
            task.stats = {"total": 0, "passed": 0, "failed": 0, "skipped": 0} 
            
            session.add(task)
            await session.commit()
            
            await self._trigger_notification(session, task, template)

    async def _trigger_notification(self, session: AsyncSession, task: TaskExecution, template: TestTemplate):
        if not task.should_notify:
            return

        if not template.notification_ids:
            return

        for notif_id in template.notification_ids:
            config = await session.get(NotificationConfig, notif_id)
            if config:
                title = f"Task Finished: {template.name} (#{task.build_number})"
                content = f"Status: {task.status}\nDuration: {task.duration}ms\nReport: {task.allure_report_url}"
                await notification_service.send_message(config, title, content)

status_poller = StatusPoller()
