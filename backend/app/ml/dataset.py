import json
from sklearn.model_selection import train_test_split

def load_dataset(path):
    with open(path, "r") as f:
        data = json.load(f)

    texts = [d["text"] for d in data]
    labels = [d["label"] for d in data]

    return train_test_split(
        texts,
        labels,
        test_size=0.2,
        random_state=42
    )
