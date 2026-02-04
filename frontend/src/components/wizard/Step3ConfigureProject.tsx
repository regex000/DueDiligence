import React, { useState, useImperativeHandle, forwardRef } from "react";
import { Document } from "../../types";

interface Step3ConfigureProjectProps {
  uploadedDocs: Document[];
  onConfigured: (name: string, questionnaireId: string, docIds: string[]) => void;
  projectName: string;
  questionnaireId: string;
  selectedDocIds: string[];
}

export interface Step3Handle {
  getFormData: () => { name: string; questionnaireId: string; docIds: string[] } | null;
  isValid: () => boolean;
}

export const Step3ConfigureProject = forwardRef<Step3Handle, Step3ConfigureProjectProps>(
  (
    {
      uploadedDocs,
      onConfigured,
      projectName: initialName,
      questionnaireId: initialQId,
      selectedDocIds: initialDocIds,
    },
    ref
  ) => {
    const [projectName, setProjectName] = useState(initialName);
    const [questionnaireId, setQuestionnaireId] = useState(initialQId);
    // Initialize with uploadedDocs IDs if initialDocIds is empty
    const [selectedDocIds, setSelectedDocIds] = useState<string[]>(
      initialDocIds.length > 0 ? initialDocIds : uploadedDocs.map((doc) => doc.id)
    );

    const isValid = projectName && questionnaireId && selectedDocIds.length > 0;

    useImperativeHandle(ref, () => ({
      getFormData: () => {
        if (isValid) {
          return {
            name: projectName,
            questionnaireId,
            docIds: selectedDocIds,
          };
        }
        return null;
      },
      isValid: () => isValid,
    }));

    const handleDocumentToggle = (docId: string) => {
      setSelectedDocIds((prev) =>
        prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
      );
    };

    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Step 3: Configure Project</h2>
          <p className="text-slate-400">Set up your project details and select documents</p>
        </div>

        {/* Project Name */}
        <div>
          <label className="block text-white font-semibold mb-3">Project Name</label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="e.g., MiniMax Due Diligence Q1 2024"
            className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-slate-400 text-sm mt-2">Give your project a descriptive name</p>
        </div>

        {/* Questionnaire ID */}
        <div>
          <label className="block text-white font-semibold mb-3">Questionnaire ID</label>
          <select
            value={questionnaireId}
            onChange={(e) => setQuestionnaireId(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a questionnaire</option>
            <option value="ILPA_DD_v1.2">ILPA Due Diligence v1.2</option>
            <option value="ILPA_DD_v1.1">ILPA Due Diligence v1.1</option>
            <option value="CUSTOM_DD">Custom Due Diligence</option>
          </select>
          <p className="text-slate-400 text-sm mt-2">Select the questionnaire identifier</p>
        </div>

        {/* Document Selection */}
        <div>
          <label className="block text-white font-semibold mb-3">Select Documents</label>
          <div className="space-y-2 bg-slate-900 rounded-lg p-4 border border-slate-700 max-h-64 overflow-y-auto">
            {uploadedDocs.map((doc) => (
              <label key={doc.id} className="flex items-center p-3 hover:bg-slate-800 rounded-lg cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={selectedDocIds.includes(doc.id)}
                  onChange={() => handleDocumentToggle(doc.id)}
                  className="w-5 h-5 rounded border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{doc.filename}</p>
                  <p className="text-xs text-slate-500 font-mono">{doc.content_hash.slice(0, 16)}...</p>
                </div>
                <div className="text-slate-500 ml-2">📄</div>
              </label>
            ))}
          </div>
          <p className="text-slate-400 text-sm mt-2">
            {selectedDocIds.length} of {uploadedDocs.length} documents selected
          </p>
        </div>

        {/* Summary */}
        <div className="bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg p-6">
          <h3 className="text-white font-bold mb-4">📋 Project Summary</h3>
          <div className="space-y-3 text-slate-300">
            <div className="flex justify-between">
              <span>Project Name:</span>
              <span className={`font-semibold ${projectName ? "text-white" : "text-slate-500"}`}>
                {projectName || "Not set"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Questionnaire ID:</span>
              <span className={`font-semibold ${questionnaireId ? "text-white" : "text-slate-500"}`}>
                {questionnaireId || "Not set"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Documents:</span>
              <span className={`font-semibold ${selectedDocIds.length > 0 ? "text-white" : "text-slate-500"}`}>
                {selectedDocIds.length} selected
              </span>
            </div>
          </div>
        </div>

        {!isValid && (
          <div className="bg-yellow-900 bg-opacity-30 border border-yellow-700 rounded-lg p-4 text-yellow-100">
            <p className="font-semibold">⚠️ Please fill in all fields to continue</p>
            <ul className="text-sm mt-2 space-y-1">
              {!projectName && <li>• Project name is required</li>}
              {!questionnaireId && <li>• Questionnaire ID is required</li>}
              {selectedDocIds.length === 0 && <li>• At least one document must be selected</li>}
            </ul>
          </div>
        )}
      </div>
    );
  }
);

Step3ConfigureProject.displayName = "Step3ConfigureProject";
