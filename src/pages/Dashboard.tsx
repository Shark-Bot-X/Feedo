import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Search, X } from "lucide-react";
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

  // Filter feedback based on search query
  const filteredFeedback = searchQuery.trim() 
    ? feedbackList.filter(f => 
        f.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.urgency.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : feedbackList;

  const bugFeedback = filteredFeedback.filter(f => f.category === "bug");
  const featureFeedback = filteredFeedback.filter(f => f.category === "feature");
  const perfFeedback = filteredFeedback.filter(f => f.category === "performance");

  const clearSearch = () => setSearchQuery("");

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
            placeholder="Search by ID, summary, category, or urgency..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 transition-all focus:scale-[1.02]"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-sm text-muted-foreground mt-2">
            Found {filteredFeedback.length} result{filteredFeedback.length !== 1 ? 's' : ''} for "{searchQuery}"
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <CardHeader>
            <CardTitle>Feature Requests</CardTitle>
            <CardDescription>{featureFeedback.length} items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {featureFeedback.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No feature requests found
                </p>
              ) : (
                featureFeedback.slice(0, 2).map((feedback) => (
                  <div 
                    key={feedback.id}
                    onClick={() => openFeedbackDialog(feedback)}
                    className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-all cursor-pointer hover:scale-[1.02]"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{feedback.id}</span>
                      <span className="text-xs text-primary font-medium capitalize">{feedback.urgency}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{feedback.summary}</p>
                  </div>
                ))
              )}
              {featureFeedback.length > 2 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  +{featureFeedback.length - 2} more
                </p>
              )}
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
              {bugFeedback.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No bug reports found
                </p>
              ) : (
                bugFeedback.slice(0, 2).map((feedback) => (
                  <div 
                    key={feedback.id}
                    onClick={() => openFeedbackDialog(feedback)}
                    className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-all cursor-pointer hover:scale-[1.02]"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{feedback.id}</span>
                      <span className="text-xs text-destructive font-medium capitalize">{feedback.urgency}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{feedback.summary}</p>
                  </div>
                ))
              )}
              {bugFeedback.length > 2 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  +{bugFeedback.length - 2} more
                </p>
              )}
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
              {perfFeedback.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No performance items found
                </p>
              ) : (
                perfFeedback.slice(0, 2).map((feedback) => (
                  <div 
                    key={feedback.id}
                    onClick={() => openFeedbackDialog(feedback)}
                    className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-all cursor-pointer hover:scale-[1.02]"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{feedback.id}</span>
                      <span className="text-xs text-primary font-medium capitalize">{feedback.urgency}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{feedback.summary}</p>
                  </div>
                ))
              )}
              {perfFeedback.length > 2 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  +{perfFeedback.length - 2} more
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle>Upload CSV</CardTitle>
          <CardDescription>Upload your feedback data in CSV format</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="flex-1"
              id="csv-upload"
            />
            <Button variant="outline" onClick={() => document.getElementById('csv-upload')?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              Choose File
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;