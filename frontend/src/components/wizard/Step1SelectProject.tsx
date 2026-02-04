import React from "react";
import { Project } from "../../types";
import { LoadingSpinner } from "../common";

interface Step1SelectProjectProps {
  projects: Project[];
  loading: boolean;
  onSelectExisting: (project: Project) => void;
  onCreateNew: () => void;
}

export const Step1SelectProject: React.FC<Step1SelectProjectProps> = ({
  projects,
  loading,
  onSelectExisting,
  onCreateNew,
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <p className="text-slate-300 mt-4">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Step 1: Select Project</h2>
        <p className="text-slate-400">Choose to work with an existing project or create a new one</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create New Project */}
        <div
          onClick={onCreateNew}
          className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-8 cursor-pointer hover:shadow-lg transition transform hover:scale-105 border border-blue-500"
        >
          <div className="text-4xl mb-4">➕</div>
          <h3 className="text-xl font-bold text-white mb-2">Create New Project</h3>
          <p className="text-blue-100">Start a new due diligence questionnaire project from scratch</p>
          <div className="mt-6 text-blue-100 text-sm">
            <p>✓ Upload documents</p>
            <p>✓ Configure questionnaire</p>
            <p>✓ Generate answers</p>
          </div>
        </div>

        {/* Select Existing Project */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-8 border border-purple-500">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-xl font-bold text-white mb-4">Select Existing Project</h3>
          {projects.length === 0 ? (
            <p className="text-purple-100">No existing projects. Create a new one to get started.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => onSelectExisting(project)}
                  className="w-full text-left bg-purple-500 hover:bg-purple-400 transition p-3 rounded-lg text-white"
                >
                  <p className="font-semibold">{project.name}</p>
                  <p className="text-xs text-purple-100 mt-1">
                    {project.answers.length} answers • {project.document_ids.length} documents
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
