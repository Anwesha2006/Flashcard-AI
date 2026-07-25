from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import UploadFile, File
import fitz  # PyMuPDF
app=FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
def read_root():
    
    return {"status":"Flashcard AI backend is running"}
@app.post("/upload-pdf")
async def upload_file(file: UploadFile = File(...)):
 contents=await file.read()
 doc=fitz.open(stream=contents,filetype="pdf")
 extracted_text=""
 for page in doc:
    extracted_text+=page.get_text()
 doc.close()
 return {
    "filename":file.filename,
    "num_pages": doc.count_page if doc else 0,
    "text_preview": extracted_text[:500],
    "full_text_length": len(extracted_text)
 }