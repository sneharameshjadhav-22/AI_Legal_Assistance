from app.utils.clause_segmenter import segment_clauses
from app.documents.pdf_parser import extract_text_from_pdf

pdf_path = "data/uploaded_documents/Legal-Services-Agreement.pdf"

text = extract_text_from_pdf(pdf_path)
clauses = segment_clauses(text)

print("Total clauses found:", len(clauses))
print("\n--- SAMPLE CLAUSE ---\n")
print(clauses[0])
