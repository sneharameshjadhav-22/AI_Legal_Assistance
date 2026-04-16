# import re
# import requests

# OLLAMA_URL = "http://localhost:11434/api/generate"
# OLLAMA_MODEL = "phi3:mini"   # ✅ FAST + CONTROLLED

# class LaymanSummarizer:

#     def clean_clause(self, text: str) -> str:
#         # Remove page numbers
#         text = re.sub(r'Page\s+\d+', '', text)

#         # Normalize spaces
#         text = re.sub(r'\s+', ' ', text).strip()

#         # HARD LIMIT length (speed + quality)
#         sentences = re.split(r'(?<=\.)\s+', text)
#         return " ".join(sentences[:2])  # max 2 sentences input

#     def summarize(self, clause_text: str, risk_label: str) -> str:
#         clause_text = self.clean_clause(clause_text)

#         prompt = f"""
# You are a legal assistant.

# Explain the legal clause below in simple, plain English
# for a person with no legal background.

# STRICT RULES:
# - Explain ONLY what is written in the clause
# - Do NOT add consequences, penalties, timelines, or laws unless stated
# - Do NOT mention risk level in the explanation
# - Do NOT use phrases like "high risk" or "serious consequences"
# - Use 1–2 short sentences only
# - Use everyday language

# Legal clause:
# {clause_text}

# Plain English explanation:
# """


#         try:
#             response = requests.post(
#                 OLLAMA_URL,
#                 json={
#                     "model": OLLAMA_MODEL,
#                     "prompt": prompt,
#                     "stream": False,
#                     "options": {
#                         "temperature": 0.1,     # VERY IMPORTANT
#                         "num_predict": 80,      # LIMIT output
#                         "top_p": 0.9
#                     }
#                 },
#                 timeout=40   # ⬅️ MUCH LOWER
#             )

#             response.raise_for_status()
#             result = response.json().get("response", "").strip()

#             if not result or len(result) < 20:
#                 return "This clause explains standard legal obligations."

#             return result

#         except Exception as e:
#             print("❌ Ollama summarization error:", e)
#             return "Summary unavailable."

import re
import os
import requests
from dotenv import load_dotenv

# Load .env variables
load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")


class LaymanSummarizer:

    def __init__(self):
        self.url = "https://openrouter.ai/api/v1/chat/completions"
        self.model = "mistralai/mixtral-8x7b-instruct"

    def clean_clause(self, text: str) -> str:
        # Remove page numbers
        text = re.sub(r'Page\s+\d+', '', text)

        # Normalize spaces
        text = re.sub(r'\s+', ' ', text).strip()

        # Keep only first 2 sentences
        sentences = re.split(r'(?<=[.!?])\s+', text)
        return " ".join(sentences[:2])[:1200]

    def summarize(self, clause_text: str, risk_label: str) -> str:
        clause_text = self.clean_clause(clause_text)

        prompt = f"""
You are a legal assistant.

Explain this legal clause in plain simple English.

STRICT RULES:
- Explain only what is written
- Use everyday language
- No legal jargon
- No extra assumptions
- 1 or 2 short sentences only

Clause:
{clause_text}

Plain English Explanation:
"""

        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:8080",
            "X-Title": "AI Legal Assistant"
        }

        data = {
            "model": self.model,
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.1,
            "max_tokens": 120
        }

        try:
            response = requests.post(
                self.url,
                headers=headers,
                json=data,
                timeout=25
            )

            if response.status_code != 200:
                print("❌ OpenRouter Status:", response.status_code)
                print("❌ Response:", response.text)
                return "Summary unavailable."

            result = response.json()

            summary = result["choices"][0]["message"]["content"].strip()

            if not summary:
                return "Summary unavailable."

            return summary

        except Exception as e:
            print("❌ OpenRouter error:", e)
            return "Summary unavailable."