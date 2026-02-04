"""
Source module initialization
"""
from src.core import get_settings, Settings
from src.domain import DocumentService, ProjectService, AnswerService, ModelSelector
from src.infrastructure import (
    InMemoryDocumentRepository,
    InMemoryChunkRepository,
    InMemoryProjectRepository,
    InMemoryAnswerRepository,
    OpenRouterLLMAdapter,
    DocumentParserAdapter,
    QuestionnaireParserAdapter,
    RequestQueue,
    ModelRegistry,
    MultiModelLLMAdapter,
)
from src.application import QuestionnaireUseCase, DocumentIngestionUseCase, MultiModelUseCase

__all__ = [
    "get_settings",
    "Settings",
    "DocumentService",
    "ProjectService",
    "AnswerService",
    "ModelSelector",
    "InMemoryDocumentRepository",
    "InMemoryChunkRepository",
    "InMemoryProjectRepository",
    "InMemoryAnswerRepository",
    "OpenRouterLLMAdapter",
    "DocumentParserAdapter",
    "QuestionnaireParserAdapter",
    "RequestQueue",
    "ModelRegistry",
    "MultiModelLLMAdapter",
    "QuestionnaireUseCase",
    "DocumentIngestionUseCase",
    "MultiModelUseCase",
]
