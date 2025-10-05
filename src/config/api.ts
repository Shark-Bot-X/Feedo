// API Configuration for Feedo
const getApiBaseUrl = () => {
  // In production (deployed), use environment variable
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || '';
  }
  // In development, use localhost
  return 'http://localhost:5000';
};

const getGeminiApiUrl = () => {
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_GEMINI_API_URL || '';
  }
  return 'http://localhost:3001';
};

export const API_BASE_URL = getApiBaseUrl();
export const GEMINI_API_URL = getGeminiApiUrl();

export const API_ENDPOINTS = {
  // Flask Backend (feedback_processor.py)
  ANALYZE_CSV: `${API_BASE_URL}/api/analyze-csv`,
  HEALTH_CHECK: `${API_BASE_URL}/api/health`,
  KEYWORDS: `${API_BASE_URL}/api/keywords`,
  
  // Node.js Backend (server.js)
  GEMINI_CHAT: `${GEMINI_API_URL}/api/gemini/chat`,
  GEMINI_HEALTH: `${GEMINI_API_URL}/api/health`,
};

export default { API_BASE_URL, GEMINI_API_URL, API_ENDPOINTS };