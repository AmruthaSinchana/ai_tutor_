"""
qa_chain.py
-----------
Builds the RAG question-answering chain using Groq (Llama 3).
Uses strict anti-hallucination prompt.
Updated to use LCEL (LangChain Expression Language).
"""

from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
import os


# Strict anti-hallucination prompt
RAG_PROMPT_TEMPLATE = """
You are an AI Tutor. Answer ONLY using the provided textbook context below.
If the answer is not present in the context, say:
"I could not find this in the textbook."

Do not make up information. Do not use outside knowledge.
Be clear, concise, and student-friendly.

Context:
{context}

Question:
{question}

Answer:
"""


def format_docs(docs):
    """Join retrieved document chunks into one string."""
    return "\n\n".join(doc.page_content for doc in docs)


def build_qa_chain(retriever):
    """
    Builds and returns a RAG chain using LCEL.
    Returns: (rag_chain, retriever) tuple
    """
    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        temperature=0.2,
        api_key=os.getenv("GROQ_API_KEY")
    )

    prompt = PromptTemplate(
        template=RAG_PROMPT_TEMPLATE,
        input_variables=["context", "question"]
    )

    # LCEL pipeline
    rag_chain = (
        {
            "context": retriever | format_docs,
            "question": RunnablePassthrough()
        }
        | prompt
        | llm
        | StrOutputParser()
    )

    return rag_chain, retriever