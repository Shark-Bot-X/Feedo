const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();

// server.js (Required Fix)
// ...
// Enable CORS for your React app
app.use(cors({
  origin: 'http://localhost:8080', // <-- FIX: Changed port from 3000 to 8080
  credentials: true
}));
// ...

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    geminiConfigured: !!process.env.GEMINI_API_KEY 
  });
});

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/gemini/chat', async (req, res) => {
  try {
    console.log('📩 Received request:', req.body);

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured in .env file');
    }

    const { question, feedbackData } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Get the Gemini model
// server.js (Required Fix)
// ...
// Get the Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }); // <-- FIX: Use a current model
// ...
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
  console.log(`🚀 Gemini API Server running on http://localhost:${PORT}`);
  console.log(`✅ API Key configured: ${process.env.GEMINI_API_KEY ? 'YES ✓' : 'NO ✗'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log('🚀 ===============================================');
});