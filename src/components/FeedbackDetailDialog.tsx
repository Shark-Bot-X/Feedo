import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useFeedback } from "@/contexts/FeedbackContext";

export function FeedbackDetailDialog() {
  const { selectedFeedback, setSelectedFeedback } = useFeedback();

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "bg-destructive text-destructive-foreground";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "low":
        return "bg-blue-500 text-white";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      bug: "Bug",
      feature: "Feature Request",
      performance: "Performance",
      ux: "User Experience",
      other: "Other"
    };
    return labels[category] || category;
  };

  if (!selectedFeedback) return null;

  return (
    <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">
                {selectedFeedback.id}: {selectedFeedback.summary}
              </DialogTitle>
              <DialogDescription>
                {selectedFeedback.description || "No additional details available."}
              </DialogDescription>
            </div>
            <Badge className={getUrgencyColor(selectedFeedback.urgency)}>
              {selectedFeedback.urgency}
            </Badge>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Category</h4>
            <p className="text-sm">{getCategoryLabel(selectedFeedback.category)}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Status</h4>
            <p className="text-sm capitalize">{selectedFeedback.status.replace("_", " ")}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Impact</h4>
            <p className="text-sm capitalize">{selectedFeedback.impact}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Date</h4>
            <p className="text-sm">{selectedFeedback.date || "N/A"}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
