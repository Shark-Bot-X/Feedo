import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, CheckCircle2 } from "lucide-react";

// --- START: PERSISTENT GLOBAL STATE GUARANTEE (MATCHES Dashboard.jsx) ---
(function() {
    if (typeof window.__FEEDBACK_APP_STATE === 'undefined') {
        window.__FEEDBACK_APP_STATE = {
            list: [],
            fileName: null,
            updateTrigger: 0,
        };
    }
})();

const PERSISTENT_STATE = window.__FEEDBACK_APP_STATE;
// --- END: PERSISTENT GLOBAL STATE GUARANTEE ---

// --- START: MOCKING useFeedback (MODIFIED FOR PERSISTENT STATE ACCESS) ---
const useFeedback = () => {
    const [localUpdateTrigger, setLocalUpdateTrigger] = useState(PERSISTENT_STATE.updateTrigger);
    
    const updateFeedbackStatus = (id, newStatus) => {
        if (newStatus === null) {
            PERSISTENT_STATE.list = PERSISTENT_STATE.list.filter(f => f.id !== id);
        } else {
            PERSISTENT_STATE.list = PERSISTENT_STATE.list.map(f => f.id === id ? { ...f, status: newStatus } : f);
        }

        PERSISTENT_STATE.updateTrigger += 1;
        setLocalUpdateTrigger(PERSISTENT_STATE.updateTrigger);
    };

    return { 
        feedbackList: PERSISTENT_STATE.list, 
        persistentFileName: PERSISTENT_STATE.fileName,
        openFeedbackDialog: (feedback) => console.log("Opening dialog for:", feedback.id),
        updateFeedbackStatus
    };
};
// --- END: MOCKING useFeedback ---

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

    setRemovingIds(new Set(selectedIds));

    setTimeout(() => {
      if (updateFeedbackStatus) {
        Array.from(selectedIds).forEach(id => {
          updateFeedbackStatus(id, null);
        });
      }
      
      setSelectedIds(new Set());
      setRemovingIds(new Set());
    }, 600);
  };

  return (
    <div className="flex-1 p-8 bg-gradient-to-br from-background via-background to-muted/20 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <AlertCircle className="w-7 h-7 text-destructive" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight">Urgent Issues</h1>
              </div>
              <p className="text-muted-foreground text-lg">
                High priority items requiring immediate attention
              </p>
            </div>
            <Button 
              onClick={handleMarkComplete}
              disabled={selectedIds.size === 0}
              size="lg"
              className="gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark Complete {selectedIds.size > 0 && `(${selectedIds.size})`}
            </Button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-destructive">
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Critical Issues</div>
                <div className="text-2xl font-bold">
                  {urgentFeedback.filter(f => f.urgency === "critical").length}
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground mb-1">High Priority</div>
                <div className="text-2xl font-bold">
                  {urgentFeedback.filter(f => f.urgency === "high").length}
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-muted">
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Selected</div>
                <div className="text-2xl font-bold">{selectedIds.size}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Feedback List */}
        {urgentFeedback.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <CheckCircle2 className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">All Clear!</h3>
              <p className="text-muted-foreground">No urgent issues at the moment</p>
            </CardContent>
          </Card>
        ) : (
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
                  className={`border-l-4 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.01] animate-in slide-in-from-bottom-4 fade-in ${
                    feedback.urgency === "critical" ? "border-l-destructive hover:border-l-destructive/80" : "border-l-primary hover:border-l-primary/80"
                  } ${
                    isSelected ? "bg-accent/50 shadow-lg" : ""
                  } ${
                    isRemoving 
                      ? "animate-out slide-out-to-left-4 fade-out duration-600" 
                      : ""
                  }`}
                  onClick={() => openFeedbackDialog(feedback)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div onClick={(e) => e.stopPropagation()} className="pt-1">
                          <Checkbox 
                            checked={isSelected}
                            onCheckedChange={() => handleCheckboxChange(feedback.id)}
                            className="w-5 h-5"
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <CardTitle className="text-xl font-semibold leading-tight">
                            {feedback.id}: {feedback.summary}
                          </CardTitle>
                          <CardDescription className="text-base leading-relaxed">
                            {feedback.description}
                          </CardDescription>
                        </div>
                      </div>
                      <span className={`text-xs px-4 py-1.5 rounded-full font-semibold uppercase tracking-wide whitespace-nowrap ${
                        feedback.urgency === "critical" 
                          ? "bg-destructive/15 text-destructive ring-1 ring-destructive/20" 
                          : "bg-primary/15 text-primary ring-1 ring-primary/20"
                      }`}>
                        {feedback.urgency}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-6 text-sm">
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">Category</div>
                        <div className="font-semibold capitalize text-base">{feedback.category}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">Impact</div>
                        <div className="font-semibold capitalize text-base">{feedback.impact}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">Status</div>
                        <div className="font-semibold capitalize text-base">{feedback.status.replace("_", " ")}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UrgentIssues;