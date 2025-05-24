import express from "express";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error("OPENAI_API_KEY is required. Please set it in your .env file");
  process.exit(1);
}

// Configure Vite middleware for React client
const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: "custom",
});
app.use(vite.middlewares);
app.use(express.json());

// API route for token generation (matches official implementation)
app.get("/token", async (req, res) => {
  try {
    // Get voice and language preferences from query parameters
    const voice = req.query.voice || "verse";
    const language = req.query.language || "english";
    
    // Create ephemeral session with OpenAI
    const response = await fetch(
      "https://api.openai.com/v1/realtime/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-realtime-preview-2024-12-17",
          voice: voice,
        }),
      },
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Token generation error:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

// Simple endpoint to check if server is running
app.get("/api/status", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Serve static files from the public directory
app.use(express.static('public'));

// Render the React client
app.use("*", async (req, res, next) => {
  const url = req.originalUrl;

  try {
    const template = await vite.transformIndexHtml(
      url,
      fs.readFileSync("index.html", "utf-8"),
    );
    
    res.status(200).set({ "Content-Type": "text/html" }).end(template);
  } catch (e) {
    vite.ssrFixStacktrace(e);
    next(e);
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Open http://localhost:${port} in your browser`);
  console.log(`Make sure OPENAI_API_KEY is set in your .env file`);
});