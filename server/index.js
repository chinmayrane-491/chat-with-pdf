const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const { GoogleGenAI } = require('@google/genai');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// Guarded embedding function
async function createEmbedding(text) {
  if (!text || !text.trim()) return [];
  const response = await ai.models.embedContent({
    model: 'gemini-embedding-2',
    contents: text
  });
  return response.embeddings[0].values;
}

// Normalized Cosine Similarity
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dotProduct / denom;
}

// In-memory document storage for fast follow-up questions
let currentDocument = {
  filename: null,
  text: '',
  chunks: [],
  chunkEmbeddings: []
};

const upload = multer({ dest: "uploads/" });

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "PDF Q&A Server is running" });
});

// Upload and optionally ask in one request
app.post("/upload", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded" });
    }

    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);
    const text = pdfData.text || "";

    // Clean up temporary uploaded file from disk
    try {
      fs.unlinkSync(req.file.path);
    } catch (e) {
      console.warn("Could not delete temp file:", e.message);
    }

    const chunks = text
      .split('\n\n')
      .map(c => c.trim())
      .filter(c => c.length > 0);

    if (chunks.length === 0) {
      return res.status(400).json({ error: "Could not extract text from this PDF." });
    }

    // Embed all chunks
    const chunkEmbeddings = [];
    for (const chunk of chunks) {
      const emb = await createEmbedding(chunk);
      chunkEmbeddings.push({
        text: chunk,
        embedding: emb
      });
    }

    // Cache current document
    currentDocument = {
      filename: req.file.originalname || "Uploaded Document",
      text,
      chunks,
      chunkEmbeddings
    };

    const question = req.body.question;

    // If no question was provided, provide a quick overview summary
    if (!question || !question.trim()) {
      return res.json({
        success: true,
        message: "PDF uploaded and indexed successfully",
        filename: currentDocument.filename,
        totalChunks: chunks.length,
        answer: `Document "${currentDocument.filename}" has been successfully uploaded and indexed (${chunks.length} sections). Ask any question below to get answers!`
      });
    }

    // Embed question and find best matching chunk
    const questionEmbedding = await createEmbedding(question);
    let bestChunk = chunks[0];
    let bestScore = -Infinity;

    for (const item of chunkEmbeddings) {
      const score = cosineSimilarity(questionEmbedding, item.embedding);
      if (score > bestScore) {
        bestScore = score;
        bestChunk = item.text;
      }
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: `You are an intelligent PDF Q&A assistant. Answer the user's question clearly, accurately, and concisely based strictly on the provided context.\n\nContext:\n${bestChunk}\n\nQuestion:\n${question}`
    });

    res.json({
      success: true,
      answer: response.text,
      bestScore: Number(bestScore.toFixed(4)),
      bestChunk,
      totalChunks: chunks.length,
      filename: currentDocument.filename
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(err.status || 500).json({
      error: err.message ? (typeof err.message === 'string' && err.message.startsWith('{') ? JSON.parse(err.message).error?.message || err.message : err.message) : err.toString()
    });
  }
});

// Follow-up question route using the currently loaded document
app.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ error: "Please provide a question" });
    }

    if (!currentDocument.chunks || currentDocument.chunks.length === 0) {
      return res.status(400).json({ error: "No PDF uploaded yet. Please upload a PDF first." });
    }

    const questionEmbedding = await createEmbedding(question);
    let bestChunk = currentDocument.chunks[0];
    let bestScore = -Infinity;

    for (const item of currentDocument.chunkEmbeddings) {
      const score = cosineSimilarity(questionEmbedding, item.embedding);
      if (score > bestScore) {
        bestScore = score;
        bestChunk = item.text;
      }
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: `You are an intelligent PDF Q&A assistant. Answer the user's question clearly, accurately, and concisely based strictly on the provided context.\n\nContext:\n${bestChunk}\n\nQuestion:\n${question}`
    });

    res.json({
      success: true,
      answer: response.text,
      bestScore: Number(bestScore.toFixed(4)),
      bestChunk,
      filename: currentDocument.filename
    });
  } catch (err) {
    console.error("Ask error:", err);
    res.status(err.status || 500).json({
      error: err.message ? (typeof err.message === 'string' && err.message.startsWith('{') ? JSON.parse(err.message).error?.message || err.message : err.message) : err.toString()
    });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

