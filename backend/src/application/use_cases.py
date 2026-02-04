"""
Use cases for questionnaire and document processing
"""
from typing import List, Dict, Any
import uuid
from src.domain.services import DocumentService, ProjectService, AnswerService
from src.domain.ports.services import LLMPort, QuestionnaireParserPort
from src.core.models import Answer, AnswerStatus, EvaluationResult, Document


class QuestionnaireUseCase:
    """Use case for questionnaire processing"""
    
    def __init__(self, project_service: ProjectService, answer_service: AnswerService,
                 llm: LLMPort, chunk_repo, questionnaire_parser: QuestionnaireParserPort):
        self.project_service = project_service
        self.answer_service = answer_service
        self.llm = llm
        self.chunk_repo = chunk_repo
        self.questionnaire_parser = questionnaire_parser
    
    async def generate_all_answers(self, project_id: str, questionnaire_path: str) -> List[Answer]:
        """Generate all answers for a project"""
        project = await self.project_service.get_project(project_id)
        if not project:
            return []
        
        questions = self.questionnaire_parser.parse(questionnaire_path)
        answers = []
        
        for question in questions[:10]:
            chunks = await self.chunk_repo.search(question["text"], limit=5)
            answer = await self.llm.generate_answer(question["text"], chunks)
            answer.question_id = question["id"]
            answer.status = AnswerStatus.GENERATED
            await self.answer_service.save_answer(project_id, answer)
            answers.append(answer)
        
        return answers
    
    async def evaluate_answers(self, project_id: str, ground_truth: Dict[str, str]) -> List[EvaluationResult]:
        """Evaluate answers against ground truth"""
        answers = await self.answer_service.get_project_answers(project_id)
        return [
            EvaluationResult(
                question_id=answer.question_id,
                ai_answer=answer.text,
                human_answer=ground_truth.get(answer.question_id, ""),
                similarity_score=AnswerService.calculate_similarity(
                    answer.text, ground_truth.get(answer.question_id, "")
                ),
                match_type=self._match_type(
                    AnswerService.calculate_similarity(
                        answer.text, ground_truth.get(answer.question_id, "")
                    )
                )
            )
            for answer in answers
        ]
    
    @staticmethod
    def _match_type(similarity: float) -> str:
        """Determine match type based on similarity score"""
        if similarity > 0.9:
            return "EXACT"
        return "PARTIAL" if similarity > 0.6 else "MISMATCH"


class DocumentIngestionUseCase:
    """Use case for document ingestion"""
    
    def __init__(self, document_service: DocumentService, document_parser, project_service: ProjectService):
        self.document_service = document_service
        self.document_parser = document_parser
        self.project_service = project_service
    
    async def ingest_document(self, file_path: str, filename: str) -> Document:
        """Ingest a document"""
        parsed = self.document_parser.parse_pdf(file_path)
        chunks = self.document_parser.chunk_text(parsed["text"])
        doc = Document(id=str(uuid.uuid4()), filename=filename, content_hash=parsed["hash"])
        await self.document_service.index_document(doc, chunks)
        await self.project_service.mark_outdated()
        return doc
