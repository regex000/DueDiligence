import React, { useState } from "react";
import { Answer, AnswerStatus, Citation } from "../types";
import { AnswerStatusBadge, LoadingSpinner } from "./common";

interface AnswerReviewProps {
  answers: Answer[];
  loading: boolean;
  onUpdateAnswer: (question_id: string, status: AnswerStatus, manual_text?: string) => Promise<void>;
}

export const AnswerReview: React.FC<AnswerReviewProps> = ({ answers, loading, onUpdateAnswer }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [filterStatus, setFilterStatus] = useState<AnswerStatus | "ALL">("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  if (loading) return <LoadingSpinner />;

  const handleStatusChange = async (question_id: string, status: AnswerStatus) => {
    await onUpdateAnswer(question_id, status);
  };

  const handleManualEdit = async (question_id: string) => {
    await onUpdateAnswer(question_id, AnswerStatus.MANUAL_UPDATED, editText);
    setEditingId(null);
  };

  const filteredAnswers = answers.filter((answer) => {
    const matchesStatus = filterStatus === "ALL" || answer.status === filterStatus;
    const matchesSearch =
      answer.question_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      answer.text.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: answers.length,
    generated: answers.filter((a) => a.status === AnswerStatus.GENERATED).length,
    confirmed: answers.filter((a) => a.status === AnswerStatus.CONFIRMED).length,
    rejected: answers.filter((a) => a.status === AnswerStatus.REJECTED).length,
    manual: answers.filter((a) => a.status === AnswerStatus.MANUAL_UPDATED).length,
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
        <div className="grid grid-cols-5 gap-2 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-xs text-slate-400">Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.generated}</p>
            <p className="text-xs text-slate-400">Generated</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">{stats.confirmed}</p>
            <p className="text-xs text-slate-400">Confirmed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
            <p className="text-xs text-slate-400">Rejected</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-400">{stats.manual}</p>
            <p className="text-xs text-slate-400">Manual</p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {(["ALL", AnswerStatus.GENERATED, AnswerStatus.CONFIRMED, AnswerStatus.REJECTED, AnswerStatus.MANUAL_UPDATED] as const).map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  filterStatus === status
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>
      </div>

      <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
        <input
          type="text"
          placeholder="Search by question ID or text..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      <div className="space-y-4">
        {filteredAnswers.map((answer) => (
          <div key={answer.question_id} className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
            <div
              className="p-4 cursor-pointer hover:bg-slate-800 transition"
              onClick={() => setExpandedId(expandedId === answer.question_id ? null : answer.question_id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold text-white">Q{answer.question_id}</p>
                  <p className="text-sm text-slate-400 mt-1">{answer.text.slice(0, 100)}...</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400">Confidence: {(answer.confidence * 100).toFixed(0)}%</span>
                  <AnswerStatusBadge status={answer.status} />
                </div>
              </div>
            </div>

            {expandedId === answer.question_id && (
              <div className="border-t border-slate-700 p-4 space-y-4 bg-slate-800">
                <div>
                  <h4 className="font-semibold text-white mb-2">Answer</h4>
                  {editingId === answer.question_id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleManualEdit(answer.question_id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 border border-slate-600 text-slate-300 rounded hover:bg-slate-700 transition text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-slate-300">{answer.manual_override || answer.text}</p>
                      <button
                        onClick={() => {
                          setEditingId(answer.question_id);
                          setEditText(answer.manual_override || answer.text);
                        }}
                        className="mt-2 text-sm text-blue-400 hover:text-blue-300"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>

                {answer.citations.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-white mb-2">Citations ({answer.citations.length})</h4>
                    <div className="space-y-2">
                      {answer.citations.map((citation, idx) => (
                        <CitationCard key={idx} citation={citation} />
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t border-slate-700">
                  <button
                    onClick={() => handleStatusChange(answer.question_id, AnswerStatus.CONFIRMED)}
                    className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => handleStatusChange(answer.question_id, AnswerStatus.REJECTED)}
                    className="flex-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredAnswers.length === 0 && (
        <div className="bg-slate-900 rounded-lg border border-slate-700 p-6 text-center text-slate-400">
          {answers.length === 0 ? "No answers yet" : "No answers match your filters"}
        </div>
      )}
    </div>
  );
};

interface CitationCardProps {
  citation: Citation;
}

const CitationCard: React.FC<CitationCardProps> = ({ citation }) => (
  <div className="bg-slate-900 p-3 rounded border border-slate-600">
    <div className="flex justify-between items-start mb-2">
      <span className="text-xs font-mono text-slate-400">{citation.chunk_id}</span>
      <span className="text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded">
        {(citation.confidence * 100).toFixed(0)}%
      </span>
    </div>
    <p className="text-sm text-slate-300">{citation.text.slice(0, 200)}...</p>
  </div>
);
