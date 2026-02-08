from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
from sqlmodel import SQLModel, Field, Relationship, Column
from sqlalchemy import JSON

class NotificationType(str, Enum):
    FEISHU = "FEISHU"
    DINGTALK = "DINGTALK"
    EMAIL = "EMAIL"

class TaskStatus(str, Enum):
    QUEUED = "QUEUED"
    RUNNING = "RUNNING"
    SUCCESS = "SUCCESS"
    FAILURE = "FAILURE"
    ABORTED = "ABORTED"

class TriggerType(str, Enum):
    MANUAL = "MANUAL"
    SCHEDULE = "SCHEDULE"

class NotificationConfig(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    type: NotificationType
    webhook_url: Optional[str] = None
    secret: Optional[str] = None
    smtp_config: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    is_active: bool = True

class TestTemplate(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    jenkins_job_name: str
    default_env: str
    available_envs: List[str] = Field(default=[], sa_column=Column(JSON))
    
    # New fields
    params: str = Field(default="{}", description="JSON string parameters for Jenkins")
    auto_notify: bool = Field(default=False, description="Whether to send notifications automatically")
    last_used: Optional[datetime] = Field(default=None)
    
    notification_ids: List[int] = Field(default=[], sa_column=Column(JSON))
    
    # Relationships
    schedules: List["ScheduleConfig"] = Relationship(back_populates="template")
    executions: List["TaskExecution"] = Relationship(back_populates="template")

class ScheduleConfig(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    template_id: int = Field(foreign_key="testtemplate.id")
    cron_expression: str
    target_env: str
    is_active: bool = False
    description: Optional[str] = None
    
    # Relationships
    template: Optional[TestTemplate] = Relationship(back_populates="schedules")

class TaskExecution(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    template_id: int = Field(foreign_key="testtemplate.id")
    build_number: Optional[int] = None
    status: TaskStatus = TaskStatus.QUEUED
    trigger_type: TriggerType
    start_time: datetime = Field(default_factory=datetime.utcnow)
    duration: Optional[int] = None
    allure_report_url: Optional[str] = None
    should_notify: bool = Field(default=False)
    
    execution_env: Optional[str] = None
    suite_stats: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    triggered_by: Optional[str] = None

    stats: Optional[Dict[str, int]] = Field(default=None, sa_column=Column(JSON))
    
    # Relationships
    template: Optional[TestTemplate] = Relationship(back_populates="executions")

class SystemConfig(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    type_name: str = Field(index=True)
    name: str
    value: str
    created_by: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
