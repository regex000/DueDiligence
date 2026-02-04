export enum ProjectStatus {
  ACTIVE = "ACTIVE",
  OUTDATED = "OUTDATED",
}

export enum AnswerStatus {
  GENERATED = "GENERATED",
  CONFIRMED = "CONFIRMED",
  REJECTED = "REJECTED",
  MANUAL_UPDATED = "MANUAL_UPDATED",
}

export enum RequestStatus {
  QUEUED = "QUEUED",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export interface Citation {
  chunk_id: string;
  text: string;
  confidence: number;
}

export interface Answer {
  question_id: string;
  text: string;
  is_answerable: boolean;
  citations: Citation[];
  confidence: number;
  status: AnswerStatus;
  manual_override?: string;
}

export interface Question {
  id: string;
  section: string;
  order: number;
  text: string;
}

export interface Document {
  id: string;
  filename: string;
  content_hash: string;
}

export interface Project {
  id: string;
  name: string;
  questionnaire_id: string;
  status: ProjectStatus;
  document_ids: string[];
  answers: Answer[];
}

export interface EvaluationResult {
  question_id: string;
  ai_answer: string;
  human_answer: string;
  similarity_score: number;
  match_type: string;
}

export interface AsyncRequest {
  id: string;
  status: RequestStatus;
  project_id?: string;
  document_id?: string;
  error?: string;
}
