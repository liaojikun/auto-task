from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
import logging
from croniter import croniter
from datetime import datetime

from app.db.session import async_session
from app.models.models import ScheduleConfig, TestTemplate, TaskExecution, TaskStatus, TriggerType
from app.services.jenkins_service import jenkins_service

logger = logging.getLogger(__name__)

class SchedulerService:
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self.scheduler.start()

    def get_next_run_times(self, cron_expr: str, limit: int = 5):
        try:
            base = datetime.now()
            iter = croniter(cron_expr, base)
            return [iter.get_next(datetime) for _ in range(limit)]
        except Exception:
            return []

    async def add_job(self, schedule: ScheduleConfig):
        # Remove existing if any
        self.remove_job(schedule.id)
        
        if not schedule.is_active:
            return

        try:
            trigger = CronTrigger.from_crontab(schedule.cron_expression)
            self.scheduler.add_job(
                self.execute_scheduled_task,
                trigger=trigger,
                id=str(schedule.id),
                args=[schedule.template_id, schedule.target_env],
                replace_existing=True
            )
            logger.info(f"Added job for schedule {schedule.id}")
        except Exception as e:
            logger.error(f"Failed to add job {schedule.id}: {e}")

    def remove_job(self, schedule_id: int):
        try:
            self.scheduler.remove_job(str(schedule_id))
            logger.info(f"Removed job {schedule_id}")
        except Exception:
            pass 

    async def execute_scheduled_task(self, template_id: int, env: str):
        logger.info(f"Executing scheduled task for template {template_id}")
        async with async_session() as session:
            template = await session.get(TestTemplate, template_id)
            if not template:
                logger.error(f"Template {template_id} not found during execution")
                return

            # Create Execution
            execution = TaskExecution(
                template_id=template.id,
                status=TaskStatus.QUEUED,
                trigger_type=TriggerType.SCHEDULE,
                stats={"env": env}
            )
            session.add(execution)
            await session.commit()
            await session.refresh(execution)

            # Trigger Jenkins
            params = {"env": env}
            success = await jenkins_service.trigger_job(template.jenkins_job_name, params)
            if not success:
                 execution.status = TaskStatus.FAILURE
                 session.add(execution)
                 await session.commit()

scheduler_service = SchedulerService()
