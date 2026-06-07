"""
summarizer.py
-------------
Handles topic summarization using RAG + Groq.
Generates chapter summaries, revision notes,
bullet points, and key terms — all from textbook content only.
"""

from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
import os


def get_llm(temperature: float = 0.3):
    return ChatGroq(
        model="llama-3.3-70b-versatile",
        temperature=temperature,
        api_key=os.getenv("GROQ_API_KEY")
    )


SUMMARY_PROMPT = """
You are an AI Tutor. Use ONLY the textbook context below. Do NOT use outside knowledge.
If the topic is not covered, say: "This topic was not found in the textbook."

Context from textbook:
{context}

Write a clear, detailed CHAPTER SUMMARY on the topic: "{topic}"

Structure your summary as:
1. Overview (2-3 sentences introducing the topic)
2. Main Concepts (explain each key idea in a paragraph)
3. Important Details (facts, figures, definitions)
4. Conclusion (1-2 sentences wrapping up)

Be thorough but student-friendly. Use simple language.
"""

REVISION_NOTES_PROMPT = """
You are an AI Tutor. Use ONLY the textbook context below. Do NOT use outside knowledge.
If the topic is not covered, say: "This topic was not found in the textbook."

Context from textbook:
{context}

Create concise REVISION NOTES on the topic: "{topic}"

Format exactly as:
## Key Points
- Point 1
- Point 2
(at least 5 key points)

## Definitions
- Term: Definition

## Important Facts
- Fact 1

## Remember This
- Critical exam tip 1
"""

BULLET_POINTS_PROMPT = """
You are an AI Tutor. Use ONLY the textbook context below. Do NOT use outside knowledge.
If the topic is not covered, say: "This topic was not found in the textbook."

Context from textbook:
{context}

Explain the topic "{topic}" using ONLY bullet points.
- Use simple, clear language
- Group bullets under sub-headings
- Include at least 10 bullet points total
"""

KEY_TERMS_PROMPT = """
You are an AI Tutor. Use ONLY the textbook context below. Do NOT use outside knowledge.
If the topic is not covered, say: "This topic was not found in the textbook."

Context from textbook:
{context}

Extract all KEY TERMS related to "{topic}" from the context.

Format exactly as:
**Term** — Clear definition based strictly on the textbook.

List at least 8 terms. Order from most fundamental to most advanced.
"""


def get_context(retriever, topic: str) -> str:
    """Retrieve relevant chunks for the topic."""
    docs = retriever.invoke(topic)
    return "\n\n".join(doc.page_content for doc in docs)


def generate_summary(retriever, topic: str) -> str:
    """Generate a detailed chapter summary."""
    llm = get_llm(temperature=0.3)
    context = get_context(retriever, topic)
    prompt = PromptTemplate(template=SUMMARY_PROMPT, input_variables=["context", "topic"])
    chain = prompt | llm | StrOutputParser()
    return chain.invoke({"context": context, "topic": topic})


def generate_revision_notes(retriever, topic: str) -> str:
    """Generate structured revision notes."""
    llm = get_llm(temperature=0.2)
    context = get_context(retriever, topic)
    prompt = PromptTemplate(template=REVISION_NOTES_PROMPT, input_variables=["context", "topic"])
    chain = prompt | llm | StrOutputParser()
    return chain.invoke({"context": context, "topic": topic})


def generate_bullet_points(retriever, topic: str) -> str:
    """Generate bullet-point explanation."""
    llm = get_llm(temperature=0.3)
    context = get_context(retriever, topic)
    prompt = PromptTemplate(template=BULLET_POINTS_PROMPT, input_variables=["context", "topic"])
    chain = prompt | llm | StrOutputParser()
    return chain.invoke({"context": context, "topic": topic})


def generate_key_terms(retriever, topic: str) -> str:
    """Extract and define key terms."""
    llm = get_llm(temperature=0.1)
    context = get_context(retriever, topic)
    prompt = PromptTemplate(template=KEY_TERMS_PROMPT, input_variables=["context", "topic"])
    chain = prompt | llm | StrOutputParser()
    return chain.invoke({"context": context, "topic": topic})

