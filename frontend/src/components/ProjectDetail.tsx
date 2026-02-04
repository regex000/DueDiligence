import React, { useState, useEffect } from "react";
import { Project, AnswerStatus, EvaluationResult } from "../types";
import { AnswerReview } from "./AnswerReview";
import { EvaluationReport } from "./EvaluationReport";
import { GenerationProgressModal } from "./GenerationProgressModal";
import { LoadingSpinner, ErrorAlert, SuccessAlert } from "./common";
import { apiClient } from "../services/api";

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onRefresh: () => Promise<void>;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onBack, onRefresh }) => {
  const [tab, setTab] = useState<"answers" | "evaluation">("answers");
  const [loading, setLoading] = useState(false);
  const [evaluationResults, setEvaluationResults] = useState<EvaluationResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);

  const handleGenerateAnswers = async () => {
    console.log("Starting answer generation for project:", project.id);
    setLoading(true);
    setError(null);
    setShowProgressModal(false);
    setCurrentRequestId(null);
    
    try {
      const response = await apiClient.generateAnswers(project.id);
      console.log("Generate answers response:", response);
      
      if (!response.request_id) {
        throw new Error("No request_id returned from server");
      }
      
      console.log("Setting request ID:", response.request_id);
      setCurrentRequestId(response.request_id);
      
      // Use setTimeout to ensure state is updated before showing modal
      setTimeout(() => {
        console.log("Showing progress modal");
        setShowProgressModal(true);
      }, 0);
    } catch (err) {
      console.error("Generate answers error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate answers");
      setLoading(false);
    }
  };

  const handleProgressComplete = async () => {
    setShowProgressModal(false);
    setCurrentRequestId(null);
    setLoading(false);
    setSuccess("Answers generated successfully!");
    await onRefresh();
  };

  const handleProgressError = (errorMessage: string) => {
    setShowProgressModal(false);
    setCurrentRequestId(null);
    setLoading(false);
    setError(errorMessage);
  };

  const handleUpdateAnswer = async (question_id: string, status: AnswerStatus, manual_text?: string) => {
    try {
      await apiClient.updateAnswer(project.id, question_id, status, manual_text);
      setSuccess("Answer updated");
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update answer");
    }
  };

  const handleEvaluate = async () => {
    setLoading(true);
    setError(null);
    try {
      const groundTruth: Record<string, string> = {};
      project.answers.forEach((a) => {
        groundTruth[a.question_id] = a.text;
      });
      const results = await apiClient.evaluateAnswers(project.id, groundTruth);
      setEvaluationResults(results);
      setTab("evaluation");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to evaluate");
    } finally {
      setLoading(false);
    }
  };

  const confirmedCount = project.answers.filter((a) => a.status === AnswerStatus.CONFIRMED).length;
  const rejectedCount = project.answers.filter((a) => a.status === AnswerStatus.REJECTED).length;
  const generatedCount = project.answers.filter((a) => a.status === AnswerStatus.GENERATED).length;

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <button onClick={onBack} className="text-blue-400 hover:text-blue-300 mb-2 text-sm font-medium">
              ← Back to Projects
            </button>
            <h1 className="text-3xl font-bold text-white">{project.name}</h1>
            <p className="text-slate-400 mt-1">Project ID: {project.id}</p>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              project.status === "ACTIVE" ? "bg-green-900 text-green-100 border border-green-700" : "bg-yellow-900 text-yellow-100 border border-yellow-700"
            }`}
          >
            {project.status}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-700">
          <div>
            <p className="text-sm text-slate-400">Total Answers</p>
            <p className="text-2xl font-bold text-white mt-1">{project.answers.length}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Confirmed</p>
            <p className="text-2xl font-bold text-green-400 mt-1">{confirmedCount}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Rejected</p>
            <p className="text-2xl font-bold text-red-400 mt-1">{rejectedCount}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Generated</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">{generatedCount}</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-700">
          <p className="text-sm text-slate-400 mb-2">Questionnaire ID</p>
          <p className="font-mono text-sm text-white">{project.questionnaire_id}</p>
        </div>

        <div className="mt-4">
          <p className="text-sm text-slate-400 mb-2">Documents ({project.document_ids.length})</p>
          <div className="flex flex-wrap gap-2">
            {project.document_ids.map((docId) => (
              <span key={docId} className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-xs border border-slate-600">
                {docId}
              </span>
            ))}
          </div>
        </div>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}
      {success && <SuccessAlert message={success} onDismiss={() => setSuccess(null)} />}

      {showProgressModal && (
        <div className="bg-blue-900 bg-opacity-30 border border-blue-700 text-blue-100 px-4 py-3 rounded-lg mb-4">
          <p className="text-sm">
            Progress Modal State: Open={showProgressModal.toString()}, RequestID={currentRequestId}
          </p>
        </div>
      )}

      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <div className="flex gap-4">
            <button
              onClick={() => setTab("answers")}
              className={`px-4 py-2 font-medium transition border-b-2 ${
                tab === "answers"
                  ? "text-blue-400 border-blue-400"
                  : "text-slate-400 hover:text-slate-300 border-transparent"
              }`}
            >
              Answers ({project.answers.length})
            </button>
            <button
              onClick={() => setTab("evaluation")}
              className={`px-4 py-2 font-medium transition border-b-2 ${
                tab === "evaluation"
                  ? "text-blue-400 border-blue-400"
                  : "text-slate-400 hover:text-slate-300 border-transparent"
              }`}
            >
              Evaluation
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleGenerateAnswers}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50 text-sm font-medium"
            >
              {loading ? "Generating..." : "Generate Answers"}
            </button>
            <button
              onClick={handleEvaluate}
              disabled={loading || project.answers.length === 0}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition disabled:opacity-50 text-sm font-medium"
            >
              Evaluate
            </button>
            <button
              onClick={onRefresh}
              disabled={loading}
              className="px-4 py-2 border border-slate-600 text-slate-300 rounded hover:bg-slate-700 transition disabled:opacity-50 text-sm font-medium"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="p-6">
          {tab === "answers" && (
            <AnswerReview answers={project.answers} loading={loading} onUpdateAnswer={handleUpdateAnswer} />
          )}
          {tab === "evaluation" && <EvaluationReport results={evaluationResults} loading={loading} />}
        </div>
      </div>

      <GenerationProgressModal
        isOpen={showProgressModal}
        requestId={currentRequestId}
        onComplete={handleProgressComplete}
        onError={handleProgressError}
      />
    </div>
  );
};
