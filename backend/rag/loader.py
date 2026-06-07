"""
loader.py
---------
Handles PDF loading and chunking.
Updated for FastAPI - reads file bytes directly.
"""

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
import tempfile
import os


def load_and_chunk_pdf(uploaded_file) -> list:
    """
    Accepts a FastAPI UploadFile object.
    Returns a list of chunked Document objects.
    """

    # Read raw bytes from the uploaded file
    # FastAPI UploadFile gives us .file which is a SpooledTemporaryFile
    contents = uploaded_file.file.read()
    filename = uploaded_file.filename

    # Save bytes to a real temp file on disk
    # PyPDFLoader needs a file path — it cannot read from memory
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(contents)
        tmp_path = tmp.name

    try:
        # Load PDF pages
        loader = PyPDFLoader(tmp_path)
        pages = loader.load()

        # Tag each page with the original filename for citations
        for page in pages:
            page.metadata["source_filename"] = filename

        # Split pages into overlapping chunks
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=800,
            chunk_overlap=100,
            separators=["\n\n", "\n", ".", " "]
        )
        chunks = splitter.split_documents(pages)

    finally:
        # Always delete the temp file
        os.unlink(tmp_path)

    return chunks


def load_multiple_pdfs(uploaded_files: list) -> list:
    """
    Load and chunk multiple PDF files.
    Returns combined list of chunks from all PDFs.
    """
    all_chunks = []
    for uploaded_file in uploaded_files:
        chunks = load_and_chunk_pdf(uploaded_file)
        all_chunks.extend(chunks)
    return all_chunks