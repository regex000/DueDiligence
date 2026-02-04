"""
In-memory repository implementations
"""
from typing import List, Dict, Any
from src.domain.ports.repositories import (
    DocumentRepository, ChunkRepository, ProjectRepository, AnswerRepository
)
from src.core.models import Document, Project, Answer, ProjectStatus


class InMemoryDocumentRepository(DocumentRepository):
    """In-memory implementation of DocumentRepository"""
    
    def __init__(self):
        self.documents: Dict[str, Document] = {}
    
    async def save(self, doc: Document) -> None:
        """Save a document"""
        self.documents[doc.id] = doc
    
    async def get(self, doc_id: str) -> Document:
        """Get a document by ID"""
        return self.documents.get(doc_id)
    
    async def get_all(self) -> List[Document]:
        """Get all documents"""
        return list(self.documents.values())


class InMemoryChunkRepository(ChunkRepository):
    """In-memory implementation of ChunkRepository"""
    
    def __init__(self):
        self.chunks: Dict[str, Dict[str, Any]] = {}
    
    async def save_chunks(self, doc_id: str, chunks: List[Dict[str, Any]]) -> None:
        """Save chunks for a document"""
        for chunk in chunks:
            self.chunks[chunk["id"]] = {**chunk, "doc_id": doc_id}
    
    async def search(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Search chunks by query"""
        query_lower = query.lower()
        scored = [(c, sum(1 for w in query_lower.split() if w in c["text"].lower())) 
                  for c in self.chunks.values()]
        return [c[0] for c in sorted(scored, key=lambda x: x[1], reverse=True)[:limit]]
    
    async def get_by_doc(self, doc_id: str) -> List[Dict[str, Any]]:
        """Get chunks by document ID"""
        return [c for c in self.chunks.values() if c.get("doc_id") == doc_id]


class InMemoryProjectRepository(ProjectRepository):
    """In-memory implementation of ProjectRepository"""
    
    def __init__(self):
        self.projects: Dict[str, Project] = {}
    
    async def save(self, project: Project) -> None:
        """Save a project"""
        self.projects[project.id] = project
    
    async def get(self, project_id: str) -> Project:
        """Get a project by ID"""
        return self.projects.get(project_id)
    
    async def update_status(self, project_id: str, status: str) -> None:
        """Update project status"""
        if project_id in self.projects:
            self.projects[project_id].status = ProjectStatus(status)
    
    async def get_all(self) -> List[Project]:
        """Get all projects"""
        return list(self.projects.values())


class InMemoryAnswerRepository(AnswerRepository):
    """In-memory implementation of AnswerRepository"""
    
    def __init__(self):
        self.answers: Dict[str, Answer] = {}
    
    async def save(self, project_id: str, answer: Answer) -> None:
        """Save an answer"""
        self.answers[f"{project_id}_{answer.question_id}"] = answer
    
    async def get(self, project_id: str, question_id: str) -> Answer:
        """Get an answer by project and question ID"""
        return self.answers.get(f"{project_id}_{question_id}")
    
    async def get_by_project(self, project_id: str) -> List[Answer]:
        """Get all answers for a project"""
        return [a for k, a in self.answers.items() if k.startswith(f"{project_id}_")]
