import httpx
import json
import time
import hmac
import hashlib
import base64
from app.models.models import NotificationConfig, NotificationType

class NotificationService:
    async def send_test_message(self, config: NotificationConfig) -> bool:
        message = f"This is a test message from TestFlow Pro. Config: {config.name}"
        return await self.send_message(config, "Test Message", message)

    async def send_message(self, config: NotificationConfig, title: str, content: str) -> bool:
        if not config.is_active:
            return False

        if config.type == NotificationType.FEISHU:
            return await self._send_feishu(config, title, content)
        elif config.type == NotificationType.DINGTALK:
            return await self._send_dingtalk(config, title, content)
        elif config.type == NotificationType.EMAIL:
            return await self._send_email(config, title, content)
        return False

    async def _send_feishu(self, config: NotificationConfig, title: str, content: str) -> bool:
        """
        Send Feishu interactive card or simple text.
        """
        if not config.webhook_url:
            return False

        # Simplified text message for this demo, can be upgraded to Card
        payload = {
            "msg_type": "text",
            "content": {
                "text": f"{title}{content}"
            }
        }
        
        # Handle signature if secret is present
        if config.secret:
            timestamp = str(round(time.time()))
            secret = config.secret
            string_to_sign = '{}{}'.format(timestamp, secret)
            hmac_code = hmac.new(string_to_sign.encode("utf-8"), digestmod=hashlib.sha256).digest()
            sign = base64.b64encode(hmac_code).decode('utf-8')
            payload["timestamp"] = timestamp
            payload["sign"] = sign

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(config.webhook_url, json=payload, timeout=10.0)
                response.raise_for_status()
                res_json = response.json()
                return res_json.get("code") == 0
            except Exception as e:
                print(f"Error sending Feishu message: {e}")
                return False

    async def _send_dingtalk(self, config: NotificationConfig, title: str, content: str) -> bool:
        # Placeholder for DingTalk
        print(f"Mock DingTalk send to {config.webhook_url}: {title} - {content}")
        return True

    async def _send_email(self, config: NotificationConfig, title: str, content: str) -> bool:
        # Placeholder for Email
        print(f"Mock Email send: {title}")
        return True

notification_service = NotificationService()
