import ollama
import json
from typing import List, Union, Generator
from knowledge_store import MarqoKnowledgeStore

def answer(user_input: str, mks: MarqoKnowledgeStore, limit: int = 5) -> str:
    context = mks.query_for_content(user_input, "text", limit)

    sources = "\n".join(f"[{i+1}] {source}" for i, source in enumerate(context))
    
    messages = [
        {
            "role": "user",
            "content": f"""
                {sources}
                Q: {user_input}
                A:"""
        }
    ]
    response = ollama.chat(model = "llama3.2", messages=messages)["message"]["content"]
    return response