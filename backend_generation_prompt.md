# Backend Development Prompts for TestFlow Pro

**Role:** Expert Python Backend Engineer (FastAPI + Enterprise Architecture)
**Project:** TestFlow Pro (Automated Testing Management Platform)
**Goal:** Build a production-ready backend to support the existing React frontend, organizing development around 4 key functional modules.

---

## 1. Project Initialization & Stack
Initialize a **FastAPI** project using Python 3.10+.
**Dependencies:** `fastapi`, `uvicorn`, `sqlmodel` (or `sqlalchemy` + `pydantic`), `alembic`, `apscheduler`, `httpx` (async), `aiomysql`.

**Directory Structure:**
```text
backend/
├── app/
│   ├── api/            # Route controllers (v1)
│   ├── core/           # Config, Events, Security
│   ├── db/             # Database connection & Session
│   ├── models/         # SQLModel database tables
│   ├── services/       # JenkinsService, SchedulerService, NotificationService
│   └── main.py
├── .env
└── requirements.txt
```

---

## 2. Configuration & Environment
**Constraint:** Hardcode or configure the following connections for the development environment.

*   **Database (MySQL):** `192.168.1.100:3306` | User: `auto` | Pass: `piWdyspk6Ax8Z52N` | DB: `auto`
*   **Jenkins:** `http://192.168.1.100:8080` | User: `admin` | Pass: `admin`

---

## 3. Database Schema Design (SQLModel)
Design the following entities. Use `Foreign Key` relationships where appropriate.

1.  **TestTemplate (Task Definitions):**
    *   `id`: Primary Key.
    *   `name`: String.
    *   `jenkins_job_name`: String (Jenkins Job ID).
    *   `default_env`: String (e.g., 'sit').
    *   `available_envs`: JSON (e.g., `["dev", "sit", "uat"]`).
    *   `notification_ids`: JSON/String (List of NotificationConfig IDs to alert).

2.  **NotificationConfig (Message & Push):**
    *   `id`: Primary Key.
    *   `name`: String (e.g., "Dev Team Feishu").
    *   `type`: Enum ('FEISHU', 'DINGTALK', 'EMAIL').
    *   `webhook_url`: String (for Bots).
    *   `secret`: String (for Bot signature).
    *   `smtp_config`: JSON (Host, Port, User, Pass - encrypted ideally).
    *   `is_active`: Boolean.

3.  **ScheduleConfig (Timing):**
    *   `id`: Primary Key.
    *   `template_id`: FK to TestTemplate.
    *   `cron_expression`: String (e.g., "0 0 * * *").
    *   `target_env`: String.
    *   `is_active`: Boolean (Toggle switch state).
    *   `description`: String.

4.  **TaskExecution (History & Monitor):**
    *   `id`: Primary Key.
    *   `template_id`: FK to TestTemplate.
    *   `build_number`: Int.
    *   `status`: Enum (QUEUED, RUNNING, SUCCESS, FAILURE, ABORTED).
    *   `trigger_type`: Enum (MANUAL, SCHEDULE).
    *   `start_time`: Datetime.
    *   `duration`: Int.
    *   `allure_report_url`: String.
    *   `stats`: JSON (total, passed, failed, skipped).

---

## 4. Module Implementation Details

### A. Message Templates & Push Config (`/api/notifications`)
*   **Function:** Manage notification metadata.
*   **Endpoints:**
    *   `POST /test`: Trigger a "Test Message" to the provided config to verify Webhook/SMTP connectivity immediately.
    *   `POST /preview`: Return the rendered HTML/Markdown for a sample message (for frontend preview).
    *   CRUD for `NotificationConfig`.
*   **Service Logic:** Implement `NotificationService` that handles the actual sending logic for Feishu (Card format), DingTalk (Markdown), and Email (HTML).

### B. Task Management (`/api/templates`)
*   **Function:** Create and manage "Quick Trigger Templates".
*   **Endpoints:**
    *   Full CRUD for `TestTemplate`.
    *   `GET /jenkins-jobs`: Optional helper to fetch available jobs from Jenkins to populate the dropdown during creation.

### C. Task Dashboard (`/api/dashboard`)
*   **Function:** Real-time Trigger & Monitoring.
*   **Endpoints:**
    *   `POST /trigger`: Execute a template (Manual Trigger). Calls Jenkins API `buildWithParameters`.
    *   `GET /running`: List active tasks. *Logic:* Poll Jenkins or DB status.
    *   `GET /recent`: History list.
*   **Logic:**
    *   **Auto-Allure:** When a task finishes (detected via Polling Service), generate the URL: `{jenkins_url}/job/{job_name}/{build_id}/allure/`.

### D. Schedule Configuration (`/api/schedules`)
*   **Function:** Automation Management.
*   **Endpoints:**
    *   `POST /toggle/{id}`: Enable/Disable a schedule. *Action:* Add/Remove job from `APScheduler` runtime.
    *   `GET /preview-next`: Input a Cron expression, return the *Next 5 execution times* (calculated via `croniter` or `apscheduler` util) for UI display.
    *   CRUD for `ScheduleConfig`.

---

## 5. Background Services
*   **Status Poller:** A background loop (every 10s) that checks `RUNNING` tasks against Jenkins API.
    *   If status changes to FINAL, update DB `status`, `duration`, `stats`, and `allure_report_url`.
    *   **Trigger Notification:** If the template has linked `notification_ids`, call `NotificationService` to send the result report.

---

## 6. AI Prompt to Start
*Use this prompt to begin:*

> "Act as a Senior Python Backend Developer. Based on the requirements above, please setup the FastAPI project structure. First, provide `database.py` (Async MySQL) and `models.py` (SQLModel for Template, Notification, Schedule, Task). Then, implement the `NotificationService` specifically handling Feishu Webhook sending and the `api/notifications.py` controller with the 'Test Send' endpoint."