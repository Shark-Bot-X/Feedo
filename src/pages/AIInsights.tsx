import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";

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

const AIInsights = () => {
  const [loading, setLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState(mockResponses[0]);
  const [notes, setNotes] = useState("");

  const generateInsights = () => {
    setLoading(true);
    setTimeout(() => {
      setCurrentResponse(mockResponses[0]);
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="flex-1 p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-primary" />
          AI Insights
        </h1>
        <p className="text-muted-foreground">AI-powered analysis of your feedback</p>
      </div>

      <div className="grid gap-6">
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary animate-pulse-glow" />
                Summary
              </CardTitle>
              <CardDescription>AI-generated overview of your feedback</CardDescription>
            </div>
            <Button
              onClick={generateInsights}
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate New Insights
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
                <div className="h-4 bg-muted rounded w-4/6"></div>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none animate-fade-in">
                <p className="text-foreground leading-relaxed">{currentResponse.summary}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle>AI Suggestions</CardTitle>
            <CardDescription>Recommended actions based on your data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentResponse.suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-all cursor-pointer animate-fade-in hover:scale-[1.02]"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">{index + 1}</span>
                    </div>
                    <p className="text-sm text-foreground">{suggestion}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIInsights;
