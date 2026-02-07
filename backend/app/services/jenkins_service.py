import httpx
from app.core.config import settings

class JenkinsService:
    def __init__(self):
        self.base_url = settings.JENKINS_URL
        self.auth = (settings.JENKINS_USER, settings.JENKINS_PASS)

    async def get_jobs(self):
        """Fetch all jobs from Jenkins."""
        async with httpx.AsyncClient() as client:
            try:
                # Jenkins API to get jobs depth 1
                url = f"{self.base_url}/api/json?tree=jobs[name,url,color]"
                response = await client.get(url, auth=self.auth, timeout=10.0)
                response.raise_for_status()
                data = response.json()
                return data.get("jobs", [])
            except Exception as e:
                print(f"Error fetching Jenkins jobs: {e}")
                return []

    async def trigger_job(self, job_name: str, params: dict = None):
        """Trigger a build with parameters."""
        async with httpx.AsyncClient() as client:
            try:
                # buildWithParameters if params, else build
                endpoint = "buildWithParameters" if params else "build"
                url = f"{self.base_url}/job/{job_name}/{endpoint}"
                
                # Jenkins requires POST for build
                response = await client.post(url, auth=self.auth, params=params, timeout=10.0)
                
                if response.status_code == 201:
                    # Created (In queue)
                    # We might want to get the queue item location to track it, but for now just return success
                    return True
                
                print(f"Failed to trigger job {job_name}: {response.status_code} {response.text}")
                return False
            except Exception as e:
                print(f"Error triggering Jenkins job: {e}")
                return False

    async def get_build_info(self, job_name: str, build_number: int):
        """Get details of a specific build."""
        async with httpx.AsyncClient() as client:
            try:
                url = f"{self.base_url}/job/{job_name}/{build_number}/api/json"
                response = await client.get(url, auth=self.auth, timeout=10.0)
                if response.status_code == 404:
                    return None
                response.raise_for_status()
                return response.json()
            except Exception as e:
                print(f"Error fetching build info: {e}")
                return None
                
    async def get_queue_item(self, queue_url: str):
        """Check queue item to get build number when it starts."""
        pass # To be implemented if we want exact tracking from trigger

jenkins_service = JenkinsService()
