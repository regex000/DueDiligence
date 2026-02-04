"""
Multi-model port definitions (interfaces)
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Any
from src.models_multi import LLMModel, ModelSelectionRequest


class ModelSelectorPort(ABC):
    """Abstract model selector port"""
    
    @abstractmethod
    def select_model(self, request: ModelSelectionRequest) -> LLMModel:
        """Select the best model for a request"""
        ...
    
    @abstractmethod
    def select_models(self, request: ModelSelectionRequest, count: int = 3) -> List[LLMModel]:
        """Select multiple models for a request"""
        ...


class MultiModelLLMPort(ABC):
    """Abstract multi-model LLM port"""
    
    @abstractmethod
    async def generate_with_model(self, model_id: str, prompt: str, **kwargs) -> str:
        """Generate response using a specific model"""
        ...
    
    @abstractmethod
    async def generate_with_fallback(self, model_ids: List[str], prompt: str, **kwargs) -> str:
        """Generate response with fallback models"""
        ...
    
    @abstractmethod
    async def batch_generate(self, requests: List[Dict[str, Any]], model_ids: List[str]) -> List[str]:
        """Generate responses for multiple requests"""
        ...
