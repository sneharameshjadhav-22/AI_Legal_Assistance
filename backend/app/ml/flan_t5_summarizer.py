import re
import requests

OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "phi3:mini"   # ✅ FAST + CONTROLLED

class LaymanSummarizer:

    def clean_clause(self, text: str) -> str:
        # Remove page numbers
        text = re.sub(r'Page\s+\d+', '', text)

        # Normalize spaces
        text = re.sub(r'\s+', ' ', text).strip()

        # HARD LIMIT length (speed + quality)
        sentences = re.split(r'(?<=\.)\s+', text)
        return " ".join(sentences[:2])  # max 2 sentences input

    def summarize(self, clause_text: str, risk_label: str) -> str:
        clause_text = self.clean_clause(clause_text)

        prompt = f"""
You are a legal assistant.

Explain the legal clause below in simple, plain English
for a person with no legal background.

STRICT RULES:
- Explain ONLY what is written in the clause
- Do NOT add consequences, penalties, timelines, or laws unless stated
- Do NOT mention risk level in the explanation
- Do NOT use phrases like "high risk" or "serious consequences"
- Use 1–2 short sentences only
- Use everyday language

Legal clause:
{clause_text}

Plain English explanation:
"""


        try:
            response = requests.post(
                OLLAMA_URL,
                json={
                    "model": OLLAMA_MODEL,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.1,     # VERY IMPORTANT
                        "num_predict": 80,      # LIMIT output
                        "top_p": 0.9
                    }
                },
                timeout=40   # ⬅️ MUCH LOWER
            )

            response.raise_for_status()
            result = response.json().get("response", "").strip()

            if not result or len(result) < 20:
                return "This clause explains standard legal obligations."

            return result

        except Exception as e:
            print("❌ Ollama summarization error:", e)
            return "Summary unavailable."
