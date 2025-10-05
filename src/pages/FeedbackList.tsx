import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter, X, List, AlertCircle, CheckCircle2, Clock } from "lucide-react";

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

    return { 
        feedbackList: PERSISTENT_STATE.list, 
        persistentFileName: PERSISTENT_STATE.fileName,
        openFeedbackDialog: (feedback) => console.log("Opening dialog for:", feedback.id), 
    };
};
// --- END: MOCKING useFeedback ---

const FeedbackList = () => {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { feedbackList, openFeedbackDialog } = useFeedback();

  const filteredFeedback = useMemo(() => {
    return feedbackList.filter(item => {
      if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
      if (urgencyFilter !== "all" && item.urgency !== urgencyFilter) return false;
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      return true;
    });
  }, [feedbackList, categoryFilter, urgencyFilter, statusFilter]);

  const resetFilters = () => {
    setCategoryFilter("all");
    setUrgencyFilter("all");
    setStatusFilter("all");
  };

  const hasActiveFilters = categoryFilter !== "all" || urgencyFilter !== "all" || statusFilter !== "all";

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: feedbackList.length,
      critical: feedbackList.filter(f => f.urgency === "critical").length,
      completed: feedbackList.filter(f => f.status === "completed").length,
      ongoing: feedbackList.filter(f => f.status === "ongoing").length,
    };
  }, [feedbackList]);

  return (
    <div className="flex-1 p-8 bg-gradient-to-br from-background via-background to-muted/20 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <List className="w-7 h-7 text-primary" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight">Feedback List</h1>
              </div>
              <p className="text-muted-foreground text-lg">
                Showing {filteredFeedback.length} of {feedbackList.length} items
                {hasActiveFilters && <span className="text-primary font-medium"> (filtered)</span>}
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Total Items</div>
                    <div className="text-2xl font-bold">{stats.total}</div>
                  </div>
                  <List className="w-8 h-8 text-primary/50" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-destructive">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Critical</div>
                    <div className="text-2xl font-bold">{stats.critical}</div>
                  </div>
                  <AlertCircle className="w-8 h-8 text-destructive/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Completed</div>
                    <div className="text-2xl font-bold">{stats.completed}</div>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-500/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Ongoing</div>
                    <div className="text-2xl font-bold">{stats.ongoing}</div>
                  </div>
                  <Clock className="w-8 h-8 text-orange-500/50" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters Card */}
        <Card className="mb-6 shadow-md">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-primary" />
                <CardTitle className="text-xl">Filters</CardTitle>
                {hasActiveFilters && (
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                    Active
                  </span>
                )}
              </div>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-2">
                  <X className="w-4 h-4" />
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Category</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="bug">Bug</SelectItem>
                    <SelectItem value="feature">Feature Request</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="ux">User Experience</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Urgency</label>
                <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Urgency Levels</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="not_started">Not Started</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Grid Card */}
        <Card className="shadow-lg">
          <CardContent className="p-0">
            {filteredFeedback.length === 0 ? (
              <div className="p-12 text-center">
                <Filter className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No items found</h3>
                <p className="text-muted-foreground mb-4">
                  {hasActiveFilters 
                    ? "Try adjusting your filters to see more results" 
                    : "No feedback items available"}
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={resetFilters} className="gap-2">
                    <X className="w-4 h-4" />
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-full">
                  {/* Table Header */}
                  <div className="bg-muted/50 border-b grid grid-cols-[auto_100px_150px_1fr_120px_120px_120px] gap-4 p-4 font-semibold text-sm">
                    <div className="flex items-center">
                      <Checkbox />
                    </div>
                    <div>ID</div>
                    <div>Category</div>
                    <div>Summary</div>
                    <div>Urgency</div>
                    <div>Impact</div>
                    <div>Status</div>
                  </div>
                  
                  {/* Table Body */}
                  <div>
                    {filteredFeedback.map((item, index) => (
                      <div 
                        key={item.id}
                        onClick={() => openFeedbackDialog(item)}
                        className="grid grid-cols-[auto_100px_150px_1fr_120px_120px_120px] gap-4 p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors items-center"
                        style={{
                          animationDelay: `${index * 30}ms`
                        }}
                      >
                        <div onClick={(e) => e.stopPropagation()}>
                          <Checkbox />
                        </div>
                        <div className="font-mono font-semibold text-primary text-sm">{item.id}</div>
                        <div className="capitalize font-medium text-sm">{item.category}</div>
                        <div className="truncate text-sm">{item.summary}</div>
                        <div>
                          <span className={`text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wide whitespace-nowrap inline-block ${
                            item.urgency === "critical" ? "bg-destructive/15 text-destructive ring-1 ring-destructive/20" :
                            item.urgency === "high" ? "bg-orange-500/15 text-orange-500 ring-1 ring-orange-500/20" :
                            item.urgency === "medium" ? "bg-yellow-500/15 text-yellow-600 ring-1 ring-yellow-500/20" :
                            "bg-blue-500/15 text-blue-600 ring-1 ring-blue-500/20"
                          }`}>
                            {item.urgency}
                          </span>
                        </div>
                        <div className="capitalize font-medium text-sm">{item.impact}</div>
                        <div>
                          <span className={`capitalize font-medium text-sm ${
                            item.status === "completed" ? "text-green-600" :
                            item.status === "ongoing" ? "text-orange-500" :
                            "text-muted-foreground"
                          }`}>
                            {item.status.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FeedbackList;