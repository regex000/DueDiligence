import React, { useState, useEffect } from "react";
import { RequestStatus, AsyncRequest } from "../types";
import { LoadingSpinner, ProgressBar } from "./common";
import { apiClient } from "../services/api";

interface GenerationProgressModalProps {
  isOpen: boolean;
  requestId: string | null;
  onComplete: () => void;
  onError: (error: string) => void;
}

export const GenerationProgressModal: React.FC<GenerationProgressModalProps> = ({
  isOpen,
  requestId,
  onComplete,
  onError,
}) => {
  const [request, setRequest] = useState<AsyncRequest | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("Initializing...");
  const [elapsedTime, setElapsedTime] = useState(0);

  // Fetch initial status immediately
  useEffect(() => {
    if (!isOpen || !requestId) {
      console.log("Modal not ready - isOpen:", isOpen, "requestId:", requestId);
      return;
    }

    console.log("Fetching initial status for request:", requestId);
    const fetchStatus = async () => {
      try {
        const updatedRequest = await apiClient.getRequestStatus(requestId);
        setRequest(updatedRequest);
        console.log("Initial request status:", updatedRequest);
      } catch (err) {
        console.error("Failed to fetch initial request status:", err);
      }
    };

    fetchStatus();
  }, [isOpen, requestId]);

  // Poll for status updates
  useEffect(() => {
    if (!isOpen || !requestId) return;

    let pollInterval: NodeJS.Timeout;
    let isCompleted = false;

    const poll = async () => {
      if (isCompleted) return;

      try {
        const updatedRequest = await apiClient.getRequestStatus(requestId);
        setRequest(updatedRequest);
        console.log("Polling request status:", updatedRequest);

        // Update progress based on status
        switch (updatedRequest.status) {
          case RequestStatus.QUEUED:
            setProgress(10);
            setStatusMessage("Queued - waiting to start...");
            break;
          case RequestStatus.PROCESSING:
            setProgress(50);
            setStatusMessage("Processing - generating answers...");
            break;
          case RequestStatus.COMPLETED:
            setProgress(100);
            setStatusMessage("Completed successfully!");
            isCompleted = true;
            setTimeout(() => {
              clearInterval(pollInterval);
              onComplete();
            }, 1000);
            break;
          case RequestStatus.FAILED:
            isCompleted = true;
            clearInterval(pollInterval);
            onError(updatedRequest.error || "Generation failed");
            break;
        }
      } catch (err) {
        console.error("Failed to poll request status:", err);
      }
    };

    // Start polling immediately
    pollInterval = setInterval(poll, 1000); // Poll every second

    return () => {
      isCompleted = true;
      clearInterval(pollInterval);
    };
  }, [isOpen, requestId, onComplete, onError]);

  // Track elapsed time
  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 max-w-md w-full mx-4">
        <div className="flex items-center justify-center mb-6">
          <LoadingSpinner size="lg" />
        </div>

        <h2 className="text-xl font-bold text-white text-center mb-2">Generating Answers</h2>
        <p className="text-slate-400 text-center text-sm mb-6">{statusMessage}</p>

        <div className="mb-6">
          <ProgressBar value={progress} max={100} showPercentage={true} />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 text-center">
          <div>
            <p className="text-xs text-slate-400 mb-1">Progress</p>
            <p className="text-lg font-semibold text-blue-400">{progress}%</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Elapsed Time</p>
            <p className="text-lg font-semibold text-slate-300">{formatTime(elapsedTime)}</p>
          </div>
        </div>

        {request && (
          <div className="bg-slate-700 rounded p-3 mb-4">
            <p className="text-xs text-slate-400 mb-1">Request ID</p>
            <p className="text-xs font-mono text-slate-300 break-all">{request.id}</p>
          </div>
        )}

        <div className="text-center">
          <p className="text-xs text-slate-500">
            {request?.status === RequestStatus.COMPLETED
              ? "✓ Generation complete"
              : "Please wait while we generate answers..."}
          </p>
        </div>
      </div>
    </div>
  );
};
