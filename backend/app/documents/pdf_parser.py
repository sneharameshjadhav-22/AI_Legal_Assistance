import pdfplumber


def extract_text_from_pdf(file_path: str) -> str:
    """
    Extract text from a text-based PDF file.
    OCR is NOT used here.
    """

    extracted_text = []

    with pdfplumber.open(file_path) as pdf:
        for page_number, page in enumerate(pdf.pages, start=1):
            page_text = page.extract_text()

            if page_text:
                extracted_text.append(page_text)

    # Join all pages into a single string
    full_text = "\n".join(extracted_text)

    return full_text.strip()
