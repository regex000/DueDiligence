import { useState, useCallback } from "react";
import { AsyncRequest, RequestStatus } from "../types";
import { apiClient } from "../services/api";
import { config } from "../config";

export const useAsyncRequest = () => {
  const [requests, setRequests] = useState<Map<string, AsyncRequest>>(new Map());

  const pollRequest = useCallback(async (request_id: string, onComplete?: (req: AsyncRequest) => void) => {
    const poll = async () => {
      try {
        const request = await apiClient.getRequestStatus(request_id);
        setRequests((prev) => new Map(prev).set(request_id, request));

        if (request.status === "COMPLETED" || request.status === "FAILED") {
          onComplete?.(request);
        } else {
          setTimeout(poll, config.polling.interval);
        }
      } catch (error) {
        console.error("Failed to poll request status:", error);
        setTimeout(poll, config.polling.interval);
      }
    };
    poll();
  }, []);

  return { requests, pollRequest };
};
