"""
LLM adapter for OpenRouter API
"""
from typing import List, Dict, Any
import httpx
import json
from src.domain.ports.services import LLMPort
from src.core.models import Answer, Citation
from src.core.config import get_settings


class OpenRouterLLMAdapter(LLMPort):
    """Adapter for OpenRouter LLM API"""
    
    def __init__(self):
        self.settings = get_settings()
        self.client = httpx.AsyncClient(
            base_url=self.settings.openrouter_base_url,
            headers={"Authorization": f"Bearer {self.settings.openrouter_api_key}"}
        )
    
    async def generate_answer(self, question: str, context_chunks: List[Dict[str, Any]]) -> Answer:
        """Generate an answer for a question using context chunks"""
        context_text = "\n\n".join([f"[{c['id']}] {c['text']}" for c in context_chunks[:5]])
        prompt = self._build_prompt(question, context_text)
        
        response = await self.client.post(
            "/chat/completions",
            json={
                "model": self.settings.model_name,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.3,
                "max_tokens": 500
            }
        )
        
        try:
            response_data = response.json()
            if "choices" not in response_data or not response_data["choices"]:
                raise ValueError("No choices in response")
            
            content = response_data["choices"][0]["message"]["content"]
            if not content or not content.strip():
                raise ValueError("Empty response content from LLM")
            
            data = json.loads(content)
        except json.JSONDecodeError as e:
            print(f"[ERROR] Failed to parse LLM response as JSON: {e}")
            print(f"[DEBUG] Response content: {content if 'content' in locals() else 'N/A'}")
            # Return a default answer if parsing fails
            return Answer(
                question_id="",
                text="Unable to generate answer - LLM response parsing failed",
                is_answerable=False,
                citations=[],
                confidence=0.0
            )
        except Exception as e:
            print(f"[ERROR] Unexpected error in generate_answer: {e}")
            return Answer(
                question_id="",
                text="Unable to generate answer - unexpected error",
                is_answerable=False,
                citations=[],
                confidence=0.0
            )
        
        citations = [
            Citation(
                chunk_id=cid,
                text=next((c["text"] for c in context_chunks if c["id"] == cid), ""),
                confidence=data.get("confidence", 0.7)
            )
            for cid in data.get("citations", [])
        ]
        
        return Answer(
            question_id="",
            text=data.get("answer", ""),
            is_answerable=data.get("is_answerable", False),
            citations=citations,
            confidence=data.get("confidence", 0.5)
        )
    
    @staticmethod
    def _build_prompt(question: str, context: str) -> str:
        """Build the prompt for the LLM"""
        return f"""You are a due diligence expert. Answer based on documents.

Question: {question}

Context:
{context}

Respond in JSON: {{"answer": "...", "is_answerable": true/false, "confidence": 0.0-1.0, "citations": ["id1"]}}"""
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()
