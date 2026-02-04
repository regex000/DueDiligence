"""
Multi-model LLM data models
"""
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class ModelCapability(str, Enum):
    """Model capabilities"""
    REASONING = "reasoning"
    CODING = "coding"
    LONG_CONTEXT = "long_context"
    BALANCED = "balanced"
    FAST = "fast"
    VISION = "vision"
    QUESTION_ANSWERING = "question_answering"


class ModelTier(str, Enum):
    """Model tier classification"""
    NANO = "nano"
    SMALL = "small"
    MEDIUM = "medium"
    LARGE = "large"
    XLARGE = "xlarge"


class TaskType(str, Enum):
    """Task types for model selection"""
    QUESTION_ANSWERING = "question_answering"
    SUMMARIZATION = "summarization"
    REASONING = "reasoning"
    CODING = "coding"
    TRANSLATION = "translation"
    CLASSIFICATION = "classification"
    GENERATION = "generation"
    VISION = "vision"
    CREATIVE = "creative"
    ANALYSIS = "analysis"


class ModelProvider(str, Enum):
    """Supported model providers"""
    OPENROUTER = "openrouter"
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    LOCAL = "local"
    DEEPSEEK = "deepseek"
    QWEN = "qwen"
    MISTRAL = "mistral"
    GOOGLE = "google"
    META = "meta"
    NVIDIA = "nvidia"
    STEPFUN = "stepfun"
    UPSTAGE = "upstage"
    NOUS = "nous"
    ARCEE = "arcee"
    ALLENAI = "allenai"
    TNG = "tng"
    Z_AI = "z.ai"


class LLMModel(BaseModel):
    """LLM Model definition"""
    id: str
    name: str
    provider: str
    params: int
    context_window: int
    capabilities: List[ModelCapability] = Field(default_factory=list)
    tier: ModelTier
    weekly_tokens: str
    latency_ms: int
    throughput: int
    cost_per_1k_input: Optional[float] = None
    cost_per_1k_output: Optional[float] = None
    supports_streaming: bool = False
    supports_function_calling: bool = False
    is_available: bool = True
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    model_config = {"protected_namespaces": ()}


class ModelSelectionRequest(BaseModel):
    """Request for model selection"""
    task_type: TaskType
    context_length: int = 1000
    required_capabilities: List[ModelCapability] = Field(default_factory=list)
    prefer_cost_efficient: bool = False
    prefer_speed: bool = False
    prefer_quality: bool = True
    priority: str = "balanced"
    require_vision: bool = False
    require_reasoning: bool = False
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ModelSelectionResponse(BaseModel):
    """Response from model selection"""
    selected_model: LLMModel
    reason: str
    alternative_models: List[LLMModel] = Field(default_factory=list)


class GenerationRequest(BaseModel):
    """Request for text generation"""
    model_id: str
    prompt: str
    temperature: float = Field(default=0.7, ge=0, le=2)
    max_tokens: Optional[int] = None
    top_p: float = Field(default=1.0, ge=0, le=1)
    top_k: Optional[int] = None
    stop_sequences: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    model_config = {"protected_namespaces": ()}


class GenerationResponse(BaseModel):
    """Response from text generation"""
    model_id: str
    text: str
    finish_reason: str
    tokens_used: int
    cost: Optional[float] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    model_config = {"protected_namespaces": ()}


class BatchRequest(BaseModel):
    """Request for batch text generation"""
    requests: List[Dict[str, Any]]
    parallel: bool = False
    metadata: Dict[str, Any] = Field(default_factory=dict)


class BatchResponse(BaseModel):
    """Response from batch text generation"""
    results: List[Dict[str, Any]]
    total_cost: Optional[float] = None
    total_tokens: int
    execution_time_ms: float
    metadata: Dict[str, Any] = Field(default_factory=dict)
