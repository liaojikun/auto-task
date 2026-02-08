import json
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
        async with httpx.AsyncClient() as client:
            try:
                base = self.base_url.rstrip('/')
               # 1. 获取 Crumb
                headers = {}
                crumb_resp = await client.get(f"{base}/crumbIssuer/api/json", auth=self.auth)
                if crumb_resp.status_code == 200:
                    c_data = crumb_resp.json()
                    headers[c_data['crumbRequestField']] = c_data['crumb']
                
                # 2. 构造 URL
                # 对于 Pipeline，最稳妥的方法是直接拼接到 URL 后面
                endpoint = "buildWithParameters" if params else "build"
                url = f"{base}/job/{job_name}/{endpoint}"

                # 3. 发送 POST 请求
                # 注意：params 参数在 httpx 中会处理成 URL 查询参数 (Query Params)
                jenkins_params = {"parameter": [{"name": k, "value": v} for k, v in params.items()]}
            
                payload = {
                    "json": json.dumps(jenkins_params),
                    **params
                }

                # 3. 发送请求
                response = await client.post(
                    url, 
                    auth=self.auth, 
                    data=payload,
                    headers=headers, 
                    timeout=10.0
                )
                
                if response.status_code in [200, 201]:
                    return True
                print(f"Failed: {response.status_code}")
                return False
            except Exception as e:
                print(f"Error: {e}")
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
