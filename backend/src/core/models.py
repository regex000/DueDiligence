"""
Core domain models for Due Diligence application
"""
from enum import Enum
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class ProjectStatus(str, Enum):
    """Project status enumeration"""
    ACTIVE = "ACTIVE"
    OUTDATED = "OUTDATED"


class AnswerStatus(str, Enum):
    """Answer status enumeration"""
    GENERATED = "GENERATED"
    CONFIRMED = "CONFIRMED"
    REJECTED = "REJECTED"
    MANUAL_UPDATED = "MANUAL_UPDATED"


class RequestStatus(str, Enum):
    """Request status enumeration"""
    QUEUED = "QUEUED"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class Citation(BaseModel):
    """Citation model for answer sources"""
    chunk_id: str
    text: str
    confidence: float = Field(ge=0, le=1)


class Answer(BaseModel):
    """Answer model"""
    question_id: str
    text: str
    is_answerable: bool
    citations: List[Citation]
    confidence: float = Field(ge=0, le=1)
    status: AnswerStatus = AnswerStatus.GENERATED
    manual_override: Optional[str] = None


class Question(BaseModel):
    """Question model"""
    id: str
    section: str
    order: int
    text: str


class Project(BaseModel):
    """Project model"""
    id: str
    name: str
    questionnaire_id: str
    status: ProjectStatus = ProjectStatus.ACTIVE
    document_ids: List[str] = []
    answers: List[Answer] = []


class Document(BaseModel):
    """Document model"""
    id: str
    filename: str
    content_hash: str


class CreateProjectRequest(BaseModel):
    """Request model for creating a project"""
    name: str
    questionnaire_id: str
    document_ids: List[str] = []


class GenerateAnswerRequest(BaseModel):
    """Request model for generating an answer"""
    project_id: str
    question_id: str


class UpdateAnswerRequest(BaseModel):
    """Request model for updating an answer"""
    project_id: str
    question_id: str
    status: AnswerStatus
    manual_text: Optional[str] = None


class EvaluationResult(BaseModel):
    """Evaluation result model"""
    question_id: str
    ai_answer: str
    human_answer: str
    similarity_score: float = Field(ge=0, le=1)
    match_type: str
