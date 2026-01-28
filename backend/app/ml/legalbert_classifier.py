import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# LegalBERT base (we will swap this later with fine-tuned model)
MODEL_NAME = "app/ml/legalbert-cuad-risk"

# Binary classification: risky vs non-risky
NUM_LABELS = 2

class LegalBERTClassifier:
    def __init__(self):
        self.tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        self.model = AutoModelForSequenceClassification.from_pretrained(
            MODEL_NAME,
            num_labels=NUM_LABELS
        )
        self.model.eval()  # inference mode

    def predict(self, text: str):
        """
        Returns risk_score and risk_label
        """
        inputs = self.tokenizer(
            text,
            truncation=True,
            padding=True,
            max_length=512,
            return_tensors="pt"
        )

        with torch.no_grad():
            outputs = self.model(**inputs)
            logits = outputs.logits
            probs = torch.softmax(logits, dim=1)

        risk_score = probs[0][1].item()  # probability of risky
        risk_label = "HIGH" if risk_score >= 0.5 else "LOW"

        return risk_score, risk_label
