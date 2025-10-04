import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFeedback } from "@/contexts/FeedbackContext";

const Dashboard = () => {
  const [csvUploaded, setCsvUploaded] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { feedbackList, openFeedbackDialog } = useFeedback();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "text/csv") {
      setCsvUploaded(true);
      toast({
        title: "CSV uploaded successfully",
        description: `Processing ${file.name}...`,
      });
    } else {
      toast({
        title: "Invalid file",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
    }
  };

  const bugFeedback = feedbackList.filter(f => f.category === "bug");
  const featureFeedback = feedbackList.filter(f => f.category === "feature");
  const perfFeedback = feedbackList.filter(f => f.category === "performance");

  return (
    <div className="flex-1 p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your feedback data</p>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by feedback ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 transition-all focus:scale-[1.02]"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <CardHeader>
            <CardTitle>Feature Requests</CardTitle>
            <CardDescription>{featureFeedback.length} items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {featureFeedback.slice(0, 2).map((feedback) => (
                <div 
                  key={feedback.id}
                  onClick={() => openFeedbackDialog(feedback)}
                  className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-all cursor-pointer hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{feedback.id}</span>
                    <span className="text-xs text-primary font-medium capitalize">{feedback.urgency}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{feedback.summary}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <CardHeader>
            <CardTitle>Bug Reports</CardTitle>
            <CardDescription>{bugFeedback.length} items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bugFeedback.slice(0, 2).map((feedback) => (
                <div 
                  key={feedback.id}
                  onClick={() => openFeedbackDialog(feedback)}
                  className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-all cursor-pointer hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{feedback.id}</span>
                    <span className="text-xs text-destructive font-medium capitalize">{feedback.urgency}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{feedback.summary}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <CardHeader>
            <CardTitle>Performance</CardTitle>
            <CardDescription>{perfFeedback.length} items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {perfFeedback.slice(0, 2).map((feedback) => (
                <div 
                  key={feedback.id}
                  onClick={() => openFeedbackDialog(feedback)}
                  className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-all cursor-pointer hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{feedback.id}</span>
                    <span className="text-xs text-primary font-medium capitalize">{feedback.urgency}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{feedback.summary}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
