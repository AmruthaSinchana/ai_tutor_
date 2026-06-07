"""
quiz.py
-------
Handles quiz generation using RAG + Groq (Llama 3).
Generates MCQ, Short Answer, and Fill-in-the-Blank questions
strictly from retrieved textbook content.
"""

from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
import os
import json
import re


def get_llm():
    return ChatGroq(
        model="llama-3.3-70b-versatile",
        temperature=0.4,
        api_key=os.getenv("GROQ_API_KEY")
    )


# ── Prompt Templates ──────────────────────────────────────────────────────────

MCQ_PROMPT = """
You are an AI Tutor generating a quiz from textbook content.
Use ONLY the context below. Do NOT use outside knowledge.

Context from textbook:
{context}

Generate exactly {num_questions} multiple choice questions on the topic: "{topic}"

Return ONLY a valid JSON array. No explanation, no markdown, no extra text.
Format:
[
  {{
    "question": "Question text here?",
    "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
    "answer": "A) option1",
    "explanation": "Brief explanation from the textbook context."
  }}
]
"""

SHORT_ANSWER_PROMPT = """
You are an AI Tutor generating a quiz from textbook content.
Use ONLY the context below. Do NOT use outside knowledge.

Context from textbook:
{context}

Generate exactly {num_questions} short answer questions on the topic: "{topic}"

Return ONLY a valid JSON array. No explanation, no markdown, no extra text.
Format:
[
  {{
    "question": "Question text here?",
    "answer": "The expected answer based on the textbook.",
    "hint": "A helpful hint for the student."
  }}
]
"""

FITB_PROMPT = """
You are an AI Tutor generating a quiz from textbook content.
Use ONLY the context below. Do NOT use outside knowledge.

Context from textbook:
{context}

Generate exactly {num_questions} fill-in-the-blank questions on the topic: "{topic}"
Replace the key term or concept with _______.

Return ONLY a valid JSON array. No explanation, no markdown, no extra text.
Format:
[
  {{
    "question": "The _______ is responsible for...",
    "answer": "exact missing word or phrase",
    "hint": "A helpful hint for the student."
  }}
]
"""


def parse_json_response(raw: str) -> list:
    """Safely parse JSON from LLM output."""
    raw = re.sub(r"```json|```", "", raw).strip()
    match = re.search(r'\[.*\]', raw, re.DOTALL)
    if match:
        return json.loads(match.group())
    raise ValueError("No valid JSON array found in LLM response.")


def get_context_for_topic(retriever, topic: str) -> str:
    """Retrieve relevant textbook chunks for the topic."""
    docs = retriever.invoke(topic)
    return "\n\n".join(doc.page_content for doc in docs)


def generate_mcq(retriever, topic: str, num_questions: int = 5) -> list:
    """Generate Multiple Choice Questions."""
    llm = get_llm()
    context = get_context_for_topic(retriever, topic)
    prompt = PromptTemplate(
        template=MCQ_PROMPT,
        input_variables=["context", "topic", "num_questions"]
    )
    chain = prompt | llm | StrOutputParser()
    raw = chain.invoke({"context": context, "topic": topic, "num_questions": num_questions})
    return parse_json_response(raw)


def generate_short_answer(retriever, topic: str, num_questions: int = 5) -> list:
    """Generate Short Answer Questions."""
    llm = get_llm()
    context = get_context_for_topic(retriever, topic)
    prompt = PromptTemplate(
        template=SHORT_ANSWER_PROMPT,
        input_variables=["context", "topic", "num_questions"]
    )
    chain = prompt | llm | StrOutputParser()
    raw = chain.invoke({"context": context, "topic": topic, "num_questions": num_questions})
    return parse_json_response(raw)


def generate_fill_in_the_blank(retriever, topic: str, num_questions: int = 5) -> list:
    """Generate Fill-in-the-Blank Questions."""
    llm = get_llm()
    context = get_context_for_topic(retriever, topic)
    prompt = PromptTemplate(
        template=FITB_PROMPT,
        input_variables=["context", "topic", "num_questions"]
    )
    chain = prompt | llm | StrOutputParser()
    raw = chain.invoke({"context": context, "topic": topic, "num_questions": num_questions})
    return parse_json_response(raw)


def calculate_score(questions: list, user_answers: list, quiz_type: str) -> dict:
    """Compare user answers against correct answers."""
    correct = 0
    results = []

    for i, (q, user_ans) in enumerate(zip(questions, user_answers)):
        correct_ans = q["answer"].strip().lower()
        user_ans_clean = (user_ans or "").strip().lower()

        if quiz_type == "MCQ":
            is_correct = user_ans_clean.startswith(correct_ans[0].lower())
        else:
            is_correct = correct_ans in user_ans_clean or user_ans_clean in correct_ans

        if is_correct:
            correct += 1

        results.append({
            "question": q["question"],
            "user_answer": user_ans or "No answer",
            "correct_answer": q["answer"],
            "is_correct": is_correct,
            "explanation": q.get("explanation", q.get("hint", ""))
        })

    total = len(questions)
    percentage = round((correct / total) * 100, 1) if total > 0 else 0

    return {
        "correct": correct,
        "total": total,
        "percentage": percentage,
        "results": results
    }