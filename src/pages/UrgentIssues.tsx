import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle } from "lucide-react";
import { useFeedback } from "@/contexts/FeedbackContext";

const UrgentIssues = () => {
  const { feedbackList, openFeedbackDialog, updateFeedbackStatus } = useFeedback();
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [removingIds, setRemovingIds] = useState(new Set());
  
  const urgentFeedback = feedbackList.filter(f => f.urgency === "critical" || f.urgency === "high");

  const handleCheckboxChange = (id) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleMarkComplete = () => {
    if (selectedIds.size === 0) return;

    // Start removal animation
    setRemovingIds(new Set(selectedIds));

    // Wait for animation to complete, then remove items
    setTimeout(() => {
      // Remove items from the list completely
      if (updateFeedbackStatus) {
        Array.from(selectedIds).forEach(id => {
          updateFeedbackStatus(id, null); // null indicates removal
        });
      }
      
      setSelectedIds(new Set());
      setRemovingIds(new Set());
    }, 600);
  };

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
        <Button 
          onClick={handleMarkComplete}
          disabled={selectedIds.size === 0}
        >
          Mark selected as complete {selectedIds.size > 0 && `(${selectedIds.size})`}
        </Button>
      </div>

      <div className="space-y-4">
        {urgentFeedback.map((feedback, index) => {
          const isRemoving = removingIds.has(feedback.id);
          const isSelected = selectedIds.has(feedback.id);
          
          return (
            <Card 
              key={feedback.id}
              style={{
                animationDelay: `${index * 50}ms`
              }}
              className={`border-l-4 cursor-pointer hover:shadow-lg animate-in slide-in-from-bottom-4 fade-in duration-500 ${
                feedback.urgency === "critical" ? "border-l-destructive" : "border-l-primary"
              } ${
                isRemoving 
                  ? "animate-out slide-out-to-left-4 fade-out duration-600" 
                  : ""
              }`}
              onClick={() => openFeedbackDialog(feedback)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div onClick={(e) => e.stopPropagation()}>
                      <Checkbox 
                        className="mt-1" 
                        checked={isSelected}
                        onCheckedChange={() => handleCheckboxChange(feedback.id)}
                      />
                    </div>
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
          );
        })}
      </div>
    </div>
  );
};

export default UrgentIssues;