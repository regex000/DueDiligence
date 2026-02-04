"""
API module initialization
"""
from src.api.routes import router
from src.api.multi_model_routes import multi_model_router

__all__ = ["router", "multi_model_router"]
