"""
Domain services for document and project management
"""
from typing import List, Dict, Any
from src.domain.ports.repositories import (
    DocumentRepository, ChunkRepository, ProjectRepository, AnswerRepository
)
from src.core.models import Document, Project, Answer, ProjectStatus
import uuid


class DocumentService:
    """Service for document management"""
    
    def __init__(self, doc_repo: DocumentRepository, chunk_repo: ChunkRepository):
        self.doc_repo = doc_repo
        self.chunk_repo = chunk_repo
    
    async def index_document(self, doc: Document, chunks: List[Dict[str, Any]]) -> None:
        """Index a document with its chunks"""
        await self.doc_repo.save(doc)
        await self.chunk_repo.save_chunks(doc.id, chunks)


class ProjectService:
    """Service for project management"""
    
    def __init__(self, project_repo: ProjectRepository, answer_repo: AnswerRepository):
        self.project_repo = project_repo
        self.answer_repo = answer_repo
    
    async def create_project(self, name: str, questionnaire_id: str, document_ids: List[str]) -> Project:
        """Create a new project"""
        project = Project(
            id=str(uuid.uuid4()),
            name=name,
            questionnaire_id=questionnaire_id,
            document_ids=document_ids,
            status=ProjectStatus.ACTIVE
        )
        await self.project_repo.save(project)
        return project
    
    async def get_project(self, project_id: str) -> Project:
        """Get a project by ID"""
        return await self.project_repo.get(project_id)
    
    async def mark_outdated(self) -> None:
        """Mark projects without documents as outdated"""
        projects = await self.project_repo.get_all()
        for project in projects:
            if not project.document_ids:
                await self.project_repo.update_status(project.id, ProjectStatus.OUTDATED)


class AnswerService:
    """Service for answer management"""
    
    def __init__(self, answer_repo: AnswerRepository):
        self.answer_repo = answer_repo
    
    async def save_answer(self, project_id: str, answer: Answer) -> None:
        """Save an answer"""
        await self.answer_repo.save(project_id, answer)
    
    async def get_project_answers(self, project_id: str) -> List[Answer]:
        """Get all answers for a project"""
        return await self.answer_repo.get_by_project(project_id)
    
    @staticmethod
    def calculate_similarity(text1: str, text2: str) -> float:
        """Calculate Jaccard similarity between two texts"""
        if not text1 or not text2:
            return 0.0
        words1, words2 = set(text1.lower().split()), set(text2.lower().split())
        intersection = len(words1 & words2)
        union = len(words1 | words2)
        return intersection / union if union > 0 else 0.0
