"""
Multi-model API routes
"""
from fastapi import APIRouter, HTTPException
from typing import List

from src.models_multi import (
    ModelSelectionRequest, ModelSelectionResponse, TaskType,
    BatchRequest, BatchResponse, LLMModel, ModelCapability, ModelTier
)
from src.infrastructure.model_registry import ModelRegistry
from src.domain.services_multi import ModelSelector
from src.infrastructure.multi_model_adapter import MultiModelLLMAdapter
from src.application.multi_model_use_case import MultiModelUseCase

# Initialize multi-model components
selector = ModelSelector()
llm_adapter = MultiModelLLMAdapter()
multi_model_uc = MultiModelUseCase(selector, llm_adapter)

# Create router
multi_model_router = APIRouter()


@multi_model_router.get("/")
async def list_all_models() -> dict:
    """List all available free LLM models"""
    models = ModelRegistry.get_all_models()
    return {
        "total": len(models),
        "models": [m.model_dump() for m in models]
    }


# Specific routes must come before generic /{model_id} route
@multi_model_router.get("/capability/{capability}")
async def get_models_by_capability(capability: str) -> dict:
    """Get models by capability"""
    try:
        cap = ModelCapability(capability)
    except ValueError:
        valid_caps = [c.value for c in ModelCapability]
        raise HTTPException(
            status_code=400,
            detail=f"Invalid capability '{capability}'. Valid options: {valid_caps}"
        )
    models = ModelRegistry.get_by_capability(cap)
    return {
        "capability": capability,
        "count": len(models),
        "models": [m.model_dump() for m in models]
    }


@multi_model_router.get("/tier/{tier}")
async def get_models_by_tier(tier: str) -> dict:
    """Get models by tier"""
    try:
        tier_enum = ModelTier(tier)
    except ValueError:
        valid_tiers = [t.value for t in ModelTier]
        raise HTTPException(
            status_code=400,
            detail=f"Invalid tier '{tier}'. Valid options: {valid_tiers}"
        )
    models = ModelRegistry.get_by_tier(tier_enum)
    return {
        "tier": tier,
        "count": len(models),
        "models": [m.model_dump() for m in models]
    }


@multi_model_router.get("/provider/{provider}")
async def get_models_by_provider(provider: str) -> dict:
    """Get models by provider"""
    models = ModelRegistry.get_by_provider(provider)
    return {
        "provider": provider,
        "count": len(models),
        "models": [m.model_dump() for m in models]
    }


@multi_model_router.get("/performance/fastest")
async def get_fastest_models(limit: int = 5) -> dict:
    """Get fastest models"""
    models = ModelRegistry.get_fastest_models(limit)
    return {
        "count": len(models),
        "models": [m.model_dump() for m in models]
    }


@multi_model_router.get("/performance/throughput")
async def get_highest_throughput(limit: int = 5) -> dict:
    """Get models with highest throughput"""
    models = ModelRegistry.get_highest_throughput(limit)
    return {
        "count": len(models),
        "models": [m.model_dump() for m in models]
    }


@multi_model_router.get("/performance/context")
async def get_largest_context(limit: int = 5) -> dict:
    """Get models with largest context window"""
    models = ModelRegistry.get_largest_context(limit)
    return {
        "count": len(models),
        "models": [m.model_dump() for m in models]
    }


@multi_model_router.get("/stats")
async def get_stats() -> dict:
    """Get statistics about available models"""
    models = ModelRegistry.get_all_models()
    
    return {
        "total_models": len(models),
        "by_tier": {
            tier.value: len(ModelRegistry.get_by_tier(tier))
            for tier in ModelTier
        },
        "by_capability": {
            cap.value: len(ModelRegistry.get_by_capability(cap))
            for cap in ModelCapability
        },
        "by_provider": {
            provider: len(ModelRegistry.get_by_provider(provider))
            for provider in set(m.provider for m in models)
        },
        "avg_context_window": sum(m.context_window for m in models) / len(models),
        "avg_latency_ms": sum(m.latency_ms for m in models) / len(models),
        "total_parameters": sum(m.params for m in models),
    }


# Generic route must come last
@multi_model_router.get("/{model_id}")
async def get_model(model_id: str) -> dict:
    """Get details of a specific model"""
    model = ModelRegistry.get_model(model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    return {"model": model.model_dump()}


@multi_model_router.post("/select")
async def select_best_model(request: ModelSelectionRequest) -> ModelSelectionResponse:
    """Select best model for a task"""
    return await multi_model_uc.select_best_model(request)


@multi_model_router.post("/generate")
async def generate_with_best_model(
    task_type: TaskType,
    prompt: str,
    priority: str = "balanced",
    context_length: int = 1000,
    max_tokens: int = 1000,
    temperature: float = 0.7
) -> dict:
    """Generate response using best model for task"""
    try:
        result = await multi_model_uc.generate_with_best_model(
            task_type,
            prompt,
            priority=priority,
            context_length=context_length,
            max_tokens=max_tokens,
            temperature=temperature
        )
        return {"response": result}
    except RuntimeError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Generation failed: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )


@multi_model_router.post("/batch")
async def batch_generate(request: BatchRequest) -> BatchResponse:
    """Generate responses for multiple prompts"""
    if not request.requests:
        raise HTTPException(status_code=400, detail="No requests provided")
    
    prompts = [r.get("prompt", "") for r in request.requests]
    task_type = request.requests[0].get("task_type", TaskType.QUESTION_ANSWERING)
    
    results = await multi_model_uc.batch_generate(
        task_type,
        prompts,
        priority=request.requests[0].get("priority", "balanced")
    )
    
    return BatchResponse(
        results=[{"prompt": p, "response": r} for p, r in zip(prompts, results)],
        total_tokens=int(sum(len(r.split()) for r in results) * 1.3),
        total_cost=0.0,
        execution_time_ms=0
    )
