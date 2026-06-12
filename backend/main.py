"""
main.py
-------
FastAPI backend for AI Tutor React app.
Run with: uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI, UploadFile, File, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv
import asyncio
import json
import os
import numpy as np

load_dotenv()

from rag.loader import load_multiple_pdfs
from rag.embeddings import build_vectorstore, get_retriever
from rag.qa_chain import build_qa_chain
from rag.quiz import generate_mcq, generate_short_answer, generate_fill_in_the_blank, calculate_score
from rag.summarizer import generate_summary, generate_revision_notes, generate_bullet_points, generate_key_terms
from rag.video_recommender import search_youtube_videos

from auth import (
    init_db,
    get_user,
    verify_password,
    create_user,
    list_users,
    delete_user,
    create_session,
    validate_token,
    revoke_token,
)

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(title="AI Tutor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    init_db()
    print("[startup] SQLite auth DB ready.")

# ── In-memory state ───────────────────────────────────────────────────────────
state = {
    "vectorstore":   None,
    "retriever":     None,
    "qa_chain":      None,
    "uploaded_pdfs": [],
    "chat_history":  []
}

# ── Request models ────────────────────────────────────────────────────────────
class QuestionRequest(BaseModel):
    question: str

class QuizRequest(BaseModel):
    topic: str
    quiz_type: str
    num_questions: int = 5

class ScoreRequest(BaseModel):
    questions: list
    user_answers: list
    quiz_type: str

class SummarizeRequest(BaseModel):
    topic: str
    summary_type: str

class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    password: str

# ── Helper ────────────────────────────────────────────────────────────────────
def check_ready():
    if state["retriever"] is None:
        raise HTTPException(
            status_code=400,
            detail="No PDF processed yet. Please upload a PDF first."
        )

# ══════════════════════════════════════════════════════════════════════════════
# AUTH ROUTES
# ══════════════════════════════════════════════════════════════════════════════

@app.post("/register")
def register(req: RegisterRequest):
    """Register a new student from the UI."""
    if not req.username.strip() or not req.password.strip():
        raise HTTPException(400, "Username and password are required.")
    ok = create_user(req.username.strip(), req.password)
    if not ok:
        raise HTTPException(400, f"Username '{req.username}' already exists.")
    return {"success": True, "username": req.username.strip()}

@app.post("/login")
def login(req: LoginRequest):
    """Login and return a session token."""
    user = get_user(req.username)
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(401, "Invalid username or password.")
    token = create_session(req.username)
    # FIX: added role field so frontend doesn't get undefined
    return {"success": True, "username": req.username, "token": token, "role": "student"}

@app.post("/logout")
def logout(authorization: Optional[str] = Header(None)):
    """Revoke session token."""
    if authorization and authorization.startswith("Bearer "):
        revoke_token(authorization[7:])
    return {"success": True}

@app.get("/users")
def get_users():
    """List all registered students."""
    return {"users": list_users()}

@app.delete("/users/{username}")
def remove_user(username: str):
    """Delete a student account."""
    delete_user(username)
    return {"success": True}

# ══════════════════════════════════════════════════════════════════════════════
# CORE ROUTES
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/")
def root():
    return {
        "status":      "running",
        "pdfs_loaded": len(state["uploaded_pdfs"]),
        "ready":       state["retriever"] is not None
    }

@app.get("/status")
def get_status():
    return {
        "ready":      state["retriever"] is not None,
        "pdfs":       state["uploaded_pdfs"],
        "chat_count": len(state["chat_history"])
    }

# ── Upload ────────────────────────────────────────────────────────────────────
@app.post("/upload")
async def upload_pdf(files: List[UploadFile] = File(...)):
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")

    all_chunks    = []
    uploaded_names = []

    for file in files:
        if not file.filename.endswith(".pdf"):
            raise HTTPException(status_code=400, detail=f"{file.filename} is not a PDF")
        try:
            chunks = load_multiple_pdfs([file])
            all_chunks.extend(chunks)
            uploaded_names.append(file.filename)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing {file.filename}: {str(e)}")

    try:
        vectorstore    = build_vectorstore(all_chunks)
        retriever      = get_retriever(vectorstore)
        rag_chain, ret = build_qa_chain(retriever)

        state["vectorstore"]   = vectorstore
        state["retriever"]     = retriever
        state["qa_chain"]      = (rag_chain, retriever)
        state["uploaded_pdfs"] = uploaded_names
        state["chat_history"]  = []

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error building index: {str(e)}")

    return {
        "success": True,
        "message": f"Successfully processed {len(files)} PDF(s)",
        "files":   uploaded_names,
        "chunks":  len(all_chunks)
    }

# ── Chunks ────────────────────────────────────────────────────────────────────
@app.get("/chunks")
def get_chunks():
    """Export all indexed chunks with text, metadata and embedding vectors."""
    if state["vectorstore"] is None:
        raise HTTPException(400, "No PDF processed yet.")
    try:
        vs          = state["vectorstore"]
        docstore    = vs.docstore
        index_to_id = vs.index_to_docstore_id
        faiss_index = vs.index
        n, dim      = faiss_index.ntotal, faiss_index.d

        all_vecs = np.zeros((n, dim), dtype=np.float32)
        faiss_index.reconstruct_n(0, n, all_vecs)

        chunks = []
        for idx in range(n):
            doc_id = index_to_id.get(idx)
            doc    = docstore.search(doc_id) if doc_id else None
            chunks.append({
                "index":        idx,
                "id":           doc_id,
                "page_content": doc.page_content if doc else "",
                "metadata":     doc.metadata     if doc else {},
                "vector":       all_vecs[idx].tolist(),
                "vector_dim":   dim,
            })
        return {"total": len(chunks), "vector_dim": dim, "pdfs": state["uploaded_pdfs"], "chunks": chunks}
    except Exception as e:
        raise HTTPException(500, f"Error extracting chunks: {str(e)}")

# ── Chat streaming ────────────────────────────────────────────────────────────
@app.post("/chat/stream")
async def chat_stream(request: QuestionRequest):
    check_ready()

    async def generate():
        try:
            rag_chain, retriever = state["qa_chain"]

            sources = retriever.invoke(request.question)
            formatted_sources = [
                {
                    "page":     int(src.metadata.get("page", 0)) + 1,
                    "filename": src.metadata.get("source_filename", "Unknown"),
                    "preview":  src.page_content[:250].replace("\n", " ").strip()
                }
                for src in sources
            ]

            yield f"data: {json.dumps({'type': 'sources', 'data': formatted_sources})}\n\n"

            full_answer = ""
            for chunk in rag_chain.stream(request.question):
                full_answer += chunk
                yield f"data: {json.dumps({'type': 'token', 'data': chunk})}\n\n"
                await asyncio.sleep(0)

            yield f"data: {json.dumps({'type': 'done', 'data': full_answer})}\n\n"

            state["chat_history"].append({
                "question": request.question,
                "answer":   full_answer,
                "sources":  formatted_sources
            })

        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'data': str(e)})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"}
    )

# ── Chat history ──────────────────────────────────────────────────────────────
@app.get("/chat/history")
def get_history():
    return {"history": state["chat_history"]}

@app.delete("/chat/history")
def clear_history():
    state["chat_history"] = []
    return {"success": True}

# ── Quiz ──────────────────────────────────────────────────────────────────────
@app.post("/quiz/generate")
async def generate_quiz(request: QuizRequest):
    check_ready()
    if not request.topic.strip():
        raise HTTPException(status_code=400, detail="Topic cannot be empty")
    try:
        retriever = state["retriever"]
        if request.quiz_type == "MCQ":
            questions = generate_mcq(retriever, request.topic, request.num_questions)
        elif request.quiz_type == "Short Answer":
            questions = generate_short_answer(retriever, request.topic, request.num_questions)
        elif request.quiz_type == "Fill in the Blank":
            questions = generate_fill_in_the_blank(retriever, request.topic, request.num_questions)
        else:
            raise HTTPException(status_code=400, detail=f"Unknown quiz type: {request.quiz_type}")

        return {
            "success":   True,
            "quiz_type": request.quiz_type,
            "topic":     request.topic,
            "questions": questions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/quiz/score")
async def score_quiz(request: ScoreRequest):
    try:
        return calculate_score(request.questions, request.user_answers, request.quiz_type)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── Summarize ─────────────────────────────────────────────────────────────────
@app.post("/summarize")
async def summarize(request: SummarizeRequest):
    check_ready()
    if not request.topic.strip():
        raise HTTPException(status_code=400, detail="Topic cannot be empty")
    try:
        retriever = state["retriever"]
        if request.summary_type == "summary":
            output = generate_summary(retriever, request.topic)
        elif request.summary_type == "revision":
            output = generate_revision_notes(retriever, request.topic)
        elif request.summary_type == "bullets":
            output = generate_bullet_points(retriever, request.topic)
        elif request.summary_type == "keyterms":
            output = generate_key_terms(retriever, request.topic)
        else:
            raise HTTPException(status_code=400, detail=f"Unknown summary type: {request.summary_type}")

        return {
            "success":      True,
            "topic":        request.topic,
            "summary_type": request.summary_type,
            "content":      output
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── Videos ────────────────────────────────────────────────────────────────────
@app.post("/videos")
async def videos(request: dict):
    topic  = request.get("topic", "")
    result = search_youtube_videos(topic)
    return {"videos": result}