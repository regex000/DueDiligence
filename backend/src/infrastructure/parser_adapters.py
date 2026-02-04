"""
Parser adapters for document and questionnaire parsing
"""
from typing import List, Dict, Any
from src.shared.parsers import DocumentParser, QuestionnaireParser
from src.domain.ports.services import DocumentParserPort, QuestionnaireParserPort


class DocumentParserAdapter(DocumentParserPort):
    """Adapter for document parsing"""
    
    def parse_pdf(self, file_path: str) -> Dict[str, Any]:
        """Parse a PDF file"""
        return DocumentParser.parse_pdf(file_path)
    
    def chunk_text(self, text: str, chunk_size: int = 500, overlap: int = 100) -> List[Dict[str, Any]]:
        """Chunk text into overlapping segments"""
        return DocumentParser.chunk_text(text, chunk_size, overlap)


class QuestionnaireParserAdapter(QuestionnaireParserPort):
    """Adapter for questionnaire parsing"""
    
    def parse(self, file_path: str) -> List[Dict[str, Any]]:
        """Parse a questionnaire PDF"""
        questions = QuestionnaireParser.parse_questionnaire_pdf(file_path)
        return [q.model_dump() for q in questions]
