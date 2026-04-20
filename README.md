# MediAssist: Medical RAG Chatbot

[![Python 3.12+](https://img.shields.io/badge/python-3.12+-blue.svg)](https://www.python.org/downloads/)
[![Status](https://img.shields.io/badge/status-active-success.svg)]()

![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white)
![HuggingFace](https://img.shields.io/badge/HuggingFace-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black)
![Pinecone](https://img.shields.io/badge/Pinecone-272727?style=for-the-badge&logo=pinecone&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-f55036?style=for-the-badge&logo=groq&logoColor=white)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![Flask](https://img.shields.io/badge/flask-%23000.svg?style=for-the-badge&logo=flask&logoColor=white)

<img width="1600" height="800" alt="image" src="https://github.com/user-attachments/assets/d0fe29d8-6a21-4a17-a00b-a9300a4c7abd" />

# Project Overview:
This project is an AI chatbot designed to answer clinical queries. It features a RAG system with a Flask-based web interface to interact with the Retrieval pipeline, which pulls context from a vector database.

# Objective: 🚀
I built MediAssist to tackle the hallucination problem in medical AI. Instead of letting an LLM guess, this system forces the model to look at verified medical literature (Gale Encyclopedia of Medicine) before speaking. Its design showcases an end-to-end AI Engineering pipeline: from raw **PDF ingestion** to creation of **vector embeddings** stored in a vector database and serving clinical queries via a live, responsive web-based chat interface.

.
# Tech Stack: 🛠

| Component | Configuration | Description |
|-----------|---------------|-------------|
| **Embeddings** | all-MiniLM-L6-v2 | a lightweight model that runs efficiently on local hardware during development |
| **LLM Provider** | Groq API | providing a real-time chat experience |
| **Vector Database** | Pinecone | Scalable vector search, Serverless |
| **Orchestration** | LangChain | using LCEL (LangChain Expression Language) for modular, readable chains |
| **Backend Framework** | Flask REST API | A lightweight framework for RESTful API server & template rendering |
.

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
- [Pinecone](https://www.pinecone.io/) API Key
- [Groq](https://groq.com/) API KEY
- [HuggingFace](https://huggingface.co/) API Key


# Quick Start: ⚡
#### 1. Clone the repository
```bash
git clone https://github.com/shahxada20/medical-assistant-chatbot.git
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


# Future Infrastructure Upgradation: ⚙
- **Deployment**
- **UX Re-design**
- **Expand Medical Context**
- **Health Check Endpoint**: Add `/api/health` for monitoring
- **Ingestion Endpoint**: Add `/api/ingest` for dynamic PDF upload
- **Caching Layer**: Redis for query result caching
- **Evaluation Framework**: RAGAS metrics for retrieval/generation quality
- **Authorization**: JWT-based API authentication


**MediAssist** - Clinical AI Infrastructure for Evidence-Based Medical Information Retrieval