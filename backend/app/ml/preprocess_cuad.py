import json
import random
from cuad_risk_questions import RISK_KEYWORDS

def is_risky_question(question: str) -> bool:
    q = question.lower()
    return any(k in q for k in RISK_KEYWORDS)


def preprocess_cuad(cuad_path, output_path):
    with open(cuad_path, "r", encoding="utf-8") as f:
        cuad = json.load(f)

    samples = []

    for contract in cuad["data"]:
        for para in contract["paragraphs"]:
            context = para["context"]

            for qa in para["qas"]:
                question = qa["question"]
                answers = qa["answers"]

                # Positive samples
                if answers and is_risky_question(question):
                    for ans in answers:
                        samples.append({
                            "text": ans["text"],
                            "label": 1
                        })

            # Negative samples (random non-risk chunks)
            sentences = context.split(". ")
            random.shuffle(sentences)

            for sent in sentences[:3]:
                samples.append({
                    "text": sent,
                    "label": 0
                })

    random.shuffle(samples)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(samples, f, indent=2)

    print(f"✅ Saved {len(samples)} training samples")

if __name__ == "__main__":
    CUAD_PATH = "data/CUAD_v1/CUAD_v1.json"
    OUTPUT_PATH = "data/cuad_train.json"
    preprocess_cuad(CUAD_PATH, OUTPUT_PATH)
