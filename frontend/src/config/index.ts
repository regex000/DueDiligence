export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || "30000"),
  },
  polling: {
    interval: parseInt(import.meta.env.VITE_REQUEST_POLL_INTERVAL || "1000"),
  },
  app: {
    name: import.meta.env.VITE_APP_NAME || "Due Diligence Questionnaire Agent",
    version: import.meta.env.VITE_APP_VERSION || "0.1.0",
    environment: import.meta.env.VITE_ENVIRONMENT || "development",
  },
} as const;
