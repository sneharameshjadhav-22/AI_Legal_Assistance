from app.documents.pdf_parser import extract_text_from_pdf

pdf_path = "data/uploaded_documents/Legal-Services-Agreement.pdf"

text = extract_text_from_pdf(pdf_path)

print("Extraction successful ✅")
print("Text length:", len(text))
print("\n--- SAMPLE TEXT ---\n")
print(text[:1000])
