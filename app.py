"""
Flask backend for Medical RAG Chatbot.
Connects HTML/CSS frontend to RAG pipeline logic.
"""

import os
import logging
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv

from src.helper import (
    load_env_var,
    load_embeddings_model,
    get_existing_vector_store,
    initialize_groq_llm,
    system_prompt,
    build_rag_chain,
    DEFAULT_EMBEDDING_MODEL,
    DEFAULT_LLM_MODEL,
    DEFAULT_INDEX_NAME,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Global RAG components (initialized once on startup)
rag_components = {}


def initialize_app():
    """Initialize RAG pipeline components on app startup."""
    try:
        logger.info("Loading environment variables...")
        load_env_var()
        load_dotenv()

        logger.info("Initializing embedding model...")
        embedding = load_embeddings_model(DEFAULT_EMBEDDING_MODEL)

        logger.info("Connecting to Pinecone vector store...")
        vector_store = get_existing_vector_store(
            embedding=embedding,
            index_name=DEFAULT_INDEX_NAME
        )

        logger.info("Initializing Groq LLM...")
        llm = initialize_groq_llm(DEFAULT_LLM_MODEL)

        logger.info("Loading system prompt...")
        prompt = system_prompt()

        logger.info("Building RAG chain...")
        rag_chain = build_rag_chain(vector_store, llm, prompt, k=3)

        rag_components.update({
            "vector_store": vector_store,
            "llm": llm,
            "prompt": prompt,
            "rag_chain": rag_chain
        })

        logger.info("RAG pipeline initialized successfully.")

    except Exception as e:
        logger.error(f"Failed to initialize RAG pipeline: {e}")
        raise


@app.route("/")
def home():
    """Render chat interface."""
    return render_template("chat.html")


@app.route("/get", methods=["POST"])
def get_response():
    """Handle chat messages and return RAG-generated responses."""
    try:
        # Support both JSON and form data
        if request.is_json:
            data = request.get_json()
            user_message = data.get("msg", "").strip() if data else ""
        else:
            user_message = request.form.get("msg", "").strip()

        if not user_message:
            return jsonify({"error": "Empty message"}), 400

        if not rag_components.get("rag_chain"):
            logger.error("RAG chain not initialized")
            return jsonify({"error": "Service unavailable"}), 503

        rag_chain = rag_components["rag_chain"]

        logger.info(f"Processing user query: {user_message[:50]}...")

        response = rag_chain.invoke(user_message)

        logger.info(f"Response generated successfully.")

        # Ensure response is properly formatted for frontend
        if isinstance(response, dict):
            return jsonify(response)
        elif hasattr(response, 'content'):
            return jsonify({"response": response.content})
        else:
            return jsonify({"response": str(response)})

    except Exception as e:
        logger.error(f"Error generating response: {e}")
        return jsonify({"error": "Failed to generate response"}), 500


if __name__ == "__main__":
    initialize_app()
    app.run(debug=True, host="0.0.0.0", port=5000)
