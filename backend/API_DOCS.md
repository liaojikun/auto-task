# TestFlow Pro API Documentation

**Base URL**: `http://localhost:8000/api/v1`
**Version**: 1.0.0

---

## 1. Notifications Module
Manage notification configurations (Feishu, DingTalk, Email).

### 1.1 Create Notification Config
Create a new notification configuration.

*   **URL**: `/notifications/`
*   **Method**: `POST`
*   **Request Body**:
    ```json
    {
      "name": "Dev Team Feishu",
      "type": "FEISHU",
      "webhook_url": "https://open.feishu.cn/open-apis/bot/v2/hook/...",
      "secret": "optional_sign_secret",
      "is_active": true
    }
    ```
    *   `type`: Enum `["FEISHU", "DINGTALK", "EMAIL"]`
    *   `smtp_config`: Object (Optional) for Email type `{"host": "...", "port": 587, ...}`.

### 1.2 List Notification Configs
Get a list of all notification configurations.

*   **URL**: `/notifications/`
*   **Method**: `GET`
*   **Query Params**: `skip` (int, default 0), `limit` (int, default 100)
*   **Response**: `List[NotificationConfig]`

### 1.3 Get Notification Config
*   **URL**: `/notifications/{config_id}`
*   **Method**: `GET`

### 1.4 Update Notification Config
*   **URL**: `/notifications/{config_id}`
*   **Method**: `PUT`
*   **Request Body**: Fields to update (partial or full).

### 1.5 Delete Notification Config
*   **URL**: `/notifications/{config_id}`
*   **Method**: `DELETE`

### 1.6 Test Notification (Stateless)
Send a test message using the provided config data (without saving to DB).

*   **URL**: `/notifications/test`
*   **Method**: `POST`
*   **Request Body**: `NotificationConfig` object.
*   **Response**: `true` if successful, `false` otherwise.

### 1.7 Test Notification (Existing)
Send a test message using an existing configuration ID.

*   **URL**: `/notifications/test/{config_id}`
*   **Method**: `POST`

---

## 2. Templates Module
Manage test task templates and link them to Jenkins jobs.

### 2.1 Create Template
*   **URL**: `/templates/`
*   **Method**: `POST`
*   **Request Body**:
    ```json
    {
      "name": "Smoke Test - Backend",
      "jenkins_job_name": "backend-smoke-test",
      "default_env": "sit",
      "params": "{\"tags\": \"@smoke\"}",
      "auto_notify": true,
      "available_envs": ["dev", "sit", "uat"],
      "notification_ids": [1, 2]
    }
    ```
    *   `params`: JSON string for Jenkins parameters.
    *   `auto_notify`: Boolean to enable automatic notifications.

### 2.2 List Templates
*   **URL**: `/templates/`
*   **Method**: `GET`

### 2.3 Get Template
*   **URL**: `/templates/{template_id}`
*   **Method**: `GET`

### 2.4 Update Template
*   **URL**: `/templates/{template_id}`
*   **Method**: `PUT`

### 2.5 Delete Template
*   **URL**: `/templates/{template_id}`
*   **Method**: `DELETE`

### 2.6 List Jenkins Jobs
Helper endpoint to fetch available jobs from the connected Jenkins instance.

*   **URL**: `/templates/jenkins-jobs`
*   **Method**: `GET`
*   **Response**:
    ```json
    [
      {
        "_class": "hudson.model.FreeStyleProject",
        "name": "backend-smoke-test",
        "url": "http://jenkins:8080/job/backend-smoke-test/",
        "color": "blue"
      }
    ]
    ```

---

## 3. Dashboard Module
Operational endpoints for triggering tasks and monitoring status.

### 3.1 Trigger Task
Manually trigger a test template.

*   **URL**: `/dashboard/trigger`
*   **Method**: `POST`
*   **Request Body**:
    ```json
    {
      "template_id": 1,
      "env": "dev" 
    }
    ```
    *   `env`: Optional. Defaults to template's `default_env`.
*   **Response**: `TaskExecution` object (Status: `QUEUED`).
    *   Includes new fields: `execution_env`, `suite_stats` (null initially), `triggered_by`, `template_name`.

### 3.2 List Running Tasks
Get currently active tasks (QUEUED or RUNNING).

*   **URL**: `/dashboard/running`
*   **Method**: `GET`
*   **Response**: `List[TaskExecution]`

### 3.3 Get Recent History
Get the most recent execution history.

*   **URL**: `/dashboard/recent`
*   **Method**: `GET`
*   **Query Params**: `limit` (default 20).
*   **Response**: `List[TaskExecution]`

---

## 4. Schedules Module
Manage automated Cron-based triggers.

### 4.1 Create Schedule
*   **URL**: `/schedules/`
*   **Method**: `POST`
*   **Request Body**:
    ```json
    {
      "template_id": 1,
      "cron_expression": "0 2 * * *",
      "target_env": "sit",
      "is_active": true,
      "description": "Daily Nightly Build"
    }
    ```

### 4.2 List Schedules
*   **URL**: `/schedules/`
*   **Method**: `GET`

### 4.3 Get Schedule
*   **URL**: `/schedules/{schedule_id}`
*   **Method**: `GET`

### 4.4 Update Schedule
*   **URL**: `/schedules/{schedule_id}`
*   **Method**: `PUT`
*   **Note**: Updates automatically refresh the background job if `is_active` is true.

### 4.5 Delete Schedule
*   **URL**: `/schedules/{schedule_id}`
*   **Method**: `DELETE`

### 4.6 Toggle Schedule
Enable or disable a schedule without deleting it.

*   **URL**: `/schedules/toggle/{schedule_id}`
*   **Method**: `POST`
*   **Response**: Updated `ScheduleConfig`.

### 4.7 Preview Next Run Times
Calculate upcoming execution times for a Cron expression.

*   **URL**: `/schedules/preview-next`
*   **Method**: `POST`
*   **Request Body**:
    ```json
    {
      "cron_expression": "*/5 * * * *"
    }
    ```
*   **Response**: List of ISO 8601 Datetime strings.

---

## 5. System Config Module
Manage system global configurations (e.g., Environment names, Jenkins Job names).

### 5.1 Create System Config
Add a new configuration item.

*   **URL**: `/system-configs/`
*   **Method**: `POST`
*   **Request Body**:
    ```json
    {
      "type_name": "ENV",
      "name": "production",
      "value": "prod",
      "created_by": "admin"
    }
    ```

### 5.2 List System Configs
Get all configurations grouped by type.

*   **URL**: `/system-configs/`
*   **Method**: `GET`
*   **Response**:
    ```json
    {
      "data": [
        {
          "ENV": ["prod", "uat", "sit", "dev"]
        },
        {
          "JOB_NAME": ["backend-test", "frontend-test"]
        }
      ]
    }
    ```