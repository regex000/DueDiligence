"""
Multi-model domain services
"""
from typing import List
from src.models_multi import LLMModel, ModelSelectionRequest, TaskType, ModelCapability, ModelTier
from src.domain.ports.multi_model import ModelSelectorPort
from src.infrastructure.model_registry import ModelRegistry


class ModelSelector(ModelSelectorPort):
    """Intelligent model selection based on task requirements"""
    
    TASK_CAPABILITY_MAP = {
        TaskType.REASONING: [ModelCapability.REASONING, ModelCapability.LONG_CONTEXT],
        TaskType.CODING: [ModelCapability.CODING, ModelCapability.BALANCED],
        TaskType.SUMMARIZATION: [ModelCapability.FAST, ModelCapability.BALANCED],
        TaskType.TRANSLATION: [ModelCapability.BALANCED, ModelCapability.FAST],
        TaskType.QUESTION_ANSWERING: [ModelCapability.BALANCED, ModelCapability.LONG_CONTEXT],
        TaskType.CREATIVE: [ModelCapability.BALANCED, ModelCapability.LONG_CONTEXT],
        TaskType.ANALYSIS: [ModelCapability.REASONING, ModelCapability.LONG_CONTEXT],
        TaskType.VISION: [ModelCapability.VISION, ModelCapability.BALANCED],
    }
    
    def select_model(self, request: ModelSelectionRequest) -> LLMModel:
        """Select the best model for a request"""
        candidates = self._filter_candidates(request)
        return self._rank_and_select(candidates, request.priority)
    
    def select_models(self, request: ModelSelectionRequest, count: int = 3) -> List[LLMModel]:
        """Select multiple models for a request"""
        candidates = self._filter_candidates(request)
        ranked = self._rank_candidates(candidates, request.priority)
        return ranked[:count]
    
    def _filter_candidates(self, request: ModelSelectionRequest) -> List[LLMModel]:
        """Filter models based on request requirements"""
        all_models = ModelRegistry.get_all_models()
        
        # Filter by vision requirement
        if request.require_vision:
            all_models = [m for m in all_models if ModelCapability.VISION in m.capabilities]
        
        # Filter by context length
        all_models = [m for m in all_models if m.context_window >= request.context_length]
        
        # Filter by task capabilities
        required_caps = self.TASK_CAPABILITY_MAP.get(request.task_type, [])
        if required_caps:
            all_models = [
                m for m in all_models
                if any(cap in m.capabilities for cap in required_caps)
            ]
        
        # Filter by reasoning requirement
        if request.require_reasoning:
            all_models = [m for m in all_models if ModelCapability.REASONING in m.capabilities]
        
        return all_models if all_models else ModelRegistry.get_all_models()
    
    def _rank_and_select(self, candidates: List[LLMModel], priority: str) -> LLMModel:
        """Rank candidates and select the best one"""
        ranked = self._rank_candidates(candidates, priority)
        if ranked:
            return ranked[0]
        
        # Fallback to first available model
        all_models = ModelRegistry.get_all_models()
        if all_models:
            return all_models[0]
        
        raise ValueError("No models available in registry")
    
    def _rank_candidates(self, candidates: List[LLMModel], priority: str) -> List[LLMModel]:
        """Rank candidates based on priority"""
        if priority == "speed":
            return sorted(candidates, key=lambda m: (m.latency_ms, m.tier.value))
        elif priority == "quality":
            return sorted(candidates, key=lambda m: (-m.params, -m.context_window))
        else:  # balanced
            return sorted(
                candidates,
                key=lambda m: (m.latency_ms * 0.3 + m.params / 1e9 * 0.7, m.tier.value)
            )
