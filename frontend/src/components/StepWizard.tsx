import React, { useState, useRef } from "react";
import { Project, Document } from "../types";
import { Step1SelectProject } from "./wizard/Step1SelectProject";
import { Step2UploadDocuments } from "./wizard/Step2UploadDocuments";
import { Step3ConfigureProject } from "./wizard/Step3ConfigureProject";
import { Step4ReviewAndStart } from "./wizard/Step4ReviewAndStart";
import { LoadingSpinner } from "./common";
import { apiClient } from "../services/api";

interface StepWizardProps {
  projects: Project[];
  documents: Document[];
  projectsLoading: boolean;
  docsLoading: boolean;
  onUploadDocument: (file: File) => Promise<string>;
  onCreateProject: (name: string, questionnaire_id: string, document_ids: string[]) => Promise<string>;
  onWizardComplete: (project: Project) => void;
  pollRequest: (requestId: string, onComplete: (req: any) => void) => void;
}

export const StepWizard: React.FC<StepWizardProps> = ({
  projects,
  documents,
  projectsLoading,
  docsLoading,
  onUploadDocument,
  onCreateProject,
  onWizardComplete,
  pollRequest,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<Document[]>([]);
  const [projectName, setProjectName] = useState("");
  const [questionnaireId, setQuestionnaireId] = useState("");
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const step3Ref = useRef<any>(null);

  const handleSelectExistingProject = (project: Project) => {
    setSelectedProject(project);
    setCurrentStep(4);
  };

  const handleCreateNewProject = () => {
    setSelectedProject(null);
    setCurrentStep(2);
  };

  const handleDocumentsUploaded = async (docs: Document[]) => {
    // Set the selected documents and move to next step
    setUploadedDocs(docs);
    setCurrentStep(3);
  };

  const handleProjectConfigured = (name: string, qId: string, docIds: string[]) => {
    setProjectName(name);
    setQuestionnaireId(qId);
    setSelectedDocIds(docIds);
    setCurrentStep(4);
  };

  const handleStartProject = async () => {
    setLoading(true);
    setError(null);
    try {
      const requestId = await onCreateProject(projectName, questionnaireId, selectedDocIds);
      
      // Poll for completion
      pollRequest(requestId, (req: any) => {
        if (req.status === "COMPLETED") {
          // Fetch the created project
          const newProject: Project = {
            id: req.project_id || `proj_${Date.now()}`,
            name: projectName,
            questionnaire_id: questionnaireId,
            status: "ACTIVE",
            document_ids: selectedDocIds,
            answers: [],
          };
          onWizardComplete(newProject);
        } else if (req.status === "FAILED") {
          setError(req.error || "Failed to create project");
          setLoading(false);
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    }
  };

  const steps = [
    { number: 1, title: "Select Project", description: "Choose existing or create new" },
    { number: 2, title: "Upload Documents", description: "Add company documents" },
    { number: 3, title: "Configure Project", description: "Set project details" },
    { number: 4, title: "Review & Start", description: "Confirm and begin" },
  ];

  return (
    <div className="space-y-8">
      {/* Progress Indicator */}
      <div className="bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-700">
        <div className="flex justify-between items-center">
          {steps.map((step, idx) => (
            <div key={step.number} className="flex items-center flex-1">
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full font-bold transition-all ${
                  currentStep >= step.number
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-slate-700 text-slate-400"
                }`}
              >
                {currentStep > step.number ? "✓" : step.number}
              </div>
              <div className="ml-3 flex-1">
                <p className={`font-semibold ${currentStep >= step.number ? "text-white" : "text-slate-400"}`}>
                  {step.title}
                </p>
                <p className="text-xs text-slate-500">{step.description}</p>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-2 rounded transition-all ${
                    currentStep > step.number ? "bg-blue-600" : "bg-slate-700"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-slate-800 rounded-lg shadow-lg p-8 border border-slate-700 min-h-96">
        {error && (
          <div className="mb-6 bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-red-100 hover:text-red-50">
                ✕
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner size="lg" />
            <p className="text-slate-300 mt-4">Creating project...</p>
          </div>
        )}

        {!loading && (
          <>
            {currentStep === 1 && (
              <Step1SelectProject
                projects={projects}
                loading={projectsLoading}
                onSelectExisting={handleSelectExistingProject}
                onCreateNew={handleCreateNewProject}
              />
            )}

            {currentStep === 2 && (
              <Step2UploadDocuments
                onDocumentsUploaded={handleDocumentsUploaded}
                onUploadDocument={onUploadDocument}
                uploadedDocs={uploadedDocs}
              />
            )}

            {currentStep === 3 && (
              <Step3ConfigureProject
                ref={step3Ref}
                uploadedDocs={uploadedDocs}
                onConfigured={handleProjectConfigured}
                projectName={projectName}
                questionnaireId={questionnaireId}
                selectedDocIds={selectedDocIds}
              />
            )}

            {currentStep === 4 && (
              <Step4ReviewAndStart
                projectName={projectName}
                questionnaireId={questionnaireId}
                selectedDocIds={selectedDocIds}
                uploadedDocs={uploadedDocs}
                isExistingProject={selectedProject !== null}
                onStart={handleStartProject}
              />
            )}
          </>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={handleBack}
          disabled={currentStep === 1 || loading}
          className="px-6 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          ← Back
        </button>

        <div className="text-slate-400 text-sm">
          Step {currentStep} of {steps.length}
        </div>

        {currentStep < 4 && (
          <button
            onClick={() => {
              if (currentStep === 3) {
                // Get form data from Step3 ref
                if (step3Ref.current && step3Ref.current.isValid()) {
                  const formData = step3Ref.current.getFormData();
                  if (formData) {
                    handleProjectConfigured(formData.name, formData.questionnaireId, formData.docIds);
                  }
                }
              } else {
                setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
              }
            }}
            disabled={
              (currentStep === 2 && uploadedDocs.length === 0) ||
              (currentStep === 3 && step3Ref.current && !step3Ref.current.isValid()) ||
              loading
            }
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Next →
          </button>
        )}

        {currentStep === 4 && (
          <button
            onClick={handleStartProject}
            disabled={loading}
            className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
          >
            {loading ? "Starting..." : "Start Project"}
          </button>
        )}
      </div>
    </div>
  );
};
