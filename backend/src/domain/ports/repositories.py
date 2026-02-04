"""
Repository port definitions (interfaces)
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Any
from src.core.models import Document, Answer, Project


class DocumentRepository(ABC):
    """Abstract repository for documents"""
    
    @abstractmethod
    async def save(self, doc: Document) -> None:
        """Save a document"""
        ...
    
    @abstractmethod
    async def get(self, doc_id: str) -> Document:
        """Get a document by ID"""
        ...
    
    @abstractmethod
    async def get_all(self) -> List[Document]:
        """Get all documents"""
        ...


class ChunkRepository(ABC):
    """Abstract repository for document chunks"""
    
    @abstractmethod
    async def save_chunks(self, doc_id: str, chunks: List[Dict[str, Any]]) -> None:
        """Save chunks for a document"""
        ...
    
    @abstractmethod
    async def search(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Search chunks by query"""
        ...
    
    @abstractmethod
    async def get_by_doc(self, doc_id: str) -> List[Dict[str, Any]]:
        """Get chunks by document ID"""
        ...


class ProjectRepository(ABC):
    """Abstract repository for projects"""
    
    @abstractmethod
    async def save(self, project: Project) -> None:
        """Save a project"""
        ...
    
    @abstractmethod
    async def get(self, project_id: str) -> Project:
        """Get a project by ID"""
        ...
    
    @abstractmethod
    async def update_status(self, project_id: str, status: str) -> None:
        """Update project status"""
        ...
    
    @abstractmethod
    async def get_all(self) -> List[Project]:
        """Get all projects"""
        ...


class AnswerRepository(ABC):
    """Abstract repository for answers"""
    
    @abstractmethod
    async def save(self, project_id: str, answer: Answer) -> None:
        """Save an answer"""
        ...
    
    @abstractmethod
    async def get(self, project_id: str, question_id: str) -> Answer:
        """Get an answer by project and question ID"""
        ...
    
    @abstractmethod
    async def get_by_project(self, project_id: str) -> List[Answer]:
        """Get all answers for a project"""
        ...
