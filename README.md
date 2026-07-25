# Flashcard AI

Flashcard AI is a full-stack study application with a React frontend and FastAPI backend. It is designed to turn uploaded material and study topics into flashcards, decks, and review sessions.

## Repository layout

```text
Flashcard AI/
+-- frontend/flashcard/  # React + TypeScript + Vite application
`-- backend/             # FastAPI service for document processing
```

## Run the frontend

```bash
cd frontend/flashcard
npm install
npm run dev
```

The frontend is served by Vite, usually at `http://localhost:5173`.

For details about the interface, its features, scripts, and frontend architecture, see the [frontend README](frontend/flashcard/README.md).

## Run the backend

From the project root on Windows:

```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload
```

The API runs at `http://localhost:8000`. Its current endpoints include:

- `GET /` — service status
- `POST /upload-pdf` — extracts text from an uploaded PDF

## Status

The frontend currently uses demo data and local UI state for navigation and authentication. The backend already contains the foundation for PDF extraction; connecting this flow and generating persistent AI flashcards are the next integration steps.
