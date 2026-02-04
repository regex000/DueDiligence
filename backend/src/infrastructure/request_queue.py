"""
Request queue for tracking async operations
"""
from typing import Dict, Any, Optional
from datetime import datetime
import uuid


class RequestQueue:
    """In-memory request queue for tracking async operations"""
    
    def __init__(self):
        self.requests: Dict[str, Dict[str, Any]] = {}
    
    def create_request(self, project_id: Optional[str] = None) -> str:
        """Create a new request and return its ID"""
        request_id = str(uuid.uuid4())
        self.requests[request_id] = {
            "id": request_id,
            "status": "QUEUED",
            "created_at": datetime.now().isoformat(),
            "project_id": project_id,
        }
        return request_id
    
    def mark_processing(self, request_id: str) -> None:
        """Mark a request as processing"""
        if request_id in self.requests:
            self.requests[request_id]["status"] = "PROCESSING"
            self.requests[request_id]["started_at"] = datetime.now().isoformat()
    
    def mark_completed(self, request_id: str) -> None:
        """Mark a request as completed"""
        if request_id in self.requests:
            self.requests[request_id]["status"] = "COMPLETED"
            self.requests[request_id]["completed_at"] = datetime.now().isoformat()
    
    def mark_failed(self, request_id: str, error: str) -> None:
        """Mark a request as failed"""
        if request_id in self.requests:
            self.requests[request_id]["status"] = "FAILED"
            self.requests[request_id]["error"] = error
            self.requests[request_id]["failed_at"] = datetime.now().isoformat()
    
    def get_request(self, request_id: str) -> Optional[Dict[str, Any]]:
        """Get a request by ID"""
        return self.requests.get(request_id)
