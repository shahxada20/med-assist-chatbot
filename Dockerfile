# Dockerfile for Medical RAG Chatbot on Hugging Face Spaces
# Uses uv for fast dependency installation

FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    UV_SYSTEM_PYTHON=1

WORKDIR /app

# Install uv
RUN pip install --no-cache-dir uv

# Copy dependency files first for better caching
COPY pyproject.toml uv.lock ./

# Install dependencies using uv (native pyproject.toml support)
RUN uv pip install --system .

# Copy application code
COPY . .

# Create Data directory if it doesn't exist (for PDF storage)
RUN mkdir -p /app/Data

# Expose port (Hugging Face Spaces uses PORT env var, default to 7860)
ENV PORT=7860

# Copy entrypoint script
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:${PORT:-7860}/health', timeout=5)" || exit 1

# Run the entrypoint script
CMD ["/docker-entrypoint.sh"]
