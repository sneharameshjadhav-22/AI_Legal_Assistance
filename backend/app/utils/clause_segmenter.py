import re

def normalize_text(text: str) -> str:
    """
    Clean and normalize extracted PDF text.
    """
    # Replace multiple spaces/newlines with single space
    text = re.sub(r'\s+', ' ', text)

    # Remove space before punctuation
    text = re.sub(r'\s([?.!,])', r'\1', text)

    return text.strip()

CLAUSE_PATTERN = re.compile(
    r'(?:^|\s)'
    r'('
    r'(?:\d+\.)+'          # 1. or 1.1 or 2.3.4
    r'|SECTION\s+\d+'      # SECTION 1
    r'|ARTICLE\s+\d+'      # ARTICLE 2
    r')'
    r'\s*',
    re.IGNORECASE
)

def split_into_raw_clauses(text: str):
    """
    Split text based on legal clause markers.
    """
    matches = list(CLAUSE_PATTERN.finditer(text))
    clauses = []

    for i in range(len(matches)):
        start = matches[i].start()

        if i + 1 < len(matches):
            end = matches[i + 1].start()
        else:
            end = len(text)

        clause_text = text[start:end].strip()
        clauses.append(clause_text)

    return clauses
def clean_clauses(clauses, min_length=50):
    """
    Remove invalid or too-short clauses.
    """
    cleaned = []

    for clause in clauses:
        if len(clause) >= min_length:
            cleaned.append(clause)

    return cleaned


def segment_clauses(text: str):
    """
    Full legal clause segmentation pipeline.
    """
    normalized_text = normalize_text(text)
    raw_clauses = split_into_raw_clauses(normalized_text)
    clean_clause_list = clean_clauses(raw_clauses)

    return clean_clause_list
