import { config } from "../config";
import { Document, Project, AsyncRequest, EvaluationResult, Answer, AnswerStatus } from "../types";

const fetchWithTimeout = async (url: string, options: RequestInit = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.api.timeout);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    if (!res.ok) {
      let errorMessage = `HTTP ${res.status}`;
      try {
        const errorData = await res.json();
        errorMessage = errorData.detail || errorMessage;
      } catch {
        // Use default error message
      }
      throw new Error(errorMessage);
    }
    return res;
  } finally {
    clearTimeout(timeout);
  }
};

export const apiClient = {
  async uploadDocument(file: File): Promise<{ request_id: string }> {
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const res = await fetchWithTimeout(`${config.api.baseUrl}/index-document-async`, {
        method: "POST",
        body: formData,
      });
      return res.json();
    } catch (error) {
      throw new Error(`Failed to upload document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async listDocuments(): Promise<Document[]> {
    try {
      const res = await fetchWithTimeout(`${config.api.baseUrl}/list-documents`);
      const data = await res.json();
      return data.documents;
    } catch (error) {
      console.error("Failed to list documents:", error);
      return [];
    }
  },

  async createProject(
    name: string,
    questionnaire_id: string,
    document_ids: string[]
  ): Promise<{ request_id: string }> {
    try {
      const res = await fetchWithTimeout(`${config.api.baseUrl}/create-project-async`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, questionnaire_id, document_ids }),
      });
      return res.json();
    } catch (error) {
      throw new Error(`Failed to create project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async listProjects(): Promise<Project[]> {
    try {
      const res = await fetchWithTimeout(`${config.api.baseUrl}/list-projects`);
      const data = await res.json();
      return data.projects;
    } catch (error) {
      console.error("Failed to list projects:", error);
      return [];
    }
  },

  async getProject(project_id: string): Promise<Project> {
    try {
      const res = await fetchWithTimeout(`${config.api.baseUrl}/get-project-info?project_id=${project_id}`);
      const data = await res.json();
      return data.project;
    } catch (error) {
      throw new Error(`Failed to get project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async generateAnswers(project_id: string): Promise<{ request_id: string }> {
    try {
      const res = await fetchWithTimeout(`${config.api.baseUrl}/generate-all-answers?project_id=${project_id}`, {
        method: "POST",
      });
      return res.json();
    } catch (error) {
      throw new Error(`Failed to generate answers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async updateAnswer(
    project_id: string,
    question_id: string,
    status: AnswerStatus,
    manual_text?: string
  ): Promise<Answer> {
    try {
      const res = await fetchWithTimeout(`${config.api.baseUrl}/update-answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id, question_id, status, manual_text }),
      });
      const data = await res.json();
      return data.answer;
    } catch (error) {
      throw new Error(`Failed to update answer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async getRequestStatus(request_id: string): Promise<AsyncRequest> {
    try {
      const res = await fetchWithTimeout(`${config.api.baseUrl}/get-request-status?request_id=${request_id}`);
      const data = await res.json();
      return data.request;
    } catch (error) {
      throw new Error(`Failed to get request status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async evaluateAnswers(
    project_id: string,
    ground_truth: Record<string, string>
  ): Promise<EvaluationResult[]> {
    try {
      const res = await fetchWithTimeout(`${config.api.baseUrl}/evaluate-answers?project_id=${project_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ground_truth),
      });
      const data = await res.json();
      return data.results;
    } catch (error) {
      throw new Error(`Failed to evaluate answers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};
