"""
Main application entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.routes import router as api_router
from src.api.multi_model_routes import multi_model_router

# Initialize FastAPI app
app = FastAPI(
    title="Due Diligence Questionnaire Agent",
    description="Intelligent multi-model LLM system for due diligence analysis",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(api_router, prefix="/api", tags=["Due Diligence"])
app.include_router(multi_model_router, prefix="/models", tags=["Multi-Model"])


@app.get("/health")
def health_check() -> dict:
    """Health check endpoint"""
    return {"status": "ok", "service": "due-diligence-backend"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
