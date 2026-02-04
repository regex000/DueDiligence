# Due Diligence Backend - Production Ready

A well-structured, production-ready backend for the Due Diligence Questionnaire Agent using FastAPI and hexagonal architecture.

## Architecture

The backend follows **Hexagonal Architecture** (Ports & Adapters) with clear separation of concerns:

```
src/
├── api/                    # API layer (routes)
├── application/            # Use cases (business logic)
├── domain/                 # Domain layer (business rules)
│   ├── ports/             # Interfaces/contracts
│   └── services.py        # Domain services
├── infrastructure/        # Infrastructure layer (implementations)
├── core/                  # Core models and configuration
└── shared/                # Shared utilities
```

## Features

- **Async/Await**: Full async support with FastAPI
- **Hexagonal Architecture**: Clean separation of concerns
- **Multi-Model Support**: Intelligent model selection from 30+ free LLM models
- **Document Processing**: PDF parsing and chunking
- **Questionnaire Analysis**: Automated question extraction and answering
- **Request Queue**: Async operation tracking
- **CORS Support**: Cross-origin resource sharing enabled

## Installation

1. Clone the repository
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

## Running the Server

```bash
python main.py
```

The server will start at `http://localhost:8000`

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Document Management
- `POST /api/index-document-async` - Index a document asynchronously
- `GET /api/get-request-status` - Get async request status

### Project Management
- `POST /api/create-project-async` - Create a project asynchronously
- `GET /api/get-project-info` - Get project information

### Questionnaire Processing
- `POST /api/generate-all-answers` - Generate answers for all questions
- `POST /api/update-answer` - Update an answer
- `POST /api/evaluate-answers` - Evaluate answers against ground truth

### Multi-Model Management
- `GET /models/` - List all available models
- `GET /models/{model_id}` - Get model details
- `GET /models/capability/{capability}` - Get models by capability
- `GET /models/tier/{tier}` - Get models by tier
- `GET /models/provider/{provider}` - Get models by provider
- `GET /models/performance/fastest` - Get fastest models
- `GET /models/performance/throughput` - Get highest throughput models
- `GET /models/performance/context` - Get largest context models
- `POST /models/select` - Select best model for a task
- `POST /models/generate` - Generate with best model
- `POST /models/batch` - Batch generation
- `GET /models/stats` - Get model statistics

## Project Structure

### Core (`src/core/`)
- `models.py` - Pydantic models for data validation
- `config.py` - Configuration management

### Domain (`src/domain/`)
- `services.py` - Business logic services
- `services_multi.py` - Multi-model selection logic
- `ports/` - Interface definitions (repositories, services)

### Infrastructure (`src/infrastructure/`)
- `repositories.py` - In-memory repository implementations
- `llm_adapter.py` - OpenRouter LLM adapter
- `multi_model_adapter.py` - Multi-model LLM adapter
- `parser_adapters.py` - Document and questionnaire parsers
- `model_registry.py` - LLM model registry
- `request_queue.py` - Async request tracking

### Application (`src/application/`)
- `use_cases.py` - Business use cases
- `multi_model_use_case.py` - Multi-model use cases

### API (`src/api/`)
- `routes.py` - Main API routes
- `multi_model_routes.py` - Multi-model API routes

### Shared (`src/shared/`)
- `parsers.py` - PDF and questionnaire parsing utilities

## Configuration

Environment variables (see `.env.example`):

```
OPENROUTER_API_KEY=your_api_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
MODEL_NAME=anthropic/claude-3-5-sonnet
CHUNK_SIZE=500
CHUNK_OVERLAP=100
SIMILARITY_THRESHOLD=0.7
MAX_CITATIONS=5
CONFIDENCE_THRESHOLD=0.6
HOST=0.0.0.0
PORT=8000
DEBUG=false
```

## Development

### Code Organization
- Each module has an `__init__.py` for clean imports
- Clear separation between interfaces (ports) and implementations
- Dependency injection for testability

### Adding New Features
1. Define domain models in `src/core/models.py`
2. Create port interfaces in `src/domain/ports/`
3. Implement infrastructure adapters in `src/infrastructure/`
4. Create use cases in `src/application/`
5. Add API routes in `src/api/`

## Testing

Run tests with pytest:
```bash
pytest
```

## Performance Considerations

- **In-Memory Storage**: Current implementation uses in-memory repositories. For production, implement database adapters.
- **Async Operations**: All I/O operations are async for better performance
- **Model Selection**: Intelligent model selection based on task requirements
- **Caching**: Configuration is cached using `@lru_cache()`

## Future Enhancements

- [ ] Database persistence (PostgreSQL)
- [ ] Redis caching
- [ ] Authentication & Authorization
- [ ] Rate limiting
- [ ] Logging & Monitoring
- [ ] Unit & Integration tests
- [ ] Docker containerization
- [ ] CI/CD pipeline

## License

MIT
