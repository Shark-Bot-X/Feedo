import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, MessageSquare, Send, FileText, Copy, Check, AlertCircle } from "lucide-react";

const mockResponses = [
  {
    summary: "Your feedback shows a strong trend toward feature requests (35%) with login and dark mode being the most requested. Critical bugs account for 28% and need immediate attention. User satisfaction is moderate at 68%, with performance concerns being the primary pain point.",
    suggestions: [
      "Prioritize fixing the critical login page crash (#BUG-001)",
      "Consider implementing dark mode in the next sprint",
      "Improve page load times to address performance concerns",
      "Set up automated responses for common feature requests"
    ],
    patterns: "Common themes: 45% of users mention 'slow performance', 32% request 'better UI/UX', 28% report 'login issues'"
  },
];

// Preset questions to help users
const presetQuestions = [
  "What are the most common user complaints?",
  "Which features are users requesting the most?",
  "What's the overall sentiment of the feedback?",
  "Are there any critical bugs I should prioritize?",
  "How can I improve user satisfaction?",
];

const AIInsights = () => {
  const [loading, setLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState(mockResponses[0]);
  const [notes, setNotes] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", content: "Hello! I'm your AI feedback assistant powered by Gemini. I can analyze your feedback data, identify trends, and suggest improvements. Try asking me one of the suggested questions below, or ask your own!" }
  ]);
  const [userInput, setUserInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [apiError, setApiError] = useState(null);
  const chatEndRef = useRef(null);
  const [showChat, setShowChat] = useState(true);

  // Function to call Gemini API
  const callGeminiAPI = async (userQuestion) => {
    try {
      // Create a compressed summary of feedback data to send to Gemini
      const feedbackContext = {
        summary: currentResponse.summary,
        suggestions: currentResponse.suggestions,
        patterns: currentResponse.patterns,
        totalFeedback: "Sample feedback analysis data"
      };

      // Backend API URL - MUST point to your backend server
      const API_URL = 'http://localhost:3001';
      
      console.log('🔗 Connecting to:', `${API_URL}/api/gemini/chat`);
      console.log('📤 Sending question:', userQuestion);

      const response = await fetch(`${API_URL}/api/gemini/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: userQuestion,
          feedbackData: feedbackContext
        })
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.status} - Make sure backend is running on port 3001`);
      }

      const data = await response.json();
      console.log('✅ Received response from Gemini');
      return data.response;
    } catch (error) {
      console.error('❌ Gemini API Error:', error);
      
      // Provide helpful error message
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('Cannot connect to backend server. Please make sure:\n1. Backend server is running (npm start in backend folder)\n2. Server is listening on http://localhost:3001\n3. Check the terminal for any backend errors');
      }
      
      throw error;
    }
  };

  const generateInsights = async () => {
    setLoading(true);
    setApiError(null);
    
    try {
      const insightQuestion = "Please analyze this feedback data and provide a comprehensive summary highlighting key trends, critical issues, and overall user sentiment.";
      const aiSummary = await callGeminiAPI(insightQuestion);
      
      // You can parse the AI response or use it directly
      setCurrentResponse({
        ...currentResponse,
        summary: aiSummary
      });
    } catch (error) {
      setApiError("Failed to generate insights. Please check your API connection.");
      // Fallback to mock data
      setCurrentResponse(mockResponses[0]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;
    
    setChatMessages(prev => [...prev, { role: "user", content: message }]);
    setUserInput("");
    setChatLoading(true);
    setApiError(null);
    
    try {
      const aiResponse = await callGeminiAPI(message);
      setChatMessages(prev => [...prev, { role: "assistant", content: aiResponse }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I apologize, but I'm having trouble connecting to the AI service. Please make sure your API is configured correctly. Error: " + error.message 
      }]);
      setApiError("API connection failed");
    } finally {
      setChatLoading(false);
    }
  };

  const handlePresetQuestion = (question) => {
    handleSendMessage(question);
    setShowChat(true);
  };

  const copyNotes = () => {
    navigator.clipboard.writeText(notes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3 text-slate-900 dark:text-white">
            <Sparkles className="w-8 h-8 text-blue-600" />
            AI Insights
          </h1>
          <p className="text-slate-600 dark:text-slate-400">AI-powered analysis by Google Gemini</p>
        </div>

        {/* API Error Alert */}
        {apiError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-800 dark:text-red-200">API Connection Issue</h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{apiError}</p>
              <div className="mt-3 text-xs text-red-600 dark:text-red-400 space-y-1">
                <p className="font-semibold">Setup Checklist:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Backend server running on http://localhost:3001</li>
                  <li>GEMINI_API_KEY set in backend/.env file</li>
                  <li>Dependencies installed: npm install</li>
                  <li>CORS enabled for your frontend URL</li>
                </ul>
                <p className="mt-2">Run: <code className="bg-red-100 dark:bg-red-900 px-1 rounded">cd backend && npm start</code></p>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Insights */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                    <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
                    AI Summary
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    Gemini-powered overview of your feedback
                  </CardDescription>
                </div>
                <Button
                  onClick={generateInsights}
                  disabled={loading}
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Insights
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/6"></div>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {currentResponse.summary}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">AI Suggestions</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Recommended actions based on your data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentResponse.suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 transition-all cursor-pointer hover:scale-[1.02] hover:shadow-md"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                            {index + 1}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{suggestion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Chatbot & Notes */}
          <div className="space-y-6">
            {/* AI Chatbot */}
            <Card className="hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-700">
              <CardHeader className="cursor-pointer" onClick={() => setShowChat(!showChat)}>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  Gemini Assistant
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Ask questions about your feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Preset Questions */}
                <div className="mb-4 space-y-2">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Quick Questions:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {presetQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handlePresetQuestion(question)}
                        className="text-xs hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400 border-slate-200 dark:border-slate-700"
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Chat Messages */}
                {showChat && (
                  <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-800">
                    <div className="h-64 overflow-y-auto mb-4 space-y-3 scrollbar-thin">
                      {chatMessages.map((msg, index) => (
                        <div
                          key={index}
                          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-lg px-4 py-2 ${
                              msg.role === "user"
                                ? "bg-blue-600 text-white"
                                : "bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-line">{msg.content}</p>
                          </div>
                        </div>
                      ))}
                      {chatLoading && (
                        <div className="flex justify-start">
                          <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && !chatLoading && handleSendMessage(userInput)}
                        placeholder="Ask Gemini anything..."
                        className="flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSendMessage(userInput)}
                        disabled={chatLoading || !userInput.trim()}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes Section */}
            <Card className="hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Notes
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Document your insights and action items
                </CardDescription>
              </CardHeader>
              <CardContent>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add your notes here...

Example:
- Follow up on login bug with dev team
- Schedule dark mode for Q2
- Review performance metrics weekly"
                  className="w-full h-64 px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {notes.length} characters
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyNotes}
                    className="gap-2 hover:bg-blue-50 dark:hover:bg-blue-900"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Notes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;