import { useState, useRef, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Loader2,
  MessageSquare,
  Send,
  FileText,
  Copy,
  Check,
  AlertCircle,
  Save,
  Trash2,
  Palette,
  Type,
  Pen,
  Eraser,
  Undo,
  Download,
} from "lucide-react";

// --- START: PERSISTENT GLOBAL STATE GUARANTEE ---
(function () {
  if (typeof window.__FEEDBACK_APP_STATE === "undefined") {
    window.__FEEDBACK_APP_STATE = {
      list: [],
      fileName: null,
      updateTrigger: 0,
    };
  }
  if (typeof window.__FEEDBACK_NOTES === "undefined") {
    window.__FEEDBACK_NOTES = [];
  }
})();

const PERSISTENT_STATE = window.__FEEDBACK_APP_STATE;

// MOCKING useFeedback for access to the persistent state
const useFeedback = () => {
  const [localUpdateTrigger, setLocalUpdateTrigger] = useState(
    PERSISTENT_STATE.updateTrigger
  );
  return {
    feedbackList: PERSISTENT_STATE.list,
    openFeedbackDialog: () => {},
  };
};
// --- END: PERSISTENT GLOBAL STATE GUARANTEE ---

// Initial structure for AI response
const EMPTY_RESPONSE = {
  summary:
    "Click 'Generate Insights' to analyze the loaded feedback data using Google Gemini.",
  suggestions: [],
  patterns: "",
};

// Preset questions to help users
const presetQuestions = [
  "What are the most common user complaints?",
  "Which features are users requesting the most?",
  "What's the overall sentiment of the feedback?",
  "Are there any critical bugs I should prioritize?",
  "How can I improve user satisfaction?",
];

const AIInsights = () => {
  const { feedbackList } = useFeedback();

  const [loading, setLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState(EMPTY_RESPONSE);
  const [notes, setNotes] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm your AI feedback assistant powered by Gemini. I can analyze your feedback data, identify trends, and suggest improvements. Try asking me one of the suggested questions below, or ask your own!",
    },
  ]);
  const [userInput, setUserInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [apiError, setApiError] = useState(null);
  const chatEndRef = useRef(null);
  const [showChat, setShowChat] = useState(true);

  // Notes enhancement states
  const [savedNotes, setSavedNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("text"); // 'text' or 'draw'
  
  // Drawing states
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState("#3b82f6");
  const [drawSize, setDrawSize] = useState(3);
  const [drawTool, setDrawTool] = useState("pen"); // 'pen' or 'eraser'
  const [drawingHistory, setDrawingHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);

  // Load saved notes on mount
  useEffect(() => {
    const stored = window.__FEEDBACK_NOTES || [];
    setSavedNotes(stored);
  }, []);

  // Initialize canvas
  useEffect(() => {
    if (activeTab === "draw" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      
      // Load last drawing if exists
      if (drawingHistory.length > 0 && historyStep >= 0) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
        };
        img.src = drawingHistory[historyStep];
      }
    }
  }, [activeTab]);

  // Prepare context data for the AI only when feedbackList changes
  const preparedFeedbackContext = useMemo(() => {
    if (feedbackList.length === 0) {
      return {
        context:
          "No feedback data is currently loaded. Inform the user they must upload a CSV file.",
        totalCount: 0,
        rawList: [],
      };
    }

    const criticalBugs = feedbackList.filter(
      (f) => f.urgency === "critical" || f.category === "bug"
    ).length;
    const total = feedbackList.length;

    const dataSnippet = feedbackList
      .slice(0, 50)
      .map(
        (f) =>
          `ID:${f.id}, Category:${f.category}, Urgency:${f.urgency}, Status:${
            f.status
          }, Summary:"${f.summary.substring(0, 80).replace(/["\n\r]/g, "")}..."`
      )
      .join("\n");

    const contextString = `
            TOTAL FEEDBACK COUNT: ${total}
            CRITICAL ISSUES (Bugs/Critical Urgency): ${criticalBugs}
            
            **RAW DATA SNIPPET (First 50 items for context):**
            ${dataSnippet}
            
            **TASK:** Analyze the provided raw data snippet and the count metrics to answer the user's question.
        `;

    return {
      context: contextString,
      totalCount: total,
      rawList: feedbackList,
    };
  }, [feedbackList]);

  // Function to call Gemini API
  const callGeminiAPI = async (userQuestion) => {
    if (preparedFeedbackContext.totalCount === 0) {
      throw new Error(
        "Cannot run AI analysis. Please upload a feedback CSV file first."
      );
    }

    try {
      const feedbackContext = preparedFeedbackContext.context;
      const API_URL = "http://localhost:3001";

      console.log("🔗 Connecting to:", `${API_URL}/api/gemini/chat`);

      const response = await fetch(`${API_URL}/api/gemini/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userQuestion,
          feedbackData: feedbackContext,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `API Error: ${response.status} - Make sure backend is running on port 3001`
        );
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("❌ Gemini API Error:", error);
      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError")
      ) {
        throw new Error(
          "Cannot connect to backend server. Please make sure the backend is running on http://localhost:3001."
        );
      }
      throw error;
    }
  };

  const generateInsights = async () => {
    if (preparedFeedbackContext.totalCount === 0) {
      setApiError("Please upload a CSV file before generating AI insights.");
      return;
    }

    setLoading(true);
    setApiError(null);

    try {
      const insightQuestion =
        "Analyze the provided feedback data and return ONLY a detailed summary of key trends, critical issues, and overall user sentiment. Use Markdown formatting for readability, but DO NOT include suggestions or action items in the summary. Keep the response concise but informative.";
      const suggestionQuestion =
        "Based on the data, provide a list of 4-5 clear, actionable suggestions to improve the user experience and address critical issues. Return only a JSON array of strings: ['Suggestion 1', 'Suggestion 2', ...]";

      const aiSummary = await callGeminiAPI(insightQuestion);
      const rawSuggestions = await callGeminiAPI(suggestionQuestion);

      let parsedSuggestions = [];
      try {
        parsedSuggestions = JSON.parse(rawSuggestions);
        if (!Array.isArray(parsedSuggestions)) throw new Error("Not an array");
      } catch {
        parsedSuggestions = [rawSuggestions];
      }

      setCurrentResponse({
        summary: aiSummary,
        suggestions: parsedSuggestions,
        patterns: "",
      });
    } catch (error) {
      setApiError(error.message);
      setCurrentResponse(EMPTY_RESPONSE);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;
    if (preparedFeedbackContext.totalCount === 0) {
      setApiError("Please upload a CSV file before asking questions.");
      return;
    }

    setChatMessages((prev) => [...prev, { role: "user", content: message }]);
    setUserInput("");
    setChatLoading(true);
    setApiError(null);

    try {
      const aiResponse = await callGeminiAPI(message);
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: aiResponse },
      ]);
    } catch (error) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I apologize, but I'm having trouble connecting to the AI service. Please make sure your API is configured correctly. Error: " +
            error.message,
        },
      ]);
      setApiError(error.message);
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

  // Save note function
  const saveNote = () => {
    if (!notes.trim() && activeTab === "text") return;
    
    const newNote = {
      id: Date.now(),
      title: noteTitle.trim() || `Note ${savedNotes.length + 1}`,
      type: activeTab,
      content: activeTab === "text" ? notes : canvasRef.current?.toDataURL(),
      timestamp: new Date().toISOString(),
    };

    const updatedNotes = [newNote, ...savedNotes];
    setSavedNotes(updatedNotes);
    window.__FEEDBACK_NOTES = updatedNotes;
    
    setNotes("");
    setNoteTitle("");
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
    
    if (activeTab === "draw" && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setDrawingHistory([]);
      setHistoryStep(-1);
    }
  };

  // Delete note function
  const deleteNote = (id) => {
    const updatedNotes = savedNotes.filter((note) => note.id !== id);
    setSavedNotes(updatedNotes);
    window.__FEEDBACK_NOTES = updatedNotes;
  };

  // Drawing functions
  const startDrawing = (e) => {
    if (!canvasRef.current) return;
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const ctx = canvasRef.current.getContext("2d");
    
    if (drawTool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = drawSize * 3;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = drawColor;
      ctx.lineWidth = drawSize;
    }
    
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    if (canvasRef.current) {
      const newHistory = drawingHistory.slice(0, historyStep + 1);
      newHistory.push(canvasRef.current.toDataURL());
      setDrawingHistory(newHistory);
      setHistoryStep(newHistory.length - 1);
    }
  };

  const undoDrawing = () => {
    if (historyStep > 0) {
      const newStep = historyStep - 1;
      setHistoryStep(newStep);
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = drawingHistory[newStep];
    }
  };

  const clearCanvas = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setDrawingHistory([]);
      setHistoryStep(-1);
    }
  };

  const downloadNote = (note) => {
    if (note.type === "text") {
      const blob = new Blob([note.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${note.title}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const a = document.createElement("a");
      a.href = note.content;
      a.download = `${note.title}.png`;
      a.click();
    }
  };

  return (
    <div className="min-h-screen bg-white dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3 text-slate-900 dark:text-white">

            AI Insights
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            AI-powered analysis by Google Gemini - Analyzing{" "}
            {preparedFeedbackContext.totalCount} feedback items
          </p>
        </div>

        {/* API Error Alert */}
        {apiError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-800 dark:text-red-200">
                API Connection Issue
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {apiError}
              </p>
              <div className="mt-3 text-xs text-red-600 dark:text-red-400 space-y-1">
                <p className="font-semibold">Setup Checklist:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Backend server running on http://localhost:3001</li>
                  <li>GEMINI_API_KEY set in backend/.env file</li>
                  <li>Dependencies installed: npm install</li>
                  <li>CORS enabled for your frontend URL</li>
                </ul>
                <p className="mt-2">
                  Run:{" "}
                  <code className="bg-red-100 dark:bg-red-900 px-1 rounded">
                    cd backend && npm start
                  </code>
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6">
          {/* Top Section - Insights */}
          <div className="grid gap-6 lg:grid-cols-3">
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
                    disabled={
                      loading || preparedFeedbackContext.totalCount === 0
                    }
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
                  <CardTitle className="text-slate-900 dark:text-white">
                    AI Suggestions
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    Recommended actions based on your data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentResponse.suggestions.length > 0 ? (
                      currentResponse.suggestions.map((suggestion, index) => (
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
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                              {suggestion}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-muted-foreground border-dashed border-2 rounded-lg">
                        Click 'Generate Insights' to receive action items based
                        on your data.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chatbot Column */}
            <div className="space-y-6">
              {/* AI Chatbot */}
              <Card className="hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-700">
                <CardHeader
                  className="cursor-pointer"
                  onClick={() => setShowChat(!showChat)}
                >
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
                            className={`flex ${
                              msg.role === "user"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[85%] rounded-lg px-4 py-2 ${
                                msg.role === "user"
                                  ? "bg-blue-600 text-white"
                                  : "bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              <p className="text-sm whitespace-pre-line">
                                {msg.content}
                              </p>
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
                          onKeyPress={(e) =>
                            e.key === "Enter" &&
                            !chatLoading &&
                            handleSendMessage(userInput)
                          }
                          placeholder="Ask Gemini anything..."
                          className="flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleSendMessage(userInput)}
                          disabled={
                            chatLoading ||
                            !userInput.trim() ||
                            preparedFeedbackContext.totalCount === 0
                          }
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Full Width Notes Section */}
          <div className="mt-6">
            <Card className="hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Notes & Scribbles
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Document insights with text or drawings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Left: Note Creation */}
                  <div>
                    {/* Tab Selector */}
                    <div className="flex gap-2 mb-4">
                      <Button
                        size="sm"
                        variant={activeTab === "text" ? "default" : "outline"}
                        onClick={() => setActiveTab("text")}
                        className="flex-1 gap-2"
                      >
                        <Type className="w-4 h-4" />
                        Text
                      </Button>
                      <Button
                        size="sm"
                        variant={activeTab === "draw" ? "default" : "outline"}
                        onClick={() => setActiveTab("draw")}
                        className="flex-1 gap-2"
                      >
                        <Pen className="w-4 h-4" />
                        Draw
                      </Button>
                    </div>

                    {/* Note Title */}
                    <input
                      type="text"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      placeholder="Note title (optional)"
                      className="w-full mb-3 px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {/* Text Editor */}
                    {activeTab === "text" && (
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add your notes here... (e.g., Action items from the AI analysis)"
                        className="w-full h-96 px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    )}

                    {/* Drawing Canvas */}
                    {activeTab === "draw" && (
                      <div className="space-y-3">
                        {/* Drawing Tools */}
                        <div className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg flex-wrap">
                          <Button
                            size="sm"
                            variant={drawTool === "pen" ? "default" : "outline"}
                            onClick={() => setDrawTool("pen")}
                            className="gap-1"
                          >
                            <Pen className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant={drawTool === "eraser" ? "default" : "outline"}
                            onClick={() => setDrawTool("eraser")}
                            className="gap-1"
                          >
                            <Eraser className="w-3 h-3" />
                          </Button>
                          
                          <div className="h-6 w-px bg-slate-300 dark:bg-slate-600 mx-1"></div>
                          
                          {/* Color Picker */}
                          <div className="flex items-center gap-1">
                            <Palette className="w-3 h-3 text-slate-500" />
                            <input
                              type="color"
                              value={drawColor}
                              onChange={(e) => setDrawColor(e.target.value)}
                              className="w-8 h-8 rounded cursor-pointer border-0"
                            />
                          </div>
                          
                          {/* Size Slider */}
                          <input
                            type="range"
                            min="1"
                            max="20"
                            value={drawSize}
                            onChange={(e) => setDrawSize(Number(e.target.value))}
                            className="w-20"
                          />
                          <span className="text-xs text-slate-500 w-6">{drawSize}px</span>
                          
                          <div className="h-6 w-px bg-slate-300 dark:bg-slate-600 mx-1"></div>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={undoDrawing}
                            disabled={historyStep <= 0}
                            className="gap-1"
                          >
                            <Undo className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={clearCanvas}
                            className="gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>

                        {/* Canvas */}
                        <canvas
                          ref={canvasRef}
                          width={500}
                          height={400}
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          className="w-full border-2 border-slate-200 dark:border-slate-600 rounded-lg bg-white cursor-crosshair"
                          style={{ touchAction: "none" }}
                        />
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {activeTab === "text" ? `${notes.length} characters` : "Draw your notes"}
                      </span>
                      <div className="flex gap-2">
                        {activeTab === "text" && (
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
                                Copy
                              </>
                            )}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={saveNote}
                          disabled={activeTab === "text" ? !notes.trim() : false}
                          className="gap-2 bg-blue-600 hover:bg-blue-700"
                        >
                          {noteSaved ? (
                            <>
                              <Check className="w-4 h-4" />
                              Saved!
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              Save Note
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Right: Saved Notes */}
                  <div>
                    {savedNotes.length > 0 ? (
                      <div>
                        <h3 className="text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">
                          Saved Notes ({savedNotes.length})
                        </h3>
                        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                          {savedNotes.map((note) => (
                            <div
                              key={note.id}
                              className="p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:shadow-md transition-all"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm text-slate-900 dark:text-white flex items-center gap-2">
                                    {note.type === "text" ? (
                                      <Type className="w-3 h-3 text-blue-600" />
                                    ) : (
                                      <Pen className="w-3 h-3 text-purple-600" />
                                    )}
                                    {note.title}
                                  </h4>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {new Date(note.timestamp).toLocaleString()}
                                  </p>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => downloadNote(note)}
                                    className="h-7 w-7 p-0"
                                  >
                                    <Download className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => deleteNote(note.id)}
                                    className="h-7 w-7 p-0 hover:text-red-600"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              {note.type === "text" ? (
                                <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap line-clamp-3">
                                  {note.content}
                                </p>
                              ) : (
                                <img
                                  src={note.content}
                                  alt={note.title}
                                  className="w-full rounded border border-slate-200 dark:border-slate-600"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full min-h-[400px] border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                        <div className="text-center text-slate-500 dark:text-slate-400">
                          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p className="text-sm font-medium">No saved notes yet</p>
                          <p className="text-xs mt-1">Create a text or drawing note to get started</p>
                        </div>
                      </div>
                    )}
                  </div>
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