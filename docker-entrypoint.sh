#!/bin/bash
set -e

echo "🚀 Starting Medical RAG Chatbot..."

# Set default PORT if not provided
export PORT=${PORT:-7860}

# Check if vector store already exists
if [ -z "$SKIP_ETL" ]; then
    echo "📚 Checking Pinecone index status..."
    # Run ETL pipeline to ensure index exists
    python setup_space.py || echo "⚠️  ETL pipeline skipped or failed - may need manual run"
fi

echo "🌐 Starting Flask server on port $PORT..."
exec python -c "import os; from app import app, initialize_app; initialize_app(); app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 7860)), debug=False)"
