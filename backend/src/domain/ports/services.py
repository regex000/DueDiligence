"""
Service port definitions (interfaces)
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Any
from src.core.models import Answer


class LLMPort(ABC):
    """Abstract LLM service port"""
    
    @abstractmethod
    async def generate_answer(self, question: str, context_chunks: List[Dict[str, Any]]) -> Answer:
        """Generate an answer for a question using context chunks"""
        ...


class DocumentParserPort(ABC):
    """Abstract document parser port"""
    
    @abstractmethod
    def parse_pdf(self, file_path: str) -> Dict[str, Any]:
        """Parse a PDF file"""
        ...
    
    @abstractmethod
    def chunk_text(self, text: str, chunk_size: int = 500, overlap: int = 100) -> List[Dict[str, Any]]:
        """Chunk text into overlapping segments"""
        ...


class QuestionnaireParserPort(ABC):
    """Abstract questionnaire parser port"""
    
    @abstractmethod
    def parse(self, file_path: str) -> List[Dict[str, Any]]:
        """Parse a questionnaire PDF"""
        ...
