import io
from typing import Tuple, Optional
import pypdf
from fastapi import UploadFile, HTTPException

class PDFExtractionError(Exception):
    pass

class PDFService:
    @staticmethod
    def validate_file(file: UploadFile, max_mb: int = 10) -> None:
        if not file.filename:
            raise HTTPException(status_code=400, detail="Uploaded file has no filename.")
        
        filename_lower = file.filename.lower()
        if not filename_lower.endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files are supported for document upload.")
        
        # Verify content type if provided
        if file.content_type and "pdf" not in file.content_type.lower() and file.content_type != "application/octet-stream":
            raise HTTPException(status_code=400, detail=f"Invalid MIME type '{file.content_type}'. Must be application/pdf.")

    @staticmethod
    def extract_text_from_bytes(file_bytes: bytes, filename: str = "document.pdf") -> Tuple[str, int]:
        """
        Extract text from PDF bytes.
        Returns: (extracted_text, num_pages)
        Raises PDFExtractionError for unreadable, encrypted, or scanned documents.
        """
        if not file_bytes or len(file_bytes) == 0:
            raise PDFExtractionError("The uploaded PDF file is empty (0 bytes).")
        
        try:
            reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        except Exception as e:
            raise PDFExtractionError(f"Malformed or corrupted PDF file: {str(e)}")
        
        if reader.is_encrypted:
            try:
                # Attempt empty password decrypt
                reader.decrypt("")
            except Exception:
                raise PDFExtractionError("The uploaded PDF file is password protected/encrypted. Please provide an unencrypted document.")
        
        num_pages = len(reader.pages)
        if num_pages == 0:
            raise PDFExtractionError("PDF contains no readable pages.")
        
        extracted_pages = []
        for idx, page in enumerate(reader.pages):
            try:
                text = page.extract_text()
                if text:
                    extracted_pages.append(f"--- [Page {idx + 1}] ---\n" + text.strip())
            except Exception:
                continue
        
        full_text = "\n\n".join(extracted_pages).strip()
        
        # Check if PDF is scanned or image-only
        if len(full_text) < 30 and num_pages > 0:
            raise PDFExtractionError(
                f"The document ({num_pages} pages) appears to be an image-only or scanned PDF without digital text. "
                "Optical Character Recognition (OCR) is required before processing. Please provide a digitally rendered PDF or paste the text directly."
            )
        
        return full_text, num_pages
