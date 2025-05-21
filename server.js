import express from "express";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;
const apiKey = process.env.OPENAI_API_KEY;

// Setup Socket.IO for conversation tracking
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Store active sessions and conversation history
const sessions = new Map();

// Configure Vite middleware for React client
const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: "custom",
});
app.use(vite.middlewares);
app.use(express.json());

// Socket.IO connection handling for conversation tracking
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Create a new session
  sessions.set(socket.id, {
    id: socket.id,
    createdAt: new Date(),
    conversation: []
  });
  
  // Listen for conversation updates from the client
  socket.on('conversation-update', (message) => {
    const session = sessions.get(socket.id);
    if (session) {
      // Add the message to the conversation history
      session.conversation.push(message);
      console.log(`Conversation updated for session ${socket.id}`);
    }
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    // Store or process conversation before removing (optional)
    const session = sessions.get(socket.id);
    if (session && session.conversation.length > 0) {
      // Here you could store the conversation in a database
      console.log(`Conversation ended with ${session.conversation.length} exchanges`);
    }
    
    sessions.delete(socket.id);
  });
});

// API route for token generation
app.get("/token", async (req, res) => {
  try {
    // Get voice and language preferences from query parameters
    const voice = req.query.voice || "verse";
    const language = req.query.language || "english";
    
    // Create the session with OpenAI
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
          options: {
            language: language
          }
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

// API endpoint to get conversation history
app.get("/api/conversation/:sessionId", (req, res) => {
  const sessionId = req.params.sessionId;
  const session = sessions.get(sessionId);
  
  if (session) {
    res.json({ conversation: session.conversation });
  } else {
    res.status(404).json({ error: "Session not found" });
  }
});

// Render the React client
app.use("*", async (req, res, next) => {
  const url = req.originalUrl;

  try {
    const template = await vite.transformIndexHtml(
      url,
      fs.readFileSync("./client/index.html", "utf-8"),
    );
    const { render } = await vite.ssrLoadModule("./client/entry-server.jsx");
    const appHtml = await render(url);
    const html = template.replace(`<!--ssr-outlet-->`, appHtml?.html);
    res.status(200).set({ "Content-Type": "text/html" }).end(html);
  } catch (e) {
    vite.ssrFixStacktrace(e);
    next(e);
  }
});

// Start server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});