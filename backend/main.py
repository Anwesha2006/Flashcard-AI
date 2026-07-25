from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import fitz  # PyMuPDF

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "Flashcard AI backend is running"}

@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    contents = await file.read()
    doc = fitz.open(stream=contents, filetype="pdf")

    extracted_text = ""
    for page in doc:
        extracted_text += page.get_text()

    page_count = doc.page_count  # read this BEFORE closing
    doc.close()

    return {
        "filename": file.filename,
        "num_pages": page_count,
        "text_preview": extracted_text[:500],
        "full_text_length": len(extracted_text)
    }