# Due Diligence Questionnaire Agent - Frontend

A modern, step-by-step React application for managing due diligence questionnaires with AI-powered answer generation and human review capabilities.

## 🎯 Features

### Step-by-Step Wizard
1. **Select Project** - Choose existing project or create new
2. **Upload Documents** - Add company documents (PDF, DOCX, XLSX, PPTX)
3. **Configure Project** - Set project name, questionnaire ID, and select documents
4. **Review & Start** - Confirm configuration and launch project

### Project Dashboard
- **Overview Tab** - Project status and progress tracking
- **Answers Tab** - Review, edit, and validate AI-generated answers
- **Evaluation Tab** - Compare answers against ground truth

### Document Management
- Multi-format support (PDF, DOCX, XLSX, PPTX)
- Drag-and-drop upload
- File validation and size limits
- Upload progress tracking

### Answer Review
- Filter by status (Generated, Confirmed, Rejected, Manual)
- Search by question ID or text
- View citations with confidence scores
- Edit and manually override answers
- Batch status updates

### Evaluation & Reporting
- Similarity scoring (0-100%)
- Match classification (Exact, Partial, Mismatch)
- Detailed statistics and visualizations
- Progress tracking

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/
│   ├── StepWizard.tsx              # Main wizard component
│   ├── ProjectDashboard.tsx        # Project dashboard
│   ├── AnswerReview.tsx            # Answer review interface
│   ├── EvaluationReport.tsx        # Evaluation results
│   ├── DocumentManagement.tsx      # Document upload/list
│   ├── ProjectManagement.tsx       # Project list/create
│   ├── RequestStatusTracker.tsx    # Async request tracking
│   ├── common.tsx                  # Shared UI components
│   └── wizard/
│       ├── Step1SelectProject.tsx  # Project selection
│       ├── Step2UploadDocuments.tsx # Document upload
│       ├── Step3ConfigureProject.tsx # Project config
│       └── Step4ReviewAndStart.tsx  # Review & start
├── hooks/
│   ├── useData.ts                  # Data fetching hooks
│   └── useAsyncRequest.ts          # Async request polling
├── services/
│   └── api.ts                      # API client
├── types/
│   └── index.ts                    # TypeScript types
├── config/
│   └── index.ts                    # Configuration
├── App.tsx                         # Main app component
└── main.tsx                        # Entry point
```

## 🔧 Configuration

### Environment Variables (.env.local)

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api
VITE_API_TIMEOUT=30000

# Request Polling
VITE_REQUEST_POLL_INTERVAL=1000

# App Configuration
VITE_APP_NAME=Due Diligence Questionnaire Agent
VITE_APP_VERSION=0.1.0
VITE_ENVIRONMENT=development
```

## 📊 Workflow

### 1. Project Selection
- View existing projects
- Create new project
- Select project to work with

### 2. Document Upload
- Upload company documents
- Validate file types and sizes
- Track upload progress
- Review uploaded documents

### 3. Project Configuration
- Enter project name
- Specify questionnaire ID
- Select documents to include
- Review project summary

### 4. Project Launch
- Confirm all settings
- Review what happens next
- Start project creation

### 5. Project Dashboard
- Monitor project status
- Generate AI answers
- Review and validate answers
- Evaluate against ground truth

## 🎨 UI Components

### Common Components
- `LoadingSpinner` - Loading indicator
- `ErrorAlert` - Error messages
- `SuccessAlert` - Success messages
- `InfoAlert` - Information messages
- `WarningAlert` - Warning messages
- `EmptyState` - Empty state display
- `ProgressBar` - Progress indicator
- `AnswerStatusBadge` - Status badge

### Wizard Components
- `StepWizard` - Main wizard container
- `Step1SelectProject` - Project selection
- `Step2UploadDocuments` - Document upload
- `Step3ConfigureProject` - Project configuration
- `Step4ReviewAndStart` - Review and start

### Dashboard Components
- `ProjectDashboard` - Main dashboard
- `AnswerReview` - Answer review interface
- `EvaluationReport` - Evaluation results

## 🔌 API Integration

### Document Upload
```typescript
POST /api/index-document-async
- Upload and index document
- Returns: { request_id: string }
```

### Project Management
```typescript
POST /api/create-project-async
- Create new project
- Returns: { request_id: string }

GET /api/list-projects
- List all projects
- Returns: { projects: Project[] }

GET /api/get-project-info?project_id={id}
- Get project details
- Returns: { project: Project }
```

### Answer Generation
```typescript
POST /api/generate-all-answers?project_id={id}
- Generate answers for all questions
- Returns: { request_id: string }

POST /api/update-answer
- Update answer status or content
- Returns: { answer: Answer }
```

### Evaluation
```typescript
POST /api/evaluate-answers?project_id={id}
- Evaluate answers against ground truth
- Returns: { results: EvaluationResult[] }
```

### Async Operations
```typescript
GET /api/get-request-status?request_id={id}
- Check async request status
- Returns: { request: AsyncRequest }
```

## 📦 Dependencies

### Core
- `react` - UI library
- `react-dom` - React DOM rendering

### Build Tools
- `vite` - Build tool
- `typescript` - Type checking
- `@vitejs/plugin-react` - React plugin for Vite

### Styling
- `tailwindcss` - Utility-first CSS
- `postcss` - CSS processing
- `autoprefixer` - CSS vendor prefixes

## 🧪 Development

### Start Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 🎯 Key Features Explained

### Step-by-Step Wizard
The wizard guides users through a 4-step process:
1. Select whether to create a new project or use an existing one
2. Upload company documents
3. Configure project details
4. Review and start the project

### Document Upload
- Supports PDF, DOCX, XLSX, PPTX
- Maximum file size: 50MB
- Drag-and-drop support
- File validation
- Progress tracking

### Answer Review
- Filter answers by status
- Search by question ID or text
- View citations with confidence scores
- Edit answers manually
- Confirm or reject answers

### Evaluation
- Compare AI answers with ground truth
- Calculate similarity scores
- Classify matches (Exact, Partial, Mismatch)
- Generate detailed reports

## 🔐 Security

- Input validation on all forms
- File type and size validation
- CORS-enabled API calls
- Secure API communication
- No sensitive data stored locally

## 📈 Performance

- Code splitting with Vite
- Lazy loading of components
- Optimized re-renders with React hooks
- Efficient state management
- Minimal bundle size

## 🐛 Troubleshooting

### API Connection Failed
- Check backend is running: `docker-compose ps`
- Verify API URL in `.env.local`
- Check browser console for CORS errors

### Port 5173 Already in Use
```bash
npm run dev -- --port 3000
```

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Styling Issues
```bash
# Rebuild Tailwind CSS
npm run build
```

## 📚 Documentation

- [Main README](../README.md)
- [Backend Documentation](../backend/README.md)
- [API Documentation](../docs/API.md)

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and test
3. Commit: `git commit -am 'Add feature'`
4. Push: `git push origin feature/your-feature`
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

## 🚀 Future Enhancements

- [ ] Real-time collaboration
- [ ] Advanced search and filtering
- [ ] Export to multiple formats
- [ ] Batch operations
- [ ] Custom themes
- [ ] Mobile app
- [ ] Offline support
- [ ] Advanced analytics

---

**Version**: 0.1.0  
**Last Updated**: 2024  
**Status**: Active Development
