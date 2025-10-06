import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Loader2 } from "lucide-react";

// --- START: PERSISTENT GLOBAL STATE GUARANTEE ---
// This pattern guarantees the state object is initialized only ONCE, 
// even if the script block is re-evaluated when switching between pages/components.
(function() {
    if (typeof window.__FEEDBACK_APP_STATE === 'undefined') {
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

// --- START: MOCKING MISSING DEPENDENCIES FOR DEMO ---
const useToast = () => ({
    toast: (options) => console.log("Toast:", options.title, options.description)
});

const useFeedback = () => {
    // Local state to track changes in global state (required for React to re-render)
    const [localUpdateTrigger, setLocalUpdateTrigger] = useState(PERSISTENT_STATE.updateTrigger);
    
    // Function to update the persistent state and trigger a re-render in consumers
    const setFeedbackData = (data, fileName) => {
        PERSISTENT_STATE.list = data.feedbacks || [];
        PERSISTENT_STATE.fileName = fileName || null;
        
        // Increment global dependency and trigger local update
        PERSISTENT_STATE.updateTrigger += 1;
        setLocalUpdateTrigger(PERSISTENT_STATE.updateTrigger);
        
        console.log("Feedback list updated. Total feedbacks:", data.total, "File:", fileName);
    };

    // The component always returns the current persistent values
    return { 
        feedbackList: PERSISTENT_STATE.list, 
        persistentFileName: PERSISTENT_STATE.fileName, // New property to read the name
        openFeedbackDialog: (feedback) => console.log("Opening dialog for:", feedback.id),
        setFeedbackData 
    };
};
// --- END: MOCKING MISSING DEPENDENCIES FOR DEMO ---


/**
 * Processes the raw feedback list into structured data for Recharts components.
 * @param {Array<Object>} feedbackList - The list of feedback objects.
 * @returns {Object} Structured data for charts.
 */
const processFeedbackData = (feedbackList) => {
    if (feedbackList.length === 0) {
        return { categoryData: [], urgencyData: [], dailyTrendData: [] };
    }
    
    // Tally counts for Category and Urgency
    const counts = feedbackList.reduce((acc, feedback) => {
        const category = (feedback.category || 'other').toLowerCase();
        const urgency = (feedback.urgency || 'medium').toLowerCase();

        acc.category[category] = (acc.category[category] || 0) + 1;
        acc.urgency[urgency] = (acc.urgency[urgency] || 0) + 1;
        return acc;
    }, { category: {}, urgency: {} });

    // --- Prepare Category Data (Pie Chart) ---
    const categoryColors = {
        'feature': "#4ADE80",     // Tailwind green-400
        'bug': "#EF4444",         // Tailwind red-500
        'performance': "#F59E0B", // Tailwind amber-500
        'other': "#9CA3AF",       // Tailwind gray-400
    };
    const categoryData = Object.entries(counts.category).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        color: categoryColors[name] || "#3B82F6",
    }));

    // --- Prepare Urgency Data (Bar Chart) ---
    // Ensure standard order for better visualization
    const urgencyOrder = ["critical", "high", "medium", "low"];
    const urgencyData = urgencyOrder.map(level => ({
        name: level.charAt(0).toUpperCase() + level.slice(1),
        count: counts.urgency[level] || 0,
    })).filter(d => d.count > 0); // Remove zero-count bars for cleaner display

    // --- Prepare Daily Trend Data (Line Chart) ---
    // Since source data lacks dates, we create a proportional daily distribution for visualization
    const totalCount = feedbackList.length;
    const dailyTrendData = [
        { day: "Mon", count: Math.floor(totalCount * 0.15) },
        { day: "Tue", count: Math.floor(totalCount * 0.25) },
        { day: "Wed", count: Math.floor(totalCount * 0.18) },
        { day: "Thu", count: Math.floor(totalCount * 0.20) },
        { day: "Fri", count: Math.floor(totalCount * 0.12) },
        { day: "Sat", count: Math.floor(totalCount * 0.05) },
        { day: "Sun", count: Math.floor(totalCount * 0.05) },
    ];
    // Adjust Thursday to absorb any rounding errors
    const currentSum = dailyTrendData.reduce((sum, item) => sum + item.count, 0);
    const diff = totalCount - currentSum;
    if (diff > 0) {
        dailyTrendData[3].count += diff;
    }
    
    return { categoryData, urgencyData, dailyTrendData };
};


const Analytics = () => {
    // Access the persistent state
    const { feedbackList, persistentFileName } = useFeedback();

    // Process the live data
    const { categoryData, urgencyData, dailyTrendData } = processFeedbackData(feedbackList);

    const dataLoaded = feedbackList.length > 0;
    const totalFeedbackCount = feedbackList.length;

    const renderChartContent = (data, title) => {
        if (!dataLoaded) {
            return (
                <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground bg-gray-50/50 rounded-lg">
                    <Loader2 className="w-8 h-8 mb-2 animate-spin text-primary" />
                    <p>No data loaded. Please upload a file in the Dashboard.</p>
                </div>
            );
        }

        // Specific rendering for each chart type
        switch(title) {
            case "Category Distribution":
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                animationDuration={800}
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend layout="vertical" verticalAlign="middle" align="right" />
                        </PieChart>
                    </ResponsiveContainer>
                );
            case "Urgency Levels":
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={urgencyData}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#3B82F6" animationDuration={800} radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                );
            case "Daily Feedback Trend":
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={dailyTrendData}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="#10B981"
                                strokeWidth={3}
                                dot={{ fill: "#10B981", r: 6 }}
                                animationDuration={800}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                );
            default:
                return null;
        }
    };


    return (
        <div className="flex-1 p-8 animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Analytics</h1>
                <p className="text-muted-foreground">
                    Visual insights from your current dataset: 
                    <span className="font-semibold text-primary ml-1">
                        {persistentFileName || "None Loaded"}
                    </span>
                    {dataLoaded && <span className="ml-2 text-sm text-gray-500">({totalFeedbackCount} items)</span>}
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                
                {/* Category Distribution Card (Pie Chart) */}
                <Card className="hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                        <CardTitle>Category Distribution</CardTitle>
                        <CardDescription>Feedback volume by AI-assigned category</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {renderChartContent(categoryData, "Category Distribution")}
                    </CardContent>
                </Card>

                {/* Urgency Levels Card (Bar Chart) */}
                <Card className="hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                        <CardTitle>Urgency Levels</CardTitle>
                        <CardDescription>Distribution of calculated priority scores</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {renderChartContent(urgencyData, "Urgency Levels")}
                    </CardContent>
                </Card>

                {/* Daily Feedback Trend Card (Line Chart) */}
                <Card className="hover:shadow-lg transition-all duration-300 md:col-span-2">
                    <CardHeader>
                        <CardTitle>Daily Feedback Trend (Simulated)</CardTitle>
                        <CardDescription>Proportional volume of submissions over a week based on total data.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {renderChartContent(dailyTrendData, "Daily Feedback Trend")}
                    </CardContent>
                </Card>
                
                {/* Note: Removed Task Status as source data doesn't provide this */}
            </div>
        </div>
    );
};

export default Analytics;
