# MediAssist: Medical RAG Chatbot

[![Python 3.12+](https://img.shields.io/badge/python-3.12+-blue.svg)](https://www.python.org/downloads/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-active-success.svg)]()

# Project Overview:
This project is an AI chatbot designed to answer clinical queries. It features a RAG system with a Flask-based web interface to interact with the Retrieval pipeline, which pulls context from a vector database.

# Objective: 🚀
I built MediAssist to tackle the "hallucination" problem in medical AI. Instead of letting an LLM guess, this system forces the model to look at verified medical literature (Gale Encyclopedia of Medicine) before speaking. 

Its design showcases an end-to-end AI Engineering pipeline: **from raw PDF ingestion** to **embedding context into vector database** and serving clinical queries via a **live and responsive web-based chat interface**.


# Tech Stack: 🛠

| Component | Technology | Configuration | Description |
|-----------|------------|------------------------|---------------|
| **Embeddings** | HuggingFace | sentence-transformers/all-MiniLM-L6-v2 | a lightweight model that runs efficiently on local hardware during development |
| **LLM Provider** | Groq API | Llama 4 Scout (17B) | providing a real-time chat experience |
| **Vector Database** | Pinecone | Serverless, 384 dimensions, cosine similarity | chosen for its ease of scaling without managing local infrastructure |
| **Orchestration** | LangChain | LCEL | using LCEL (LangChain Expression Language) for modular, readable chains |
| **Backend Framework** | Flask 3.1 | REST API | A lightweight framework for RESTful API server & template rendering |
| **Package Management** | uv | - | a much faster alternative to pip for faster dependency resolution and cleaner virtual environment |
| **Containerization** | Docker | Planned for production deployment | - |
| **Styling** | Custom CSS | Dark theme, chat bubble styling |

# How it Works: 📖

1. **Data Ingestion (The ETL Pipeline)** ─ We don't just dump text. The process is systematic:
   - **Extract**: Raw PDFs are parsed using PyPDF.
   - **Chunking**: I used a 500-character chunk size and 50-character overlap. This balance ensures we don't lose the medical context between snippets.
   - **Vectorizing**: Text is converted into 384-dimensional vector embeddings.
   - **Upserting**: These embeddings are stored in a Pinecone index named medical-assistant.
     
2. **The Retrieval Loop** ─ When you ask a question:
   - The system creates a vector for your query ─ clinical entities (symptoms, conditions, medications).
   - It semantically searches Pinecone for the Top 3 most relevant matches (k=3).
   - It injects those matches into a specialized Clinical System Prompt.
   - The LLM generates a response or admits it doesn't know if the context is missing.
    

# Local Setup: 💻
If you're running this on a machine with limited storage, I recommend using ``uv`` to keep your environment clean.

#### Prerequisites
- Python 3.12+
- uv
#### Setup Keys
Create a .env file in the project root and add:
- Pinecone API Key ([signup](https://www.pinecone.io/))
- Groq API Key ([signup](https://console.groq.com/))
- Hugging-Face Embedding Model API Key


# Quick Start: ⚡
#### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/medical-assistant-chatbot.git
```
#### 2. Set up a virtual environment with uv
```bash
uv venv
.venv\Scripts\activate
uv sync
```
#### 3. Running the Project
Place your PDFs in the Data/ folder and run:
```bash
python store_index.py
```
This will take a few minutes, depending on the document size.
This will:
- Load PDFs from the `Data/` directory
- Split documents into chunks
- Generate embeddings
- Store vectors in Pinecone

#### 4. Launch the Chatbot
```bash
python app.py
```
Navigate to http://localhost:5000 to start chatting.




## System Architecture
```
┌──────────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                               │
│       Chat UI (templates/chat.html + static/style.css)               │
└──────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                                │
│                 Flask Backend (app.py)                               │
│       Routes: "/" (render UI) | "/get" (POST - query handler)        │
└──────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        RAG PIPELINE LAYER                            │
│                           src/helper.py                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐       │
│  │  Document Load  │  │  Text Splitter  │  │  Embedding Model│       │
│  │   (PyPDF)       │  │ (RecursiveChar) │  │ (MiniLM-L6-v2)  │       │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘       │
│                                                                      │
│  ┌─────────────────┐  ┌─────────────────┐                            │
│  │  RAG Chain      │  │  System Prompt  │                            │
│  │  (LCEL)         │  │  (Clinical)     │                            │
│  └─────────────────┘  └─────────────────┘                            │
└──────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        STORAGE LAYER                                 │
│                    Pinecone Vector Database                          │
│              Index: medical-assistant | Dim: 384 | Metric: cosine    │
└──────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        GENERATION LAYER                              │
│                    Groq Llama 4 (via API)                            │
│              Temperature: 0 | System Prompt: Clinical Protocol       │
└──────────────────────────────────────────────────────────────────────┘
```

# Future Improvements
[Deployment] **AWS Deployment**: Moving the Flask app to an EC2 instance with an S3 bucket for document storage.
[UX] **Frontend**: I’m working on a frontend redesign that supports real-time token streaming. This will eliminate the wait time for the user, providing a much smoother, modern chat experience.




## API Reference

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Render chat interface (templates/chat.html) |
| `POST` | `/get` | Submit clinical query and receive response |

### Request/Response Schema

#### POST /get

**Request (Form Data):**
```
msg: What are the symptoms of vitamin D deficiency?
```

**Response (JSON - raw string):**
```json
"Vitamin D deficiency may cause the following symptoms:\n- Bone pain and tenderness\n- Muscle weakness\n- Increased fracture risk..."
```

### Error Responses

| Status Code | Response | Description |
|-------------|----------|-------------|
| 400 | `{"error": "Empty message"}` | No message provided in request |
| 503 | `{"error": "Service unavailable"}` | RAG chain not initialized |
| 500 | `{"error": "Failed to generate response"}` | Internal error during generation |

---

## Frontend

### Chat Interface

The frontend is a single-page chat application built with:

- **Bootstrap 4.1**: Responsive layout and components
- **jQuery 3.3**: DOM manipulation and AJAX requests
- **Custom CSS**: Dark gradient theme with chat bubble styling

### File Structure

```
templates/
  └── chat.html        # Main chat interface
static/
  └── style.css        # Custom styling
```

### Features

- Real-time message display with timestamps
- Distinct styling for user vs. bot messages
- Responsive design for mobile/desktop
- Auto-scroll to latest message

---

## Deployment

> **Note**: Production deployment configuration is under development. This section will be updated with AWS infrastructure details.

### Planned Infrastructure

- **Compute**: AWS ECS Fargate / Lambda
- **Load Balancing**: Application Load Balancer (ALB)
- **Secrets Management**: AWS Secrets Manager
- **Monitoring**: CloudWatch Logs + X-Ray tracing

### Docker (Planned)

```dockerfile
# Multi-stage build for minimal production image
# TODO: Implement Dockerfile
```

### Environment Variables (Production)

| Variable | Source |
|----------|--------|
| `PINECONE_API_KEY` | AWS Secrets Manager |
| `GROQ_API_KEY` | AWS Secrets Manager |
| `FLASK_ENV` | Production |
| `LOG_LEVEL` | INFO/WARNING |

---

## Future Roadmap

### Q2 2026

- [ ] **AWS Deployment**: Containerized deployment on ECS with ALB routing
- [ ] **CI/CD Pipeline**: GitHub Actions for automated testing and deployment
- [ ] **Health Check Endpoint**: Add `/api/health` for monitoring
- [ ] **Dockerfile**: Multi-stage build for production image

### Q3 2026

- [ ] **Expanded Medical Datasets**:
  - PubMed Central Open Access subset
  - MIMIC-III clinical notes (de-identified)
  - DrugBank pharmacological data
- [ ] **Multi-Model Support**: Ollama integration for local LLM fallback
- [ ] **Caching Layer**: Redis for query result caching
- [ ] **Ingestion Endpoint**: Add `/api/ingest` for dynamic PDF upload

### Q4 2026

- [ ] **Evaluation Framework**: RAGAS metrics for retrieval/generation quality
- [ ] **Observability**: LangSmith tracing for pipeline debugging
- [ ] **Authorization**: JWT-based API authentication

---

## Project Structure

```
medical-assistant-chatbot/
├── .env                          # Environment variables (API keys)
├── .gitignore                    # Git ignore patterns
├── .python-version               # Python version specification (3.12+)
├── app.py                        # Flask application entry point
├── main.py                       # CLI placeholder
├── pyproject.toml                # Project dependencies (uv)
├── requirements.txt              # Python dependencies (pip format)
├── uv.lock                       # Dependency lock file
├── README.md                     # Project documentation
├── store_index.py                # ETL pipeline CLI - builds Pinecone index
│
├── Data/                         # Source medical PDFs
│   └── Medical_book.pdf
│
├── templates/                    # Flask templates
│   └── chat.html                 # Chat interface
│
├── static/                       # Static assets
│   └── style.css                 # Chat styling
│
├── src/                          # Core application logic
│   ├── __init__.py
│   ├── helper.py                 # ETL pipeline + RAG utilities
│   └── prompt.py                 # Clinical system prompts
│
└── notebooks/                    # Jupyter notebooks for experimentation
    └── trials.ipynb
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- **Style**: PEP 8 compliant
- **Naming**: `snake_case` (functions/variables), `PascalCase` (classes)
- **Error Handling**: Try-except blocks for all external API calls
- **Security**: No hardcoded credentials; use `os.getenv()` exclusively

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [LangChain](https://python.langchain.com/) for orchestration framework
- [Groq](https://groq.com/) for low-latency LLM inference
- [Pinecone](https://www.pinecone.io/) for vector database infrastructure
- [HuggingFace](https://huggingface.co/) for embedding models

---

**MediAssist** - Clinical AI Infrastructure for Evidence-Based Medical Information Retrieval
