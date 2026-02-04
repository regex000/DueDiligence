"""
Multi-model adapter for multiple LLM providers
"""
import httpx
import json
from typing import List, Dict, Any
from src.domain.ports.multi_model import MultiModelLLMPort
from src.infrastructure.model_registry import ModelRegistry
from src.core.config import get_settings


class MultiModelLLMAdapter(MultiModelLLMPort):
    """Adapter for multiple LLM providers with fallback strategy"""
    
    # OpenRouter model ID mappings - using valid OpenRouter model IDs
    # These are actual models available on OpenRouter
    OPENROUTER_MODEL_MAP = {
        "deepseek-r1-0528": "deepseek/deepseek-r1",
        "deepseek-r1t-chimera": "deepseek/deepseek-r1",
        "deepseek-r1t2-chimera": "deepseek/deepseek-r1",
        "qwen3-coder-480b": "qwen/qwen-2-7b-instruct",
        "mistral-small-3.1": "mistralai/mistral-7b-instruct",
        "qwen3-next-80b": "qwen/qwen-2-7b-instruct",
        "glm-4.5-air": "openai/gpt-3.5-turbo",
        "trinity-large": "meta-llama/llama-3.1-70b-instruct",
        "hermes-3-405b": "meta-llama/llama-3.1-70b-instruct",
        "step-3.5-flash": "meta-llama/llama-3.1-8b-instruct",
        "nemotron-3-nano": "meta-llama/llama-3.1-8b-instruct",
        "solar-pro-3": "meta-llama/llama-3.1-8b-instruct",
        "gemma-3-2b": "google/gemma-2-9b-it",
        "gemma-3-4b": "google/gemma-2-9b-it",
        "qwen3-4b": "qwen/qwen-2-7b-instruct",
        "llama-3.2-3b": "meta-llama/llama-3.1-8b-instruct",
        "llama-3.3-70b": "meta-llama/llama-3.1-70b-instruct",
        "gemma-3-12b": "google/gemma-2-9b-it",
        "gemma-3-27b": "google/gemma-2-9b-it",
        "trinity-mini": "meta-llama/llama-3.1-8b-instruct",
        "nemotron-nano-12b-vl": "meta-llama/llama-3.1-8b-instruct",
        "molmo2-8b": "meta-llama/llama-3.1-8b-instruct",
        "r1t-chimera": "meta-llama/llama-3.1-8b-instruct",
    }
    
    def __init__(self):
        self.settings = get_settings()
        self.clients: Dict[str, httpx.AsyncClient] = {}
    
    async def generate_with_model(self, model_id: str, prompt: str, **kwargs) -> str:
        """Generate response using a specific model"""
        model = ModelRegistry.get_model(model_id)
        if not model:
            raise ValueError(f"Model {model_id} not found")
        
        # Map to OpenRouter model ID
        openrouter_model = self.OPENROUTER_MODEL_MAP.get(model_id, model_id)
        
        try:
            client = await self._get_openrouter_client()
            response = await client.post(
                "/chat/completions",
                json={
                    "model": openrouter_model,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": kwargs.get("temperature", 0.7),
                    "max_tokens": kwargs.get("max_tokens", 1000),
                    "top_p": kwargs.get("top_p", 0.9),
                },
                timeout=30.0
            )
            
            if response.status_code == 200:
                data = response.json()
                return data["choices"][0]["message"]["content"]
            else:
                raise ValueError(f"API returned status {response.status_code}: {response.text}")
        except Exception as e:
            raise ValueError(f"Failed to generate with model {model_id}: {str(e)}")
    
    async def generate_with_fallback(self, model_ids: List[str], prompt: str, **kwargs) -> str:
        """Generate response with fallback models"""
        last_error = None
        
        for model_id in model_ids:
            try:
                model = ModelRegistry.get_model(model_id)
                if not model:
                    continue
                
                # Map to OpenRouter model ID
                openrouter_model = self.OPENROUTER_MODEL_MAP.get(model_id, model_id)
                
                client = await self._get_openrouter_client()
                response = await client.post(
                    "/chat/completions",
                    json={
                        "model": openrouter_model,
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": kwargs.get("temperature", 0.7),
                        "max_tokens": kwargs.get("max_tokens", 1000),
                    },
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    try:
                        data = response.json()
                        return data["choices"][0]["message"]["content"]
                    except (json.JSONDecodeError, KeyError, IndexError) as e:
                        last_error = f"Invalid response format from {model_id}: {str(e)}"
                        continue
                elif response.status_code == 401:
                    last_error = "Unauthorized: Invalid or missing API key"
                    continue
                elif response.status_code == 400:
                    try:
                        error_data = response.json()
                        error_msg = error_data.get('error', {}).get('message', 'Unknown error')
                        last_error = f"Bad request: {error_msg}. Ensure OpenRouter API key is valid and model exists."
                    except:
                        last_error = f"Bad request from {model_id}: {response.text[:200]}"
                    continue
                else:
                    last_error = f"API error from {model_id}: status {response.status_code}"
                    continue
            except Exception as e:
                last_error = f"Error with {model_id}: {str(e)}"
                continue
        
        if last_error:
            raise RuntimeError(f"All fallback models failed. Last error: {last_error}")
        else:
            raise RuntimeError("No valid models provided")
    
    async def batch_generate(self, requests: List[Dict[str, Any]], model_ids: List[str]) -> List[str]:
        """Generate responses for multiple requests"""
        results = []
        for req in requests:
            result = await self.generate_with_fallback(
                model_ids,
                req.get("prompt", ""),
                **req.get("params", {})
            )
            results.append(result)
        return results
    
    async def _get_openrouter_client(self) -> httpx.AsyncClient:
        """Get or create an HTTP client for OpenRouter"""
        endpoint = "openrouter"
        if endpoint not in self.clients:
            self.clients[endpoint] = httpx.AsyncClient(
                base_url=self.settings.openrouter_base_url,
                headers={
                    "Authorization": f"Bearer {self.settings.openrouter_api_key}",
                    "HTTP-Referer": "https://due-diligence.local",
                    "X-Title": "Due Diligence Agent"
                }
            )
        return self.clients[endpoint]
    
    async def _get_client(self, endpoint: str) -> httpx.AsyncClient:
        """Get or create an HTTP client for an endpoint"""
        if endpoint not in self.clients:
            self.clients[endpoint] = httpx.AsyncClient(
                base_url=endpoint,
                headers={"Authorization": f"Bearer {self.settings.openrouter_api_key}"}
            )
        return self.clients[endpoint]
    
    async def close(self):
        """Close all HTTP clients"""
        for client in self.clients.values():
            await client.aclose()
