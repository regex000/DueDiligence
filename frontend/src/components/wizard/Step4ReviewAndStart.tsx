import React from "react";
import { Document } from "../../types";

interface Step4ReviewAndStartProps {
  projectName: string;
  questionnaireId: string;
  selectedDocIds: string[];
  uploadedDocs: Document[];
  isExistingProject: boolean;
  onStart: () => void;
}

export const Step4ReviewAndStart: React.FC<Step4ReviewAndStartProps> = ({
  projectName,
  questionnaireId,
  selectedDocIds,
  uploadedDocs,
  isExistingProject,
  onStart,
}) => {
  const selectedDocs = uploadedDocs.filter((doc) => selectedDocIds.includes(doc.id));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Step 4: Review & Start</h2>
        <p className="text-slate-400">Review your project configuration before starting</p>
      </div>

      {/* Project Details Card */}
      <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-8 border border-blue-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <p className="text-blue-200 text-sm font-semibold uppercase tracking-wide">Project Name</p>
              <p className="text-white text-2xl font-bold mt-2">{projectName}</p>
            </div>
            <div>
              <p className="text-blue-200 text-sm font-semibold uppercase tracking-wide">Questionnaire ID</p>
              <p className="text-white text-lg font-mono mt-2">{questionnaireId}</p>
            </div>
            <div>
              <p className="text-blue-200 text-sm font-semibold uppercase tracking-wide">Project Type</p>
              <p className="text-white text-lg mt-2">{isExistingProject ? "Existing Project" : "New Project"}</p>
            </div>
          </div>

          {/* Right Column - Stats */}
          <div className="space-y-6">
            <div className="bg-blue-800 bg-opacity-50 rounded-lg p-4 border border-blue-600">
              <p className="text-blue-200 text-sm font-semibold uppercase tracking-wide">Documents</p>
              <p className="text-white text-3xl font-bold mt-2">{selectedDocs.length}</p>
              <p className="text-blue-300 text-sm mt-2">documents will be indexed</p>
            </div>
            <div className="bg-blue-800 bg-opacity-50 rounded-lg p-4 border border-blue-600">
              <p className="text-blue-200 text-sm font-semibold uppercase tracking-wide">Status</p>
              <p className="text-green-400 text-lg font-bold mt-2">✓ Ready to Start</p>
            </div>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
        <h3 className="text-white font-bold text-lg mb-4">📄 Selected Documents</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {selectedDocs.map((doc, idx) => (
            <div key={doc.id} className="flex items-center gap-3 bg-slate-800 p-3 rounded-lg border border-slate-700">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{doc.filename}</p>
                <p className="text-xs text-slate-500 font-mono">{doc.content_hash.slice(0, 20)}...</p>
              </div>
              <div className="text-green-400">✓</div>
            </div>
          ))}
        </div>
      </div>

      {/* What Happens Next */}
      <div className="bg-purple-900 bg-opacity-30 border border-purple-700 rounded-lg p-6">
        <h3 className="text-white font-bold mb-4">🚀 What Happens Next?</h3>
        <div className="space-y-3 text-slate-300">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              1
            </div>
            <div>
              <p className="text-white font-semibold">Documents Indexed</p>
              <p className="text-sm text-slate-400">Your documents will be processed and indexed for semantic search</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              2
            </div>
            <div>
              <p className="text-white font-semibold">Questions Loaded</p>
              <p className="text-sm text-slate-400">Questionnaire questions will be loaded and prepared</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              3
            </div>
            <div>
              <p className="text-white font-semibold">Ready for Generation</p>
              <p className="text-sm text-slate-400">Project will be ready for AI answer generation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Start Button Info */}
      <div className="bg-green-900 bg-opacity-30 border border-green-700 rounded-lg p-6">
        <p className="text-green-100">
          <span className="font-bold">✓ All set!</span> Click the "Start Project" button below to begin your due diligence questionnaire project.
        </p>
      </div>
    </div>
  );
};
