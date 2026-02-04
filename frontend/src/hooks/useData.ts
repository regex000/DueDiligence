import { useState, useCallback } from "react";
import { Project, Document } from "../types";
import { apiClient } from "../services/api";

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const projects = await apiClient.listProjects();
      setProjects(projects);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = useCallback(async (name: string, questionnaire_id: string, document_ids: string[]) => {
    try {
      const { request_id } = await apiClient.createProject(name, questionnaire_id, document_ids);
      return request_id;
    } catch (error) {
      console.error("Failed to create project:", error);
      throw error;
    }
  }, []);

  const getProject = useCallback(async (project_id: string) => {
    try {
      const project = await apiClient.getProject(project_id);
      // Update local state with the fetched project
      setProjects((prev) => {
        const existing = prev.findIndex((p) => p.id === project_id);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = project;
          return updated;
        }
        return [...prev, project];
      });
      return project;
    } catch (error) {
      console.error("Failed to get project:", error);
      throw error;
    }
  }, []);

  return { projects, loading, fetchProjects, createProject, getProject };
};

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const docs = await apiClient.listDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadDocument = useCallback(async (file: File) => {
    try {
      const { request_id } = await apiClient.uploadDocument(file);
      
      // Fetch documents after upload to get the actual document from backend
      setTimeout(() => fetchDocuments(), 1000);
      
      return request_id;
    } catch (error) {
      console.error("Failed to upload document:", error);
      throw error;
    }
  }, [fetchDocuments]);

  return { documents, loading, fetchDocuments, uploadDocument };
};
