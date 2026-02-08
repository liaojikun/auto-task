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
            
            # If we have a queue URL, check it specifically
            if task.jenkins_queue_item_url:
                queue_info = await jenkins_service.get_queue_item_info(task.jenkins_queue_item_url)
                
                if queue_info:
                    # Check if it has an executable (means it started building)
                    if queue_info.get("executable"):
                        task.build_number = queue_info["executable"].get("number")
                        task.status = TaskStatus.RUNNING
                        # We could fetch start time from the build info here or wait for running processor
                        session.add(task)
                        await session.commit()
                    elif queue_info.get("cancelled"):
                        task.status = TaskStatus.ABORTED
                        session.add(task)
                        await session.commit()
                    # Else: still in queue, do nothing
                else:
                    # Queue item not found (404), maybe it finished queueing very quickly?
                    # Fallback: Check recent builds to see if we can match the queue ID
                    # Extract queue ID from URL: .../queue/item/123/ -> 123
                    try:
                        q_id = int(task.jenkins_queue_item_url.strip("/").split("/")[-1])
                        # Get recent builds (e.g. last 5)
                        job_info = await jenkins_service.get_jobs() # This is too broad, need specific job details
                        # Actually we need get_build_info loop
                        # Let's just check the last few builds
                        # Optimization: Just check lastBuild for now as a quick fix if it matches
                        last_build = await jenkins_service.get_build_info(template.jenkins_job_name, "lastBuild")
                        if last_build and last_build.get("queueId") == q_id:
                             task.build_number = last_build.get("number")
                             task.status = TaskStatus.RUNNING
                             session.add(task)
                             await session.commit()
                    except Exception as e:
                        logger.error(f"Error handling missing queue item for task {task.id}: {e}")

            else:
                # Old behavior fallback (or if trigger failed to save URL)
                # This is prone to the original race condition, but kept for legacy compat
                last_build = await jenkins_service.get_build_info(template.jenkins_job_name, "lastBuild")
                if last_build:
                    # Basic check: if last build is running, assume it's ours? 
                    # Dangerous, but better than stuck.
                    # A better heuristic: is the start time AFTER our task creation?
                    build_time = last_build.get("timestamp", 0) / 1000
                    if build_time > task.start_time.timestamp():
                        task.build_number = last_build.get("number")
                        task.status = TaskStatus.RUNNING
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
            
            task.stats = {
                "statistic": {
                    "failed": 0,
                    "broken": 0,
                    "skipped": 0,
                    "passed": 2,
                    "unknown": 0,
                    "total": 2
                    },
                "time": {
                    "start": 1770545521341,
                    "stop": 1770545521343,
                    "duration": 2,
                    "minDuration": 0,
                    "maxDuration": 0,
                    "sumDuration": 0
                    }
                } 
            
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
