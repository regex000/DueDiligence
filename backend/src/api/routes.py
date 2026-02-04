"""
API routes for Due Diligence Questionnaire
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from pathlib import Path
import uuid

from src.core.models import CreateProjectRequest, UpdateAnswerRequest
from src.infrastructure.repositories import (
    InMemoryDocumentRepository, InMemoryChunkRepository, InMemoryProjectRepository,
    InMemoryAnswerRepository
)
from src.infrastructure.llm_adapter import OpenRouterLLMAdapter
from src.infrastructure.parser_adapters import DocumentParserAdapter, QuestionnaireParserAdapter
from src.infrastructure.request_queue import RequestQueue
from src.domain.services import DocumentService, ProjectService, AnswerService
from src.application.use_cases import QuestionnaireUseCase, DocumentIngestionUseCase

router = APIRouter()

# Infrastructure initialization
doc_repo = InMemoryDocumentRepository()
chunk_repo = InMemoryChunkRepository()
project_repo = InMemoryProjectRepository()
answer_repo = InMemoryAnswerRepository()
request_queue = RequestQueue()

# Domain Services
doc_service = DocumentService(doc_repo, chunk_repo)
project_service = ProjectService(project_repo, answer_repo)
answer_service = AnswerService(answer_repo)

# Adapters
llm = OpenRouterLLMAdapter()
doc_parser = DocumentParserAdapter()
questionnaire_parser = QuestionnaireParserAdapter()

# Use Cases
questionnaire_uc = QuestionnaireUseCase(project_service, answer_service, llm, chunk_repo, questionnaire_parser)
ingestion_uc = DocumentIngestionUseCase(doc_service, doc_parser, project_service)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@router.post("/index-document-async")
async def index_document(file: UploadFile = File(...), background_tasks: BackgroundTasks = None) -> dict:
    """Index a document asynchronously"""
    request_id = request_queue.create_request()
    request_queue.mark_processing(request_id)
    
    file_path = UPLOAD_DIR / f"{uuid.uuid4()}_{file.filename}"
    content = await file.read()
    
    with open(file_path, 'wb') as f:
        f.write(content)
    
    async def process():
        try:
            await ingestion_uc.ingest_document(str(file_path), file.filename)
            request_queue.mark_completed(request_id)
        except Exception as e:
            request_queue.mark_failed(request_id, str(e))
    
    if background_tasks:
        background_tasks.add_task(process)
    else:
        await process()
    
    return {"request_id": request_id, "status": "processing"}


@router.post("/create-project-async")
async def create_project(req: CreateProjectRequest, background_tasks: BackgroundTasks = None) -> dict:
    """Create a project asynchronously"""
    request_id = request_queue.create_request()
    request_queue.mark_processing(request_id)
    
    async def process():
        try:
            project = await project_service.create_project(req.name, req.questionnaire_id, req.document_ids)
            request_queue.requests[request_id]["project_id"] = project.id
            request_queue.mark_completed(request_id)
        except Exception as e:
            request_queue.mark_failed(request_id, str(e))
    
    if background_tasks:
        background_tasks.add_task(process)
    else:
        await process()
    
    return {"request_id": request_id, "status": "processing"}


@router.post("/generate-all-answers")
async def generate_all_answers(project_id: str, background_tasks: BackgroundTasks) -> dict:
    """Generate all answers for a project"""
    request_id = request_queue.create_request(project_id)
    request_queue.mark_processing(request_id)
    
    async def process():
        try:
            # Try multiple possible paths for the questionnaire file
            possible_paths = [
                Path("/app/data/ILPA_Due_Diligence_Questionnaire_v1.2.pdf"),  # Docker container path
                Path(__file__).parent.parent.parent.parent / "data" / "ILPA_Due_Diligence_Questionnaire_v1.2.pdf",  # Local development
            ]
            
            questionnaire_path = None
            for path in possible_paths:
                print(f"[DEBUG] Checking path: {path}")
                if path.exists():
                    questionnaire_path = path
                    print(f"[DEBUG] Found questionnaire at: {questionnaire_path}")
                    break
            
            if questionnaire_path is None:
                raise FileNotFoundError(f"Questionnaire file not found. Tried: {possible_paths}")
            
            await questionnaire_uc.generate_all_answers(project_id, str(questionnaire_path))
            request_queue.mark_completed(request_id)
        except Exception as e:
            print(f"[ERROR] Generate answers failed: {str(e)}")
            request_queue.mark_failed(request_id, str(e))
    
    background_tasks.add_task(process)
    
    return {"request_id": request_id, "status": "processing"}


@router.post("/update-answer")
async def update_answer(req: UpdateAnswerRequest) -> dict:
    """Update an answer"""
    answer = await answer_repo.get(req.project_id, req.question_id)
    if not answer:
        raise HTTPException(status_code=404, detail="Answer not found")
    
    answer.status = req.status
    if req.manual_text:
        answer.manual_override = req.manual_text
    
    await answer_service.save_answer(req.project_id, answer)
    return {"answer": answer.model_dump()}


@router.get("/list-documents")
async def list_documents() -> dict:
    """List all documents"""
    documents = await doc_repo.get_all()
    return {"documents": [d.model_dump() for d in documents]}


@router.get("/list-projects")
async def list_projects() -> dict:
    """List all projects"""
    projects = await project_repo.get_all()
    
    # Fetch answers for each project
    for project in projects:
        answers = await answer_service.get_project_answers(project.id)
        project.answers = answers
    
    return {"projects": [p.model_dump() for p in projects]}


@router.get("/get-project-info")
async def get_project_info(project_id: str) -> dict:
    """Get project information"""
    project = await project_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Fetch answers for this project
    answers = await answer_service.get_project_answers(project_id)
    project.answers = answers
    
    return {"project": project.model_dump()}


@router.get("/get-request-status")
async def get_request_status(request_id: str) -> dict:
    """Get request status"""
    req = request_queue.get_request(request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    
    return {"request": req}


@router.post("/evaluate-answers")
async def evaluate_answers(project_id: str, ground_truth: dict) -> dict:
    """Evaluate answers against ground truth"""
    results = await questionnaire_uc.evaluate_answers(project_id, ground_truth)
    return {"results": [r.model_dump() for r in results]}
