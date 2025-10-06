import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

// REMOVED: import { useFeedback } from "@/contexts/FeedbackContext";
// The useFeedback function is defined below to use the global state.

// --- START: PERSISTENT GLOBAL STATE GUARANTEE (MATCHES Dashboard.jsx) ---
// This pattern guarantees the state object is initialized only ONCE.
(function () {
  if (typeof window.__FEEDBACK_APP_STATE === "undefined") {
    window.__FEEDBACK_APP_STATE = {
      list: [],
      fileName: null,
      updateTrigger: 0,
    };
  }
})();

// Access the guaranteed persistent state object
const PERSISTENT_STATE = window.__FEEDBACK_APP_STATE;
// --- END: PERSISTENT GLOBAL STATE GUARANTEE ---

// --- START: MOCKING useFeedback (MODIFIED FOR PERSISTENT STATE ACCESS) ---
const useFeedback = () => {
  // Local state to track changes in global state (required for React to re-render)
  const [localUpdateTrigger, setLocalUpdateTrigger] = useState(
    PERSISTENT_STATE.updateTrigger
  );

  // The component always returns the current persistent values
  return {
    feedbackList: PERSISTENT_STATE.list,
    persistentFileName: PERSISTENT_STATE.fileName,
    // Mocked function, as this component only reads the data and opens a dialog.
    openFeedbackDialog: (feedback) =>
      console.log("Opening dialog for:", feedback.id),
  };
};
// --- END: MOCKING useFeedback ---

// COLORS for the pie chart segments
const CATEGORY_COLORS = {
  feature: "#FF5733",
  bug: "#C70039",
  performance: "#900C3F",
  ux: "#581845",
  other: "#FFC300",
};

const WeeklyReport = () => {
  const { feedbackList, openFeedbackDialog } = useFeedback();

  // --- START: COMPUTED DATA HOOKS ---

  // 1. Calculate dashboard metrics
  const { totalFeedback, urgentCount, completedCount } = useMemo(() => {
    const total = feedbackList.length;
    const urgent = feedbackList.filter(
      (f) => f.urgency === "critical" || f.urgency === "high"
    ).length;
    const completed = feedbackList.filter(
      (f) => f.status === "completed"
    ).length;
    return {
      totalFeedback: total,
      urgentCount: urgent,
      completedCount: completed,
    };
  }, [feedbackList]);

  // 2. Calculate Category Breakdown Data (Pie Chart)
  const categoryData = useMemo(() => {
    const counts = feedbackList.reduce((acc, item) => {
      const category = item.category.toLowerCase();
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([category, value]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: value,
      color: CATEGORY_COLORS[category] || "#CCCCCC", // Fallback color
      category: category,
    }));
  }, [feedbackList]);

  // 3. Calculate Daily Trend Data (Line Chart)
  const dailyTrendData = useMemo(() => {
    // NOTE: Since the CSV data doesn't have a reliable 'date' or 'day' field,
    // we'll use a simplified mock based on index, or return empty if no data.
    if (feedbackList.length === 0) return [];

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const counts = days.map((day) => ({ day, count: 0 }));

    // Simple distribution based on item ID/index for demo purposes
    feedbackList.forEach((_, index) => {
      const dayIndex = index % 7;
      counts[dayIndex].count++;
    });

    return counts;
  }, [feedbackList]);

  // 4. Get urgent feedback for the bottom card
  const urgentFeedback = useMemo(() => {
    return feedbackList.filter(
      (f) => f.urgency === "critical" || f.urgency === "high"
    );
  }, [feedbackList]);

  // --- END: COMPUTED DATA HOOKS ---

  const handlePieClick = (data) => {
    const categoryFeedback = feedbackList.filter(
      (f) => f.category === data.category
    );
    if (categoryFeedback.length > 0) {
      // Open the dialog with the first item in that category (or a list of items)
      openFeedbackDialog(categoryFeedback[0]);
    }
  };

  return (
    <div className="flex-1 p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Weekly Report</h1>
        <p className="text-muted-foreground">
          Statistics based on {feedbackList.length} items
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <CardDescription>Total Feedback</CardDescription>
            <CardTitle className="text-3xl">{totalFeedback}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>Data Loaded</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <CardDescription>Urgent Issues</CardDescription>
            <CardTitle className="text-3xl text-destructive">
              {urgentCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-red-600">
              <TrendingUp className="w-4 h-4" />
              <span>
                {((urgentCount / totalFeedback) * 100 || 0).toFixed(0)}% of
                total
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-3xl text-primary">
              {completedCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>
                {((completedCount / totalFeedback) * 100 || 0).toFixed(0)}%
                completion rate
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <CardDescription>Avg Response Time</CardDescription>
            <CardTitle className="text-3xl">N/A</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-green-600">
              <TrendingDown className="w-4 h-4" />
              <span>No time data</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle>Daily Feedback Trend</CardTitle>
            <CardDescription>
              Submissions per (Simulated) Day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyTrendData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#FF5733"
                  strokeWidth={3}
                  dot={{ fill: "#FF5733", r: 6 }}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>
              Click on any segment to view a related feedback item
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={1000}
                  onClick={handlePieClick}
                  style={{ cursor: "pointer" }}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle>Top Priority Issues ({urgentFeedback.length})</CardTitle>
          <CardDescription>
            Items requiring immediate attention - Click to view details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {urgentFeedback.slice(0, 3).map((feedback, index) => (
              <div
                key={feedback.id}
                onClick={() => openFeedbackDialog(feedback)}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-all cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex-1">
                  <h4 className="font-medium mb-1">
                    {feedback.id}: {feedback.summary}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {feedback.description}
                  </p>
                </div>
                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    feedback.urgency === "critical"
                      ? "bg-destructive/10 text-destructive animate-pulse-glow"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {feedback.urgency}
                </span>
              </div>
            ))}
            {urgentFeedback.length === 0 && (
              <p className="text-center text-muted-foreground">
                No urgent issues found.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeeklyReport;