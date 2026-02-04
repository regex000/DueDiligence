import React, { useState, useEffect } from "react";
import { Project } from "./types";
import { StepWizard } from "./components/StepWizard";
import { ProjectDashboard } from "./components/ProjectDashboard";
import { useProjects, useDocuments } from "./hooks/useData";
import { useAsyncRequest } from "./hooks/useAsyncRequest";
import { config } from "./config";

type AppView = "wizard" | "dashboard";

export default function App() {
  const [view, setView] = useState<AppView>("wizard");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const { projects, loading: projectsLoading, fetchProjects, createProject, getProject } = useProjects();
  const { documents, loading: docsLoading, fetchDocuments, uploadDocument } = useDocuments();
  const { requests, pollRequest } = useAsyncRequest();

  useEffect(() => {
    fetchProjects();
    fetchDocuments();
  }, []);

  const handleWizardComplete = async (project: Project) => {
    setSelectedProject(project);
    setView("dashboard");
  };

  const handleBackToWizard = () => {
    setView("wizard");
    setSelectedProject(null);
    fetchProjects();
    fetchDocuments();
  };

  const handleRefreshProject = async () => {
    if (selectedProject) {
      const updated = await getProject(selectedProject.id);
      setSelectedProject(updated);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800 shadow-lg border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">{config.app.name}</h1>
              <p className="text-xs text-slate-400 mt-1">v{config.app.version}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">
                Environment: <span className="font-medium text-slate-300">{config.app.environment}</span>
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {view === "wizard" && (
          <StepWizard
            projects={projects}
            documents={documents}
            projectsLoading={projectsLoading}
            docsLoading={docsLoading}
            onUploadDocument={uploadDocument}
            onCreateProject={createProject}
            onWizardComplete={handleWizardComplete}
            pollRequest={pollRequest}
          />
        )}

        {view === "dashboard" && selectedProject && (
          <ProjectDashboard
            project={selectedProject}
            onBack={handleBackToWizard}
            onRefresh={handleRefreshProject}
          />
        )}
      </main>
    </div>
  );
}
