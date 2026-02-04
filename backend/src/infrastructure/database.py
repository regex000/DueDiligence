"""
SQLAlchemy database models for Due Diligence application
"""
from datetime import datetime
from typing import Optional, List
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, UniqueConstraint, Index, JSON, LargeBinary
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import uuid

Base = declarative_base()


class Document(Base):
    """Document model"""
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    filename = Column(String(255), nullable=False)
    content_hash = Column(String(64), nullable=False, unique=True, index=True)
    file_size = Column(Integer, nullable=False)
    file_path = Column(String(512), nullable=False)
    mime_type = Column(String(100))
    status = Column(String(50), default="ACTIVE", index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")
    projects = relationship("Project", secondary="project_documents", back_populates="documents")

    __table_args__ = (
        Index("idx_documents_filename", "filename"),
        Index("idx_documents_created_at", "created_at"),
    )


class DocumentChunk(Base):
    """Document chunks for semantic search"""
    __tablename__ = "document_chunks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)
    text = Column(Text, nullable=False)
    embedding = Column(LargeBinary)
    chunk_metadata = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    document = relationship("Document", back_populates="chunks")

    __table_args__ = (
        Index("idx_chunks_document_id", "document_id"),
        Index("idx_chunks_document_index", "document_id", "chunk_index"),
    )


class Project(Base):
    """Project model"""
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    questionnaire_id = Column(String(255), nullable=False, index=True)
    status = Column(String(50), default="ACTIVE", index=True)
    project_metadata = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    documents = relationship("Document", secondary="project_documents", back_populates="projects")
    answers = relationship("Answer", back_populates="project", cascade="all, delete-orphan")
    evaluation_results = relationship("EvaluationResult", back_populates="project", cascade="all, delete-orphan")
    async_requests = relationship("AsyncRequest", back_populates="project")

    __table_args__ = (
        Index("idx_projects_name", "name"),
        Index("idx_projects_status", "status"),
        Index("idx_projects_created_at", "created_at"),
    )


class ProjectDocument(Base):
    """Association table for projects and documents"""
    __tablename__ = "project_documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    added_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("project_id", "document_id", name="uq_project_document"),
        Index("idx_project_documents_project_id", "project_id"),
        Index("idx_project_documents_document_id", "document_id"),
    )


class Question(Base):
    """Question model"""
    __tablename__ = "questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    questionnaire_id = Column(String(255), nullable=False, index=True)
    question_id = Column(String(255), nullable=False)
    section = Column(String(255))
    order_index = Column(Integer)
    text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("questionnaire_id", "question_id", name="uq_questionnaire_question"),
        Index("idx_questions_questionnaire_id", "questionnaire_id"),
        Index("idx_questions_question_id", "question_id"),
    )


class Answer(Base):
    """Answer model"""
    __tablename__ = "answers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(String(255), nullable=False, index=True)
    text = Column(Text, nullable=False)
    is_answerable = Column(Boolean, default=True)
    confidence = Column(Float, default=0.0)
    status = Column(String(50), default="GENERATED", index=True)
    manual_override = Column(Text)
    answer_metadata = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="answers")
    citations = relationship("Citation", back_populates="answer", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("project_id", "question_id", name="uq_project_question"),
        Index("idx_answers_project_id", "project_id"),
        Index("idx_answers_status", "status"),
        Index("idx_answers_created_at", "created_at"),
    )


class Citation(Base):
    """Citation model for answer sources"""
    __tablename__ = "citations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    answer_id = Column(UUID(as_uuid=True), ForeignKey("answers.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_id = Column(String(255), nullable=False, index=True)
    text = Column(Text, nullable=False)
    confidence = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    answer = relationship("Answer", back_populates="citations")

    __table_args__ = (
        Index("idx_citations_answer_id", "answer_id"),
        Index("idx_citations_chunk_id", "chunk_id"),
    )


class AsyncRequest(Base):
    """Async request tracking model"""
    __tablename__ = "async_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    status = Column(String(50), default="QUEUED", index=True)
    request_type = Column(String(100))
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True, index=True)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="SET NULL"), nullable=True, index=True)
    error_message = Column(Text)
    result = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime)

    # Relationships
    project = relationship("Project", back_populates="async_requests")

    __table_args__ = (
        Index("idx_requests_status", "status"),
        Index("idx_requests_project_id", "project_id"),
        Index("idx_requests_document_id", "document_id"),
        Index("idx_requests_created_at", "created_at"),
    )


class EvaluationResult(Base):
    """Evaluation result model"""
    __tablename__ = "evaluation_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(String(255), nullable=False, index=True)
    ai_answer = Column(Text, nullable=False)
    human_answer = Column(Text, nullable=False)
    similarity_score = Column(Float, default=0.0)
    match_type = Column(String(50), index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="evaluation_results")

    __table_args__ = (
        Index("idx_evaluation_project_id", "project_id"),
        Index("idx_evaluation_question_id", "question_id"),
        Index("idx_evaluation_match_type", "match_type"),
    )


class AuditLog(Base):
    """Audit log model"""
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    entity_type = Column(String(100), index=True)
    entity_id = Column(UUID(as_uuid=True), index=True)
    action = Column(String(50))
    changes = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    __table_args__ = (
        Index("idx_audit_entity_type", "entity_type"),
        Index("idx_audit_entity_id", "entity_id"),
        Index("idx_audit_created_at", "created_at"),
    )
