import React, { useState } from "react";
import { Document } from "../types";
import { LoadingSpinner, ErrorAlert, SuccessAlert } from "./common";

interface DocumentUploadProps {
  onUploadStart: (file: File) => Promise<string>;
  onUploadComplete: (requestId: string) => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUploadStart, onUploadComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
    e.target.value = "";
  };

  const processFile = async (file: File) => {
    // Validate file type
    const validTypes = [".pdf", ".docx", ".xlsx", ".pptx"];
    const fileExt = "." + file.name.split(".").pop()?.toLowerCase();
    if (!validTypes.includes(fileExt)) {
      setError("Invalid file type. Please upload PDF, DOCX, XLSX, or PPTX files.");
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError("File size exceeds 50MB limit.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const requestId = await onUploadStart(file);
      onUploadComplete(requestId);
      setSuccess(`Document "${file.name}" uploaded successfully`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
      <h3 className="text-lg font-semibold text-white mb-4">Upload Document</h3>
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
          dragActive ? "border-blue-500 bg-blue-900 bg-opacity-20" : "border-slate-600"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          onChange={handleFileChange}
          disabled={loading}
          className="hidden"
          id="file-input"
          accept=".pdf,.docx,.xlsx,.pptx"
        />
        <label htmlFor="file-input" className="cursor-pointer block">
          {loading ? (
            <div className="flex justify-center">
              <LoadingSpinner size="sm" />
            </div>
          ) : (
            <div>
              <svg className="mx-auto h-12 w-12 text-slate-500" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V20m-8-12v12m0 0l-4-4m4 4l4-4" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-slate-400 mt-2">Drag and drop or click to upload</p>
              <p className="text-sm text-slate-500">PDF, DOCX, XLSX, PPTX (max 50MB)</p>
            </div>
          )}
        </label>
      </div>
      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}
      {success && <SuccessAlert message={success} onDismiss={() => setSuccess(null)} />}
    </div>
  );
};

interface DocumentListProps {
  documents: Document[];
  loading: boolean;
}

export const DocumentList: React.FC<DocumentListProps> = ({ documents, loading }) => {
  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-900 border-b border-slate-700">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Filename</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Hash</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc.id} className="border-b border-slate-700 hover:bg-slate-700">
              <td className="px-6 py-4 text-sm text-slate-300">{doc.filename}</td>
              <td className="px-6 py-4 text-sm text-slate-400 font-mono">{doc.content_hash.slice(0, 16)}...</td>
            </tr>
          ))}
        </tbody>
      </table>
      {documents.length === 0 && <div className="p-6 text-center text-slate-400">No documents uploaded</div>}
    </div>
  );
};
