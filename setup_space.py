"""
Setup script for Hugging Face Spaces deployment.
Runs the ETL pipeline to index PDFs into Pinecone.
"""

import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    """Run the ETL pipeline to index medical PDFs."""
    logger.info("Starting ETL pipeline for Pinecone index...")

    # Check for required API keys
    pinecone_key = os.environ.get("PINECONE_API_KEY")
    groq_key = os.environ.get("GROQ_API_KEY")

    if not pinecone_key:
        logger.error("PINECONE_API_KEY not found in environment variables")
        return False

    if not groq_key:
        logger.error("GROQ_API_KEY not found in environment variables")
        return False

    logger.info("API keys found, proceeding with ETL...")

    # Run the ETL pipeline
    try:
        from store_index import build_index
        result = build_index()
        logger.info(f"ETL pipeline completed successfully!")
        logger.info(f"Indexed {result['document_count']} documents into {result['chunk_count']} chunks.")
        return True
    except Exception as e:
        logger.error(f"ETL pipeline failed: {e}")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
