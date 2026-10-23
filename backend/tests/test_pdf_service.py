import os
import pytest
from fastapi import HTTPException
from backend.app.services.pdf_service import PDFService, PDFExtractionError

def test_empty_pdf_bytes_raises_error():
    with pytest.raises(PDFExtractionError) as exc_info:
        PDFService.extract_text_from_bytes(b"", "empty.pdf")
    assert "empty" in str(exc_info.value).lower()

def test_corrupted_pdf_bytes_raises_error():
    with pytest.raises(PDFExtractionError) as exc_info:
        PDFService.extract_text_from_bytes(b"NOT A REAL PDF CONTENT", "corrupt.pdf")
    assert "malformed or corrupted" in str(exc_info.value).lower()

def test_extract_valid_sample_pdf():
    pdf_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
        "fictional_sample_data",
        "API_Batch_402_Impurity_Investigation_Report.pdf"
    )
    if not os.path.exists(pdf_path):
        pytest.skip("Demonstration PDF not generated yet.")

    with open(pdf_path, "rb") as f:
        file_bytes = f.read()

    text, num_pages = PDFService.extract_text_from_bytes(file_bytes, "demo.pdf")
    assert num_pages >= 1
    assert "ORYVEX" in text
    assert "Artemicort" in text or "ART-2026-042" in text or "Impurity" in text
