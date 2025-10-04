import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import AIInsights from "./pages/AIInsights";
import UrgentIssues from "./pages/UrgentIssues";
import FeedbackList from "./pages/FeedbackList";
import WeeklyReport from "./pages/WeeklyReport";
import Profile from "./pages/Profile";
import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import { FeedbackProvider } from "./contexts/FeedbackContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <FeedbackProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><DashboardLayout><Analytics /></DashboardLayout></ProtectedRoute>} />
            <Route path="/ai" element={<ProtectedRoute><DashboardLayout><AIInsights /></DashboardLayout></ProtectedRoute>} />
            <Route path="/urgent" element={<ProtectedRoute><DashboardLayout><UrgentIssues /></DashboardLayout></ProtectedRoute>} />
            <Route path="/feedback" element={<ProtectedRoute><DashboardLayout><FeedbackList /></DashboardLayout></ProtectedRoute>} />
            <Route path="/report" element={<ProtectedRoute><DashboardLayout><WeeklyReport /></DashboardLayout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><DashboardLayout><Profile /></DashboardLayout></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </FeedbackProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
