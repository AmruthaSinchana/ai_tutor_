"""
embeddings.py
-------------
Handles HuggingFace embeddings and FAISS vector store.
Unchanged from original — works with FastAPI too.
"""

from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings


# Cached embedding model — loaded once, reused
_embedding_model = None


def get_embedding_model() -> HuggingFaceEmbeddings:
    """Load and cache the HuggingFace embedding model."""
    global _embedding_model
    if _embedding_model is None:
        _embedding_model = HuggingFaceEmbeddings(
            model_name="all-MiniLM-L6-v2",
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True}
        )
    return _embedding_model


def build_vectorstore(chunks: list) -> FAISS:
    """
    Build a FAISS vector store from document chunks.
    Embeds every chunk and indexes them for similarity search.
    """
    embeddings = get_embedding_model()
    vectorstore = FAISS.from_documents(chunks, embeddings)
    return vectorstore


def get_retriever(vectorstore: FAISS, k: int = 5):
    """
    Returns a retriever from the FAISS vector store.
    k = number of chunks to retrieve per query.
    """
    return vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": k}
    )