"""
Model registry for all available LLM models
"""
from src.models_multi import LLMModel, ModelCapability, ModelTier


class ModelRegistry:
    """Central registry of all free LLM models"""
    
    MODELS = {
        # Reasoning Models
        "deepseek-r1-0528": LLMModel(
            id="deepseek-r1-0528",
            name="DeepSeek R1 0528",
            provider="DeepSeek",
            params=12_000_000_000,
            context_window=163_840,
            capabilities=[ModelCapability.REASONING, ModelCapability.LONG_CONTEXT],
            tier=ModelTier.LARGE,
            weekly_tokens="12B",
            latency_ms=150,
            throughput=800
        ),
        "deepseek-r1t-chimera": LLMModel(
            id="deepseek-r1t-chimera",
            name="TNG: DeepSeek R1T Chimera",
            provider="TNG",
            params=26_000_000_000,
            context_window=163_840,
            capabilities=[ModelCapability.REASONING, ModelCapability.LONG_CONTEXT],
            tier=ModelTier.LARGE,
            weekly_tokens="26B",
            latency_ms=180,
            throughput=700
        ),
        "deepseek-r1t2-chimera": LLMModel(
            id="deepseek-r1t2-chimera",
            name="TNG: DeepSeek R1T2 Chimera",
            provider="TNG",
            params=113_000_000_000,
            context_window=163_840,
            capabilities=[ModelCapability.REASONING, ModelCapability.LONG_CONTEXT],
            tier=ModelTier.XLARGE,
            weekly_tokens="113B",
            latency_ms=200,
            throughput=600
        ),
        
        # Coding Models
        "qwen3-coder-480b": LLMModel(
            id="qwen3-coder-480b",
            name="Qwen: Qwen3 Coder 480B",
            provider="Qwen",
            params=480_000_000_000,
            context_window=262_000,
            capabilities=[ModelCapability.CODING, ModelCapability.LONG_CONTEXT],
            tier=ModelTier.XLARGE,
            weekly_tokens="3.3B",
            latency_ms=250,
            throughput=500
        ),
        "mistral-small-3.1": LLMModel(
            id="mistral-small-3.1",
            name="Mistral: Mistral Small 3.1 24B",
            provider="Mistral",
            params=24_000_000_000,
            context_window=128_000,
            capabilities=[ModelCapability.CODING, ModelCapability.BALANCED],
            tier=ModelTier.MEDIUM,
            weekly_tokens="183M",
            latency_ms=80,
            throughput=1200
        ),
        
        # Long Context Models
        "qwen3-next-80b": LLMModel(
            id="qwen3-next-80b",
            name="Qwen: Qwen3 Next 80B",
            provider="Qwen",
            params=80_000_000_000,
            context_window=262_144,
            capabilities=[ModelCapability.LONG_CONTEXT, ModelCapability.BALANCED],
            tier=ModelTier.LARGE,
            weekly_tokens="1.21B",
            latency_ms=120,
            throughput=900
        ),
        "glm-4.5-air": LLMModel(
            id="glm-4.5-air",
            name="Z.AI: GLM 4.5 Air",
            provider="Z.AI",
            params=49_600_000_000,
            context_window=131_072,
            capabilities=[ModelCapability.LONG_CONTEXT, ModelCapability.BALANCED],
            tier=ModelTier.LARGE,
            weekly_tokens="49.6B",
            latency_ms=100,
            throughput=1000
        ),
        "trinity-large": LLMModel(
            id="trinity-large",
            name="Arcee AI: Trinity Large Preview",
            provider="Arcee AI",
            params=181_000_000_000,
            context_window=131_000,
            capabilities=[ModelCapability.LONG_CONTEXT, ModelCapability.BALANCED],
            tier=ModelTier.XLARGE,
            weekly_tokens="181B",
            latency_ms=140,
            throughput=850
        ),
        "hermes-3-405b": LLMModel(
            id="hermes-3-405b",
            name="Nous: Hermes 3 405B Instruct",
            provider="Nous",
            params=405_000_000_000,
            context_window=131_072,
            capabilities=[ModelCapability.LONG_CONTEXT, ModelCapability.REASONING],
            tier=ModelTier.XLARGE,
            weekly_tokens="172M",
            latency_ms=220,
            throughput=550
        ),
        
        # Fast/Balanced Models
        "step-3.5-flash": LLMModel(
            id="step-3.5-flash",
            name="StepFun: Step 3.5 Flash",
            provider="StepFun",
            params=13_300_000_000,
            context_window=256_000,
            capabilities=[ModelCapability.FAST, ModelCapability.LONG_CONTEXT],
            tier=ModelTier.MEDIUM,
            weekly_tokens="13.3B",
            latency_ms=50,
            throughput=2000
        ),
        "nemotron-3-nano": LLMModel(
            id="nemotron-3-nano",
            name="NVIDIA: Nemotron 3 Nano 30B",
            provider="NVIDIA",
            params=30_000_000_000,
            context_window=256_000,
            capabilities=[ModelCapability.FAST, ModelCapability.LONG_CONTEXT],
            tier=ModelTier.MEDIUM,
            weekly_tokens="12.4B",
            latency_ms=60,
            throughput=1800
        ),
        "solar-pro-3": LLMModel(
            id="solar-pro-3",
            name="Upstage: Solar Pro 3",
            provider="Upstage",
            params=3_250_000_000,
            context_window=128_000,
            capabilities=[ModelCapability.FAST, ModelCapability.BALANCED],
            tier=ModelTier.SMALL,
            weekly_tokens="3.25B",
            latency_ms=40,
            throughput=2500
        ),
        
        # Nano Models (Ultra-fast)
        "gemma-3-2b": LLMModel(
            id="gemma-3-2b",
            name="Google: Gemma 3n 2B",
            provider="Google",
            params=2_000_000_000,
            context_window=8_192,
            capabilities=[ModelCapability.FAST],
            tier=ModelTier.NANO,
            weekly_tokens="87.7M",
            latency_ms=20,
            throughput=3000
        ),
        "gemma-3-4b": LLMModel(
            id="gemma-3-4b",
            name="Google: Gemma 3n 4B",
            provider="Google",
            params=4_000_000_000,
            context_window=8_192,
            capabilities=[ModelCapability.FAST],
            tier=ModelTier.NANO,
            weekly_tokens="27.5M",
            latency_ms=25,
            throughput=2800
        ),
        "qwen3-4b": LLMModel(
            id="qwen3-4b",
            name="Qwen: Qwen3 4B",
            provider="Qwen",
            params=4_000_000_000,
            context_window=40_960,
            capabilities=[ModelCapability.FAST],
            tier=ModelTier.NANO,
            weekly_tokens="98.9M",
            latency_ms=30,
            throughput=2600
        ),
        "llama-3.2-3b": LLMModel(
            id="llama-3.2-3b",
            name="Meta: Llama 3.2 3B Instruct",
            provider="Meta",
            params=3_000_000_000,
            context_window=131_072,
            capabilities=[ModelCapability.FAST, ModelCapability.LONG_CONTEXT],
            tier=ModelTier.NANO,
            weekly_tokens="73.9M",
            latency_ms=35,
            throughput=2400
        ),
        
        # Medium Models
        "llama-3.3-70b": LLMModel(
            id="llama-3.3-70b",
            name="Meta: Llama 3.3 70B Instruct",
            provider="Meta",
            params=70_000_000_000,
            context_window=128_000,
            capabilities=[ModelCapability.BALANCED, ModelCapability.LONG_CONTEXT],
            tier=ModelTier.LARGE,
            weekly_tokens="3.26B",
            latency_ms=110,
            throughput=950
        ),
        "gemma-3-12b": LLMModel(
            id="gemma-3-12b",
            name="Google: Gemma 3 12B",
            provider="Google",
            params=12_000_000_000,
            context_window=32_768,
            capabilities=[ModelCapability.BALANCED],
            tier=ModelTier.MEDIUM,
            weekly_tokens="70.3M",
            latency_ms=70,
            throughput=1400
        ),
        "gemma-3-27b": LLMModel(
            id="gemma-3-27b",
            name="Google: Gemma 3 27B",
            provider="Google",
            params=27_000_000_000,
            context_window=131_072,
            capabilities=[ModelCapability.BALANCED, ModelCapability.LONG_CONTEXT],
            tier=ModelTier.LARGE,
            weekly_tokens="1.33B",
            latency_ms=90,
            throughput=1100
        ),
        "trinity-mini": LLMModel(
            id="trinity-mini",
            name="Arcee AI: Trinity Mini",
            provider="Arcee AI",
            params=1_780_000_000,
            context_window=131_072,
            capabilities=[ModelCapability.FAST, ModelCapability.LONG_CONTEXT],
            tier=ModelTier.NANO,
            weekly_tokens="1.78B",
            latency_ms=45,
            throughput=2200
        ),
        
        # Vision Models
        "nemotron-nano-12b-vl": LLMModel(
            id="nemotron-nano-12b-vl",
            name="NVIDIA: Nemotron Nano 12B 2 VL",
            provider="NVIDIA",
            params=12_000_000_000,
            context_window=128_000,
            capabilities=[ModelCapability.VISION, ModelCapability.FAST],
            tier=ModelTier.MEDIUM,
            weekly_tokens="705M",
            latency_ms=75,
            throughput=1300
        ),
        
        # Specialized Models
        "molmo2-8b": LLMModel(
            id="molmo2-8b",
            name="AllenAI: Molmo2 8B",
            provider="AllenAI",
            params=8_000_000_000,
            context_window=36_864,
            capabilities=[ModelCapability.VISION, ModelCapability.FAST],
            tier=ModelTier.SMALL,
            weekly_tokens="548M",
            latency_ms=55,
            throughput=1600
        ),
        "r1t-chimera": LLMModel(
            id="r1t-chimera",
            name="TNG: R1T Chimera",
            provider="TNG",
            params=9_320_000_000,
            context_window=163_840,
            capabilities=[ModelCapability.REASONING, ModelCapability.LONG_CONTEXT],
            tier=ModelTier.SMALL,
            weekly_tokens="9.32B",
            latency_ms=95,
            throughput=1050
        ),
    }
    
    @classmethod
    def get_model(cls, model_id: str) -> LLMModel | None:
        """Get a model by ID"""
        return cls.MODELS.get(model_id)
    
    @classmethod
    def get_all_models(cls) -> list[LLMModel]:
        """Get all models"""
        return list(cls.MODELS.values())
    
    @classmethod
    def get_by_capability(cls, capability: ModelCapability) -> list[LLMModel]:
        """Get models by capability"""
        return [m for m in cls.MODELS.values() if capability in m.capabilities]
    
    @classmethod
    def get_by_tier(cls, tier: ModelTier) -> list[LLMModel]:
        """Get models by tier"""
        return [m for m in cls.MODELS.values() if m.tier == tier]
    
    @classmethod
    def get_by_provider(cls, provider: str) -> list[LLMModel]:
        """Get models by provider"""
        return [m for m in cls.MODELS.values() if m.provider == provider]
    
    @classmethod
    def get_fastest_models(cls, limit: int = 5) -> list[LLMModel]:
        """Get fastest models"""
        return sorted(cls.MODELS.values(), key=lambda m: m.latency_ms)[:limit]
    
    @classmethod
    def get_highest_throughput(cls, limit: int = 5) -> list[LLMModel]:
        """Get models with highest throughput"""
        return sorted(cls.MODELS.values(), key=lambda m: m.throughput, reverse=True)[:limit]
    
    @classmethod
    def get_largest_context(cls, limit: int = 5) -> list[LLMModel]:
        """Get models with largest context window"""
        return sorted(cls.MODELS.values(), key=lambda m: m.context_window, reverse=True)[:limit]
