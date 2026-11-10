# 📄 Chat with PDF — Intelligent AI Q&A Assistant

An interactive, full-stack **Chat with PDF** application powered by **Google Gemini AI**, semantic vector embeddings (`gemini-embedding-2`), and Normalized Cosine Similarity (RAG).

Upload any PDF document and chat with it in real-time — the AI retrieves the most relevant context and answers your questions with high accuracy!

---

## ✨ Features

- 📑 **Drag & Drop PDF Upload**: Smooth file dropzone with validation (supports PDFs up to 10MB).
- 🤖 **Interactive Chatbot Experience**: Real-time conversation stream with animated **"AI-Bot is typing..."** indicator.
- 🧠 **Semantic Vector Search (RAG)**: Uses Google's `gemini-embedding-2` model to break PDFs into chunks and find the exact context via cosine similarity.
- ⚡ **Powered by Gemini 3.5 Flash**: Lightning-fast, accurate responses formatted in clean Markdown.
- ☀️ / 🌙 **Dark & Light Mode**: Seamless theme toggle with modern glassmorphism styling.
- 📋 **One-Click Copy**: Easily copy AI responses to your clipboard.
- 💡 **Smart Suggestions**: Quick prompt chips to get answers instantly.
- 🔄 **Document Caching**: Upload a document once and ask multiple continuous questions without re-uploading.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Lucide Icons, Marked, Custom Glassmorphic CSS
- **Backend**: Node.js, Express, Multer, pdf-parse, CORS, Dotenv
- **AI & Embeddings**: `@google/genai` (Gemini 3.5 Flash & Gemini Embedding 2)

---

## 📁 Project Structure

```text
chat-with-pdf/
├── .gitignore               # Root git ignore
├── package.json             # Root scripts
├── README.md                # Documentation
├── server/
│   ├── index.js             # Express API, embeddings & Gemini integration
│   ├── package.json         # Backend dependencies
│   ├── .env.example         # Template for environment variables
│   ├── .env                 # (Ignored) Local environment config
│   └── uploads/             # Temporary uploads directory (.gitkeep)
└── frontend/
    ├── src/
    │   ├── App.jsx          # Chatbot UI, state & API calls
    │   ├── index.css        # Glassmorphic styles, Dark & Light theme
    │   └── main.jsx         # Entry point
    ├── index.html           # HTML template
    ├── package.json         # Frontend dependencies
    └── vite.config.js       # Vite configuration
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- A **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/app/apikey)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/chat-with-pdf.git
cd chat-with-pdf
```

---

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:
```bash
cp .env.example .env
```

Open `server/.env` and add your Gemini API key:
```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
PORT=5001
```

Start the backend server:
```bash
node index.js
```
> The backend will be running at `http://localhost:5001`.

---

### 3. Frontend Setup

In a new terminal window:

```bash
cd frontend
npm install
npm run dev
```
> The frontend will be running at `http://localhost:5173`.

Open **`http://localhost:5173`** in your browser, upload a PDF, and start chatting!

---

## 🔒 Security & Environment Variables

- Never commit your actual `GEMINI_API_KEY` to GitHub.
- The repository `.gitignore` automatically ignores `.env` files in all directories.
- Always use `.env.example` as a template for team members or deployment.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
