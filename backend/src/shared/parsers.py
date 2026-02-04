"""
Shared utilities and helpers
"""
import hashlib
from typing import List, Dict, Any
import pypdf
from src.core.models import Question


class DocumentParser:
    """PDF document parsing and chunking"""
    
    @staticmethod
    def parse_pdf(file_path: str) -> Dict[str, Any]:
        """Parse PDF file and extract text"""
        with open(file_path, 'rb') as f:
            reader = pypdf.PdfReader(f)
            text = "\n".join(page.extract_text() for page in reader.pages)
        return {
            "text": text,
            "pages": len(reader.pages),
            "hash": hashlib.sha256(text.encode()).hexdigest()
        }
    
    @staticmethod
    def chunk_text(text: str, chunk_size: int = 500, overlap: int = 100) -> List[Dict[str, Any]]:
        """Split text into overlapping chunks"""
        chunks = []
        step = chunk_size - overlap
        for i in range(0, len(text), step):
            chunk = text[i:i + chunk_size]
            if len(chunk.strip()) > 50:
                chunks.append({
                    "id": f"chunk_{hashlib.md5(chunk.encode()).hexdigest()}",
                    "text": chunk,
                    "start": i,
                    "end": i + len(chunk)
                })
        return chunks


class QuestionnaireParser:
    """Questionnaire PDF parsing"""
    
    SECTIONS = {
        'General Firm Information', 'General Fund Information', 'Investment Strategy',
        'Investment Process', 'Team', 'Alignment of Interest', 'Market Environment',
        'Fund Terms', 'Firm Governance', 'ESG', 'Track Record', 'Accounting',
        'Legal/Administration', 'Diversity and Inclusion'
    }
    
    @staticmethod
    def parse_questionnaire_pdf(file_path: str) -> List[Question]:
        """Parse questionnaire PDF and extract questions"""
        parsed = DocumentParser.parse_pdf(file_path)
        sections = QuestionnaireParser._extract_sections(parsed["text"])
        return QuestionnaireParser._extract_questions(sections)
    
    @staticmethod
    def _extract_sections(text: str) -> Dict[str, str]:
        """Extract sections from questionnaire text"""
        sections = {}
        current_section = None
        current_content = []
        
        for line in text.split('\n'):
            if any(marker in line for marker in QuestionnaireParser.SECTIONS):
                if current_section:
                    sections[current_section] = '\n'.join(current_content)
                current_section = line.strip()
                current_content = []
            elif current_section:
                current_content.append(line)
        
        if current_section:
            sections[current_section] = '\n'.join(current_content)
        return sections
    
    @staticmethod
    def _extract_questions(sections: Dict[str, str]) -> List[Question]:
        """Extract questions from sections"""
        questions = []
        order = 0
        
        for section_name, content in sections.items():
            for line in content.split('\n'):
                if line.strip() and (line[0].isdigit() or line.startswith('Q')) and len(line.strip()) > 10:
                    questions.append(Question(
                        id=f"q_{order}",
                        section=section_name,
                        order=order,
                        text=line.strip()
                    ))
                    order += 1
        
        return questions[:50]
