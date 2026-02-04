import React, { useState, useEffect } from "react";
import { Document } from "../../types";
import { LoadingSpinner, ErrorAlert, SuccessAlert } from "../common";
import { apiClient } from "../../services/api";

interface Step2UploadDocumentsProps {
  onDocumentsUploaded: (docs: Document[]) => void;
  onUploadDocument: (file: File) => Promise<string>;
  uploadedDocs: Document[];
}

export const Step2UploadDocuments: React.FC<Step2UploadDocumentsProps> = ({
  onDocumentsUploaded,
  onUploadDocument,
  uploadedDocs,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [allDocuments, setAllDocuments] = useState<Document[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());
  const [loadingDocs, setLoadingDocs] = useState(false);

  // Fetch all available documents on mount
  useEffect(() => {
    fetchAllDocuments();
  }, []);

  const fetchAllDocuments = async () => {
    setLoadingDocs(true);
    try {
      const docs = await apiClient.listDocuments();
      setAllDocuments(docs);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      await processFiles(Array.from(files));
    }
    e.target.value = "";
  };

  const processFiles = async (files: File[]) => {
    const validTypes = [".pdf", ".docx", ".xlsx", ".pptx"];
    const validFiles = files.filter((file) => {
      const fileExt = "." + file.name.split(".").pop()?.toLowerCase();
      if (!validTypes.includes(fileExt)) {
        setError(`Invalid file type: ${file.name}. Please upload PDF, DOCX, XLSX, or PPTX files.`);
        return false;
      }
      if (file.size > 50 * 1024 * 1024) {
        setError(`File too large: ${file.name}. Maximum size is 50MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      for (const file of validFiles) {
        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));
        try {
          await onUploadDocument(file);
          setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
          setSuccess(`✓ ${file.name} uploaded successfully`);
        } catch (err) {
          setError(`Failed to upload ${file.name}: ${err instanceof Error ? err.message : "Unknown error"}`);
        }
      }
      // Refresh documents list after upload
      await fetchAllDocuments();
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
    const files = e.dataTransfer.files;
    if (files) {
      processFiles(Array.from(files));
    }
  };

  const handleDocumentToggle = (docId: string) => {
    const newSelected = new Set(selectedDocIds);
    if (newSelected.has(docId)) {
      newSelected.delete(docId);
    } else {
      newSelected.add(docId);
    }
    setSelectedDocIds(newSelected);
  };

  const handleContinueWithSelected = () => {
    const selected = allDocuments.filter((doc) => selectedDocIds.has(doc.id));
    if (selected.length > 0) {
      onDocumentsUploaded(selected);
    } else {
      setError("Please select at least one document to continue");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Step 2: Upload or Select Documents</h2>
        <p className="text-slate-400">Upload new documents or select from existing ones (PDF, DOCX, XLSX, PPTX - max 50MB each)</p>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}
      {success && <SuccessAlert message={success} onDismiss={() => setSuccess(null)} />}

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-12 text-center transition ${
          dragActive ? "border-blue-500 bg-blue-900 bg-opacity-20" : "border-slate-600 bg-slate-900 bg-opacity-50"
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
          multiple
        />
        <label htmlFor="file-input" className="cursor-pointer block">
          {loading ? (
            <div className="flex justify-center">
              <LoadingSpinner size="md" />
            </div>
          ) : (
            <div>
              <svg className="mx-auto h-16 w-16 text-slate-500 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path
                  d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V20m-8-12v12m0 0l-4-4m4 4l4-4"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-white text-lg font-semibold">Drag and drop files here</p>
              <p className="text-slate-400 mt-2">or click to browse</p>
              <p className="text-slate-500 text-sm mt-4">Supported: PDF, DOCX, XLSX, PPTX (max 50MB)</p>
            </div>
          )}
        </label>
      </div>

      {/* Available Documents */}
      {loadingDocs ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="md" />
        </div>
      ) : allDocuments.length > 0 ? (
        <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4">📚 Available Documents ({allDocuments.length})</h3>
          <p className="text-slate-400 text-sm mb-4">Select documents to use in your project:</p>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {allDocuments.map((doc) => (
              <label
                key={doc.id}
                className="flex items-center p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-blue-500 cursor-pointer transition"
              >
                <input
                  type="checkbox"
                  checked={selectedDocIds.has(doc.id)}
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
          
          {selectedDocIds.size > 0 && (
            <div className="mt-4 p-4 bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg">
              <p className="text-blue-100">
                <span className="font-bold">{selectedDocIds.size}</span> document{selectedDocIds.size !== 1 ? "s" : ""} selected
              </p>
              <button
                onClick={handleContinueWithSelected}
                className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Continue with Selected Documents →
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-900 rounded-lg p-6 border border-slate-700 text-center">
          <p className="text-slate-400">No documents available yet. Upload your first document above.</p>
        </div>
      )}

      {/* Recently Uploaded Documents */}
      {uploadedDocs.length > 0 && (
        <div className="bg-green-900 bg-opacity-20 border border-green-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-green-100 mb-4">✓ Recently Uploaded ({uploadedDocs.length})</h3>
          <div className="space-y-2">
            {uploadedDocs.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 text-green-100">
                <span className="text-green-400">✓</span>
                <span className="truncate">{doc.filename}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {allDocuments.length === 0 && uploadedDocs.length === 0 && !loading && (
        <div className="bg-yellow-900 bg-opacity-30 border border-yellow-700 rounded-lg p-4 text-yellow-100">
          <p className="font-semibold">📌 Tip: Upload at least one document to continue</p>
        </div>
      )}
    </div>
  );
};
