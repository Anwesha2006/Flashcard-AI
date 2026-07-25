# Flashcard AI

A polished, responsive study companion that turns learning material into focused flashcard decks. The interface is built around a soft purple gradient theme with a clear, low-distraction study flow.

## What's included

- Landing page with hero, learning workflow, pricing, and footer
- Navigation for **Home**, **Upload**, **My Decks**, and **Review**
- Upload screen for preparing a document, notes, or topic for card generation
- Deck library with sample decks and quick access to study mode
- Interactive review card that flips to reveal the answer
- Login and sign-up screens
- Demo profile state shown after logging in or creating an account
- Responsive layout for desktop and mobile

## Tech stack

- React 19
- TypeScript
- Vite
- CSS (custom responsive styling; no UI framework required)

## Getting started

### Prerequisites

- Node.js 18 or later
- npm

### Install and run

```bash
cd frontend/flashcard
npm install
npm run dev
```

Open the local address printed by Vite—normally `http://localhost:5173`.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the Vite development server with hot reload. |
| `npm run build` | Type-checks and creates a production build. |
| `npm run preview` | Serves the production build locally. |
| `npm run lint` | Runs ESLint over the project. |

## Project structure

```text
flashcard/
├── src/
│   ├── App.tsx       # Application views, navigation, and demo interactions
│   ├── App.css       # Theme and responsive UI styles
│   ├── index.css     # Global styles
│   └── main.tsx      # React entry point
├── public/           # Static public files
└── package.json      # Scripts and dependencies
```

## Current behavior

The screens are intentionally implemented as a frontend demo. Navigation and authentication are handled in local React state, and the deck data is sample content. The project’s FastAPI service is available separately in `../../backend` and currently provides a basic health endpoint and PDF text extraction endpoint.

To make this production-ready, connect the upload flow to the backend, persist user/deck data, and replace the demo authentication state with a real authentication provider.

## Design direction

The UI takes inspiration from modern AI-creation products: generous whitespace, rounded surfaces, soft blurred color fields, clear typography, and violet-to-pink action gradients. The goal is to make studying feel calm, capable, and approachable.
