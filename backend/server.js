const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();

// CORS configuration - Allow all origins in production, specific in dev
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [process.env.FRONTEND_URL, 'https://feedo-frontend.onrender.com']
  : ['http://localhost:8080', 'http://localhost:5173'];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/gemini/chat', async (req, res) => {
  try {
    console.log('📩 Received request:', req.body);

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const { question, feedbackData } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    // Create prompt with feedback data
    const prompt = `You are an AI feedback analyst assistant. Here is the feedback data:

FEEDBACK SUMMARY:
${feedbackData?.summary || 'No summary available'}

PATTERNS IDENTIFIED:
${feedbackData?.patterns || 'No patterns available'}

CURRENT SUGGESTIONS:
${feedbackData?.suggestions?.join('\n') || 'No suggestions available'}

USER QUESTION: ${question}

Provide a helpful, detailed, and actionable answer based on the feedback data. Be specific and reference the data when relevant. Keep responses concise but informative.`;

    console.log('🤖 Calling Gemini API...');
    
    // Generate response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Gemini responded successfully');

    res.json({ response: text });

  } catch (error) {
    console.error('❌ Gemini API Error:', error);
    res.status(500).json({ 
      error: 'Failed to get AI response',
      message: error.message,
      details: error.toString()
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('🚀 ===============================================');
  console.log(`🚀 Gemini API Server running on port ${PORT}`);
  console.log(`✅ API Key configured: ${process.env.GEMINI_API_KEY ? 'YES ✓' : 'NO ✗'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('🚀 ===============================================');
});