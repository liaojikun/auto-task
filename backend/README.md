# TestFlow Pro Backend

## Setup

1.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

2.  **Configuration:**
    Configuration is currently hardcoded in `app/core/config.py` for the development environment.

## Running

Run the FastAPI application using Uvicorn:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

Once running, access the Swagger UI at: http://localhost:8000/docs
