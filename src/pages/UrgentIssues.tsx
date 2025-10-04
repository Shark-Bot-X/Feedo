import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle } from "lucide-react";
import { useFeedback } from "@/contexts/FeedbackContext";

const UrgentIssues = () => {
  const { feedbackList, openFeedbackDialog } = useFeedback();
  const urgentFeedback = feedbackList.filter(f => f.urgency === "critical" || f.urgency === "high");

  return (
    <div className="flex-1 p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <AlertCircle className="w-8 h-8 text-destructive" />
            Urgent Issues
          </h1>
          <p className="text-muted-foreground">High priority items requiring immediate attention</p>
        </div>
        <Button>Mark selected as complete</Button>
      </div>

      <div className="space-y-4">
        {urgentFeedback.map((feedback) => (
          <Card 
            key={feedback.id}
            className={`border-l-4 cursor-pointer hover:shadow-lg transition-all ${
              feedback.urgency === "critical" ? "border-l-destructive" : "border-l-primary"
            }`}
            onClick={() => openFeedbackDialog(feedback)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Checkbox className="mt-1" onClick={(e) => e.stopPropagation()} />
                  <div>
                    <CardTitle className="text-lg">{feedback.id}: {feedback.summary}</CardTitle>
                    <CardDescription className="mt-1">
                      {feedback.description}
                    </CardDescription>
                  </div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                  feedback.urgency === "critical" 
                    ? "bg-destructive/10 text-destructive" 
                    : "bg-primary/10 text-primary"
                }`}>
                  {feedback.urgency}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Category:</span>
                  <span className="ml-2 font-medium capitalize">{feedback.category}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Impact:</span>
                  <span className="ml-2 font-medium capitalize">{feedback.impact}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <span className="ml-2 font-medium capitalize">{feedback.status.replace("_", " ")}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UrgentIssues;
