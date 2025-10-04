import { createContext, useContext, useState, ReactNode } from "react";

export interface Feedback {
  id: string;
  category: "bug" | "feature" | "performance" | "ux" | "other";
  summary: string;
  urgency: "critical" | "high" | "medium" | "low";
  impact: "high" | "medium" | "low";
  status: "completed" | "ongoing" | "not_started";
  description?: string;
  date?: string;
}

interface FeedbackContextType {
  feedbackList: Feedback[];
  selectedFeedback: Feedback | null;
  setSelectedFeedback: (feedback: Feedback | null) => void;
  openFeedbackDialog: (feedback: Feedback) => void;
  filterByCategory: (category: string) => void;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

const mockFeedbackData: Feedback[] = [
  {
    id: "#BUG-001",
    category: "bug",
    summary: "Login page crash",
    urgency: "critical",
    impact: "high",
    status: "not_started",
    description: "Critical bug affecting user authentication. Users report frequent crashes when attempting to log in with Google OAuth.",
    date: "2025-01-02"
  },
  {
    id: "#FR-001",
    category: "feature",
    summary: "Dark mode support",
    urgency: "high",
    impact: "medium",
    status: "ongoing",
    description: "Users have requested dark mode support for better viewing experience during nighttime usage.",
    date: "2025-01-03"
  },
  {
    id: "#PERF-001",
    category: "performance",
    summary: "Slow page load",
    urgency: "high",
    impact: "high",
    status: "not_started",
    description: "Dashboard takes 5+ seconds to load on initial visit. Performance optimization needed.",
    date: "2025-01-01"
  },
  {
    id: "#FR-002",
    category: "feature",
    summary: "Bulk export feature",
    urgency: "medium",
    impact: "medium",
    status: "not_started",
    description: "Allow users to export multiple feedback items as CSV or PDF format.",
    date: "2025-01-04"
  },
  {
    id: "#BUG-002",
    category: "bug",
    summary: "Data sync issues",
    urgency: "high",
    impact: "medium",
    status: "ongoing",
    description: "Data synchronization problems between devices causing inconsistent state.",
    date: "2025-01-02"
  },
  {
    id: "#UX-001",
    category: "ux",
    summary: "Confusing navigation",
    urgency: "medium",
    impact: "medium",
    status: "not_started",
    description: "Users find the navigation menu confusing. Consider redesigning the sidebar.",
    date: "2025-01-05"
  },
  {
    id: "#PERF-002",
    category: "performance",
    summary: "API latency",
    urgency: "medium",
    impact: "low",
    status: "not_started",
    description: "API responses taking longer than expected during peak hours.",
    date: "2025-01-03"
  },
  {
    id: "#FR-003",
    category: "feature",
    summary: "Mobile app version",
    urgency: "low",
    impact: "high",
    status: "not_started",
    description: "Request for dedicated mobile application for iOS and Android.",
    date: "2025-01-06"
  },
];

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [feedbackList] = useState<Feedback[]>(mockFeedbackData);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  const openFeedbackDialog = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
  };

  const filterByCategory = (category: string) => {
    // This will be handled by individual components
    console.log("Filter by category:", category);
  };

  return (
    <FeedbackContext.Provider
      value={{
        feedbackList,
        selectedFeedback,
        setSelectedFeedback,
        openFeedbackDialog,
        filterByCategory,
      }}
    >
      {children}
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (context === undefined) {
    throw new Error("useFeedback must be used within a FeedbackProvider");
  }
  return context;
}
