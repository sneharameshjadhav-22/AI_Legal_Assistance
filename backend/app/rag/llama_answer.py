# import requests

# OLLAMA_URL = "http://localhost:11434/api/generate"
# OLLAMA_MODEL = "llama3:latest"

# class LlamaAnswerGenerator:
#     def answer(self, question: str, context: str) -> str:
#         prompt = f"""
# You are an AI legal assistant helping users understand a contract.

# STRICT RULES:
# - Use ONLY the information in the context below.
# - Answer the QUESTION directly.
# - Do NOT summarize the whole contract unless asked.
# - Do NOT repeat the context verbatim.
# - If the answer is NOT clearly stated, reply EXACTLY:
#   "The document does not mention this."

# Context:
# {context}

# Question:
# {question}

# Answer (2–4 sentences, simple English):
# """

#         try:
#             response = requests.post(
#                 OLLAMA_URL,
#                 json={
#                     "model": OLLAMA_MODEL,
#                     "prompt": prompt,
#                     "stream": False,
#                     "temperature": 0.2,        # 🔥 keeps answers focused
#                     "top_p": 0.9,
#                     "num_predict": 180         # 🔥 prevents rambling
#                 },
#                 timeout=90
#             )

#             response.raise_for_status()
#             data = response.json()

#             answer = data.get("response", "").strip()

#             # ✅ FINAL SAFETY GUARD (but not aggressive)
#             if not answer or len(answer.split()) < 6:
#                 return "The document does not mention this."

#             # ❌ Kill generic fallback-style answers
#             bad_phrases = [
#                 "based on the document",
#                 "the following clauses are relevant",
#                 "this part of the contract"
#             ]

#             if any(p in answer.lower() for p in bad_phrases):
#                 return "The document does not mention this."

#             return answer

#         except requests.exceptions.Timeout:
#             print("❌ Ollama timeout")
#             return "The document does not mention this."

#         except requests.exceptions.ConnectionError:
#             print("❌ Ollama not reachable")
#             return "The document does not mention this."

#         except Exception as e:
#             print("❌ Ollama error:", e)
#             return "The document does not mention this."
import requests
import os

API_KEY = os.getenv("OPENROUTER_API_KEY")

class LlamaAnswerGenerator:

    def answer(self, question: str, context: str) -> str:

        prompt = f"""
You are an AI legal assistant.

Use ONLY the contract context below.

Answer the user's question clearly in simple English.

If the answer is not found in context, reply exactly:

The document does not mention this.

Context:
{context}

Question:
{question}

Answer:
"""

        url = "https://openrouter.ai/api/v1/chat/completions"

        headers = {
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json"
        }

        data = {
            "model": "mistralai/mixtral-8x7b-instruct",
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.2,
            "max_tokens": 220
        }

        try:
            response = requests.post(
                url,
                headers=headers,
                json=data,
                timeout=20
            )

            if response.status_code != 200:
                print("ERROR:", response.text)
                return "The document does not mention this."

            result = response.json()

            answer = result["choices"][0]["message"]["content"].strip()

            if not answer:
                return "The document does not mention this."

            return answer

        except Exception as e:
            print("EXCEPTION:", e)
            return "The document does not mention this."
        