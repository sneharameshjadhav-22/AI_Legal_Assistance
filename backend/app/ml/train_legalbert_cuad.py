import torch
from transformers.training_args import TrainingArguments

from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    Trainer,
    TrainingArguments
)
from dataset import load_dataset

MODEL_NAME = "nlpaueb/legal-bert-base-uncased"
OUTPUT_DIR = "legalbert-cuad-risk"

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

# ✅ FIXED PATH
X_train, X_val, y_train, y_val = load_dataset("data/cuad_train.json")

def tokenize(texts):
    return tokenizer(
        texts,
        padding=True,
        truncation=True,
        max_length=512
    )

train_enc = tokenize(X_train)
val_enc = tokenize(X_val)

class ClauseDataset(torch.utils.data.Dataset):
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels = labels

    def __getitem__(self, idx):
        item = {k: torch.tensor(v[idx]) for k, v in self.encodings.items()}
        item["labels"] = torch.tensor(self.labels[idx])
        return item

    def __len__(self):
        return len(self.labels)

train_ds = ClauseDataset(train_enc, y_train)
val_ds = ClauseDataset(val_enc, y_val)

model = AutoModelForSequenceClassification.from_pretrained(
    MODEL_NAME,
    num_labels=2
)

args = TrainingArguments(
    output_dir=OUTPUT_DIR,
    learning_rate=2e-5,
    per_device_train_batch_size=4,
    num_train_epochs=1,
    logging_steps=50,
    report_to="none"
)


trainer = Trainer(
    model=model,
    args=args,
    train_dataset=train_ds,
    eval_dataset=val_ds
)

trainer.train()

model.save_pretrained(OUTPUT_DIR)
tokenizer.save_pretrained(OUTPUT_DIR)

print("✅ Fine-tuned LegalBERT saved")
