"""
Multi-model use case for intelligent model selection and generation
"""
from typing import List
from src.domain.services_multi import ModelSelector
from src.domain.ports.multi_model import MultiModelLLMPort
from src.models_multi import ModelSelectionRequest, ModelSelectionResponse, TaskType


class MultiModelUseCase:
    """Use case for intelligent multi-model selection and generation"""
    
    def __init__(self, selector: ModelSelector, llm: MultiModelLLMPort):
        self.selector = selector
        self.llm = llm
    
    async def select_best_model(self, request: ModelSelectionRequest) -> ModelSelectionResponse:
        """Select the best model for a request"""
        models = self.selector.select_models(request, count=3)
        
        if not models:
            raise ValueError("No suitable models found for the given request")
        
        primary = models[0]
        fallbacks = models[1:] if len(models) > 1 else []
        
        reason = self._generate_reason(request, primary)
        
        return ModelSelectionResponse(
            selected_model=primary,
            alternative_models=fallbacks,
            reason=reason
        )
    
    async def generate_with_best_model(self, task_type: TaskType, prompt: str, **kwargs) -> str:
        """Generate response using the best model for the task"""
        request = ModelSelectionRequest(
            task_type=task_type,
            context_length=kwargs.get("context_length", 1000),
            priority=kwargs.get("priority", "balanced"),
            require_vision=kwargs.get("require_vision", False),
            require_reasoning=kwargs.get("require_reasoning", False),
        )
        
        models = self.selector.select_models(request, count=3)
        model_ids = [m.id for m in models]
        
        return await self.llm.generate_with_fallback(
            model_ids,
            prompt,
            temperature=kwargs.get("temperature", 0.7),
            max_tokens=kwargs.get("max_tokens", 1000),
        )
    
    async def batch_generate(self, task_type: TaskType, prompts: List[str], **kwargs) -> List[str]:
        """Generate responses for multiple prompts"""
        request = ModelSelectionRequest(
            task_type=task_type,
            context_length=kwargs.get("context_length", 1000),
            priority=kwargs.get("priority", "balanced"),
        )
        
        models = self.selector.select_models(request, count=3)
        model_ids = [m.id for m in models]
        
        requests = [{"prompt": p, "params": kwargs} for p in prompts]
        return await self.llm.batch_generate(requests, model_ids)
    
    @staticmethod
    def _generate_reason(request: ModelSelectionRequest, model) -> str:
        """Generate a reason for model selection"""
        reasons = []
        
        if request.priority == "speed":
            reasons.append(f"Selected for speed ({model.latency_ms}ms latency)")
        elif request.priority == "quality":
            reasons.append(f"Selected for quality ({model.params/1e9:.1f}B parameters)")
        else:
            reasons.append("Selected for balanced performance")
        
        if request.context_length > 100_000:
            reasons.append(f"Supports large context ({model.context_window:,} tokens)")
        
        if request.require_reasoning:
            reasons.append("Optimized for reasoning tasks")
        
        return "; ".join(reasons)
