import React, { useState } from "react";
import { Project, ProjectStatus } from "../types";
import { LoadingSpinner } from "./common";

interface ProjectListProps {
  projects: Project[];
  loading: boolean;
  onSelectProject: (project: Project) => void;
  onCreateProject: () => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({ projects, loading, onSelectProject, onCreateProject }) => {
  const [searchTerm, setSearchTerm] = React.useState("");

  if (loading) return <LoadingSpinner />;

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-slate-700 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Projects</h2>
          <button
            onClick={onCreateProject}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm font-medium"
          >
            + New
          </button>
        </div>
        <input
          type="text"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>
      <div className="divide-y divide-slate-700 overflow-y-auto flex-1">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            onClick={() => onSelectProject(project)}
            className="p-6 hover:bg-slate-700 cursor-pointer transition border-l-4 border-transparent hover:border-blue-500"
          >
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">{project.name}</h3>
                <p className="text-xs text-slate-400 mt-1">ID: {project.id.slice(0, 12)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                    {project.answers.length} answers
                  </span>
                  <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                    {project.document_ids.length} docs
                  </span>
                </div>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                  project.status === ProjectStatus.ACTIVE ? "bg-green-900 text-green-200" : "bg-yellow-900 text-yellow-200"
                }`}
              >
                {project.status}
              </span>
            </div>
          </div>
        ))}
      </div>
      {filteredProjects.length === 0 && (
        <div className="p-6 text-center text-slate-400 text-sm">
          {projects.length === 0 ? "No projects yet" : "No projects match your search"}
        </div>
      )}
    </div>
  );
};

interface ProjectCreateProps {
  documents: string[];
  onSubmit: (name: string, questionnaire_id: string, document_ids: string[]) => Promise<void>;
  onCancel: () => void;
}

export const ProjectCreate: React.FC<ProjectCreateProps> = ({ documents, onSubmit, onCancel }) => {
  const [name, setName] = useState("");
  const [questionnaire_id, setQuestionnaireId] = useState("");
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(name, questionnaire_id, selectedDocs);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-slate-800 rounded-lg border border-slate-700 shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-white mb-4">Create Project</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Project Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Questionnaire ID</label>
            <input
              type="text"
              value={questionnaire_id}
              onChange={(e) => setQuestionnaireId(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Documents</label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {documents.map((doc) => (
                <label key={doc} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedDocs.includes(doc)}
                    onChange={(e) =>
                      setSelectedDocs(e.target.checked ? [...selectedDocs, doc] : selectedDocs.filter((d) => d !== doc))
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-slate-300">{doc}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
