import React, { useState } from "react";
import { AsyncRequest, RequestStatus } from "../types";
import { LoadingSpinner } from "./common";

interface RequestStatusTrackerProps {
  requests: Map<string, AsyncRequest>;
}

export const RequestStatusTracker: React.FC<RequestStatusTrackerProps> = ({ requests }) => {
  const [expanded, setExpanded] = useState(false);
  const requestList = Array.from(requests.values());
  const activeRequests = requestList.filter((r) => r.status === "PROCESSING");

  if (requestList.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-slate-800 rounded-lg border border-slate-700 shadow-lg">
      <div
        className="p-4 cursor-pointer hover:bg-slate-700 transition flex justify-between items-center"
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <h3 className="font-semibold text-white">Background Tasks</h3>
          <p className="text-sm text-slate-400">{activeRequests.length} processing</p>
        </div>
        <span className="text-slate-400">{expanded ? "▼" : "▶"}</span>
      </div>

      {expanded && (
        <div className="border-t border-slate-700 max-h-96 overflow-y-auto">
          {requestList.map((req) => (
            <RequestItem key={req.id} request={req} />
          ))}
        </div>
      )}
    </div>
  );
};

interface RequestItemProps {
  request: AsyncRequest;
}

const RequestItem: React.FC<RequestItemProps> = ({ request }) => {
  const statusColors: Record<string, string> = {
    QUEUED: "bg-slate-700 text-slate-300",
    PROCESSING: "bg-blue-900 text-blue-200",
    COMPLETED: "bg-green-900 text-green-200",
    FAILED: "bg-red-900 text-red-200",
  };

  return (
    <div className="p-4 border-b border-slate-700 hover:bg-slate-700 transition">
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-mono text-slate-400">{request.id.slice(0, 8)}</span>
        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[request.status]}`}>
          {request.status}
        </span>
      </div>
      {request.status === "PROCESSING" && (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400">Processing...</span>
        </div>
      )}
      {request.error && <p className="text-xs text-red-400 mt-2">{request.error}</p>}
    </div>
  );
};
