from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import fitz  # PyMuPDF
import os
import json
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(api_key=os.getenv("FLASH_API_KEY"))

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

    page_count = doc.page_count
    doc.close()

    return {
        "filename": file.filename,
        "num_pages": page_count,
        "text_preview": extracted_text[:500],
        "full_text_length": len(extracted_text),
        "full_text": extracted_text  # frontend needs this to send onward
    }


class FlashcardRequest(BaseModel):
    text: str


@app.post("/generate-flashcards")
async def generate_flashcards(request: FlashcardRequest):
    prompt = f"""You are creating study flashcards from the text below.
Generate 10 flashcards as a JSON array. Each item must have "question" and "answer" keys only.
Return ONLY valid JSON, no extra commentary, no markdown code fences.

Text:
{request.text[:6000]}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5,
    )

    raw_output = response.choices[0].message.content.strip()

    # Guard against the model wrapping output in ```json fences anyway
    if raw_output.startswith("```"):
        raw_output = raw_output.strip("`")
        raw_output = raw_output.replace("json", "", 1).strip()

    try:
        flashcards = json.loads(raw_output)
    except json.JSONDecodeError:
        return {"error": "Failed to parse AI response", "raw": raw_output}

    return {"flashcards": flashcards}