import express from "express";
import cors from "cors";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const port = process.env.PORT || 10000; // Render uses port 10000 by default
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error("OPENAI_API_KEY is required. Please set it in Render environment variables");
  process.exit(1);
}

// CORS configuration for production
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173', 
    'https://web-demo-tan-three.vercel.app', // Replace with your actual Vercel domain
    'https://yourdomain.com' // Replace with your custom domain
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    message: 'LangPal server is running on Render',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Status endpoint for compatibility
app.get('/api/status', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    message: 'LangPal server is running on Render',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// API route for token generation
app.get('/api/token', async (req, res) => {
  try {
    // Get voice and language preferences from query parameters
    const voice = req.query.voice || "verse";
    const language = req.query.language || "english";
    
    console.log(`Generating token with voice: ${voice}, language: ${language}`);
    
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      return res.status(response.status).json({ 
        error: `OpenAI API error: ${response.status} ${response.statusText}` 
      });
    }

    const data = await response.json();
    console.log("Token generated successfully");
    
    res.status(200).json(data);
  } catch (error) {
    console.error("Token generation error:", error);
    res.status(500).json({ 
      error: "Failed to generate token",
      details: error.message 
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'LangPal API Server',
    status: 'running',
    endpoints: {
      health: '/health',
      status: '/api/status',
      token: '/api/token'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    message: `Route ${req.originalUrl} not found` 
  });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`LangPal server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`Health check: http://localhost:${port}/health`);
  console.log(`Make sure OPENAI_API_KEY is set in environment variables`);
});