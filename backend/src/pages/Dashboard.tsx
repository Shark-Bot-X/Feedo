import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Search, X, Loader2, Edit, Trash2, PlusCircle, Save } from "lucide-react";
import { API_ENDPOINTS } from "@/config/api";
// --- MOCKING MISSING DEPENDENCIES (As provided by the user) ---
// This pattern guarantees the state object is initialized only ONCE
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

const useToast = () => ({
    toast: (options) => console.log("Toast:", options.title, options.description)
});

const useFeedback = () => {
    // Local state to track changes in global state (required for React to re-render)
    const [localUpdateTrigger, setLocalUpdateTrigger] = useState(PERSISTENT_STATE.updateTrigger);
    
    const setFeedbackData = (data, fileName) => {
        // CRITICAL WRITE OPERATION
        // Ensure 'data' is structured as { feedbacks: [...] } if it comes from an API,
        // or just the list if it comes from an internal edit. We normalize here.
        const newList = Array.isArray(data) ? data : (data.feedbacks || []);
        
        PERSISTENT_STATE.list = newList;
        PERSISTENT_STATE.fileName = fileName === undefined ? PERSISTENT_STATE.fileName : fileName;
        
        // Trigger re-render
        PERSISTENT_STATE.updateTrigger += 1;
        setLocalUpdateTrigger(PERSISTENT_STATE.updateTrigger);
        
        console.log("Feedback list updated. Total feedbacks:", PERSISTENT_STATE.list.length, "File:", PERSISTENT_STATE.fileName);
    };

    return { 
        feedbackList: PERSISTENT_STATE.list, 
        persistentFileName: PERSISTENT_STATE.fileName,
        openFeedbackDialog: (feedback) => console.log("Opening dialog for:", feedback.id),
        setFeedbackData 
    };
};
// --- END: MOCKING MISSING DEPENDENCIES ---


// --- NEW COMPONENT: Editable Data Table ---

const FeedbackDataTable = ({ feedbackList, setFeedbackData, searchQuery }) => {
    const { toast } = useToast();
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});

    // Filter feedback based on search query
    const filteredFeedback = useMemo(() => {
        if (!searchQuery.trim()) return feedbackList;

        const query = searchQuery.toLowerCase().trim();
        return feedbackList.filter(f => 
            String(f.id).toLowerCase().includes(query) ||
            String(f.summary).toLowerCase().includes(query) ||
            String(f.category).toLowerCase().includes(query) ||
            String(f.urgency).toLowerCase().includes(query)
        );
    }, [feedbackList, searchQuery]);


    const handleEditClick = (feedback) => {
        setEditingId(feedback.id);
        setEditData({ ...feedback });
    };

    const handleSaveClick = () => {
        if (editingId === null) return;
        
        const newFeedbackList = feedbackList.map(f => 
            f.id === editingId ? { ...editData } : f
        );
        
        setFeedbackData(newFeedbackList);
        setEditingId(null);
        toast({ title: "Feedback Saved", description: `Item ${editingId} has been updated.` });
    };

    const handleDeleteClick = (id) => {
        if (window.confirm(`Are you sure you want to delete feedback item ${id}?`)) {
            const newFeedbackList = feedbackList.filter(f => f.id !== id);
            setFeedbackData(newFeedbackList);
            toast({ title: "Feedback Deleted", description: `Item ${id} was removed.` });
        }
    };
    
    const handleAddClick = () => {
        const newId = `manual-${Date.now()}`;
        const newFeedback = {
            id: newId,
            summary: "New manually added feedback",
            category: "Uncategorized",
            urgency: "Medium",
        };
        // Add to the list and start editing immediately
        setFeedbackData([newFeedback, ...feedbackList]);
        handleEditClick(newFeedback);
    };


    const renderRow = (feedback) => {
        const isEditing = editingId === feedback.id;
        
        const changeHandler = (field, value) => {
            setEditData(prev => ({ ...prev, [field]: value }));
        };

        return (
            <tr key={feedback.id} className="border-b transition-colors hover:bg-muted/50">
                {/* ID Column */}
                <td className="p-4 font-mono text-sm max-w-20 overflow-hidden text-ellipsis whitespace-nowrap">
                    {feedback.id}
                </td>
                
                {/* Summary Column */}
                <td className="p-4 max-w-64">
                    {isEditing ? (
                        <Input 
                            value={editData.summary}
                            onChange={(e) => changeHandler('summary', e.target.value)}
                            className="text-sm"
                        />
                    ) : (
                        <span className="text-sm line-clamp-2">{feedback.summary}</span>
                    )}
                </td>
                
                {/* Category Column */}
                <td className="p-4 max-w-32">
                    {isEditing ? (
                         <Input 
                            value={editData.category}
                            onChange={(e) => changeHandler('category', e.target.value)}
                            className="text-sm"
                        />
                    ) : (
                        <span className="text-xs font-semibold capitalize bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {feedback.category}
                        </span>
                    )}
                </td>
                
                {/* Urgency Column */}
                <td className="p-4 max-w-24">
                    {isEditing ? (
                        <Input 
                            value={editData.urgency}
                            onChange={(e) => changeHandler('urgency', e.target.value)}
                            className="text-sm"
                        />
                    ) : (
                        <span className={`text-xs font-semibold capitalize px-2 py-1 rounded-full ${
                            feedback.urgency?.toLowerCase() === 'high' ? 'bg-red-100 text-red-800' : 
                            feedback.urgency?.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                        }`}>
                            {feedback.urgency}
                        </span>
                    )}
                </td>
                
                {/* Actions Column */}
                <td className="p-4 flex gap-2 justify-end">
                    {isEditing ? (
                        <Button variant="outline" size="icon" onClick={handleSaveClick}>
                            <Save className="w-4 h-4 text-green-600" />
                        </Button>
                    ) : (
                        <Button variant="outline" size="icon" onClick={() => handleEditClick(feedback)}>
                            <Edit className="w-4 h-4" />
                        </Button>
                    )}
                    <Button variant="outline" size="icon" onClick={() => handleDeleteClick(feedback.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                </td>
            </tr>
        );
    };

    return (
        <Card className="mt-8">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold">Feedback Data Table</CardTitle>
                <Button onClick={handleAddClick} size="sm" className="space-x-2">
                    <PlusCircle className="w-4 h-4" />
                    <span>Add New Feedback</span>
                </Button>
            </CardHeader>
            <CardDescription className="px-6 pb-4">
                You can directly edit, add, or delete any feedback item here before processing with the AI.
            </CardDescription>
            <CardContent className="p-0">
                <div className="overflow-x-auto max-h-[600px] relative">
                    <table className="w-full text-left text-sm font-light">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                            <tr>
                                <th scope="col" className="p-4 w-1/12">ID</th>
                                <th scope="col" className="p-4 w-6/12">Summary / Description</th>
                                <th scope="col" className="p-4 w-2/12">Category</th>
                                <th scope="col" className="p-4 w-2/12">Urgency</th>
                                <th scope="col" className="p-4 w-1/12 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredFeedback.length > 0 ? (
                                filteredFeedback.map(renderRow)
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-muted-foreground">
                                        {searchQuery ? `No results found for "${searchQuery}"` : "No feedback data loaded yet. Upload a file above."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
};


// --- MAIN COMPONENT: Dashboard (Now includes the table) ---

const Dashboard = () => {
    // ... (rest of the original state and hooks) ...
    const [isUploading, setIsUploading] = useState(false);
    const [newlySelectedFile, setNewlySelectedFile] = useState(null); 
    const [searchQuery, setSearchQuery] = useState("");
    const { toast } = useToast();
    const { feedbackList, setFeedbackData, persistentFileName } = useFeedback();

    const handleFileChange = (e) => {
      const file = e.target.files?.[0];
      setNewlySelectedFile(file || null);
    }
    
    // NOTE: handleFileUpload logic remains mostly the same, ensuring it calls setFeedbackData(result.data, file.name)
    const handleFileUpload = async () => {
        // ... (original handleFileUpload logic) ...
        const file = newlySelectedFile; 

        if (!file) {
            toast({ title: "No file selected", description: "Please choose a file before clicking upload.", variant: "destructive" });
            return;
        }

        const isSupportedFile = file.name.endsWith(".csv") || file.name.endsWith(".xlsx") || file.name.endsWith(".xls");
        if (!isSupportedFile) {
            toast({ title: "Invalid file format", description: "Please upload a CSV or Excel file (.xlsx, .xls).", variant: "destructive" });
            setNewlySelectedFile(null);
            document.getElementById('csv-upload').value = null; 
            return;
        }

        setIsUploading(true);
        toast({ title: "Uploading and Analyzing...", description: `Sending ${file.name} to the processor. This might take a moment.` });

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(API_ENDPOINTS.ANALYZE_CSV, {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();

            if (response.ok && result.success) {
                // IMPORTANT: Update the persistent state with the new list and filename
                setFeedbackData(result.data.feedbacks, file.name); 
                
                toast({ title: "Analysis Complete!", description: `${result.data.feedbacks.length} feedbacks were successfully processed.`, });
            } else {
                const errorMessage = result.error || "An unknown error occurred during analysis.";
                toast({ title: "Processing Failed", description: errorMessage, variant: "destructive" });
                setFeedbackData([], null); 
            }
        } catch (error) {
            console.error("Fetch Error:", error);
            toast({ title: "Network Error", description: "Could not connect to the feedback processor API. Ensure the Flask server is running .", variant: "destructive" });
            setFeedbackData([], null);
        } finally {
            setIsUploading(false);
            setNewlySelectedFile(null); 
            document.getElementById('csv-upload').value = null; 
        }
    };
    
    // ... (rest of the original display logic) ...
    const displayName = newlySelectedFile 
        ? newlySelectedFile.name 
        : (isUploading 
            ? (persistentFileName || "Processing file...") 
            : (persistentFileName || "Choose a CSV or Excel file to upload"));

    const clearSearch = () => setSearchQuery("");


    return (
        <div className="flex-1 p-8 animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Data Management & Dashboard</h1>
                <p className="text-muted-foreground">Upload, manage, and inspect your raw feedback data before starting the AI analysis.</p>
            </div>

            {/* --- Upload Card (Retained) --- */}
            <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                    <CardTitle>Upload Feedback Data</CardTitle>
                    <CardDescription>Upload your feedback data in CSV or Excel format.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <Input
                            type="file"
                            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                            onChange={handleFileChange}
                            className="flex-1 hidden"
                            id="csv-upload"
                            disabled={isUploading}
                        />
                        <Input 
                            className="flex-1 cursor-default bg-muted/50"
                            placeholder="Choose a CSV or Excel file to upload"
                            readOnly
                            value={displayName}
                        />
                        <Button 
                            onClick={handleFileUpload}
                            disabled={isUploading || !newlySelectedFile}
                            className="w-40 transition-all duration-300"
                        >
                            {isUploading ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
                            ) : (
                                <><Upload className="w-4 h-4 mr-2" /> Upload File</>
                            )}
                        </Button>
                        <Button 
                            onClick={() => document.getElementById('csv-upload')?.click()}
                            disabled={isUploading}
                            variant="outline"
                            className="w-40 transition-all duration-300"
                        >
                            Browse File
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* --- Data Table Section (NEW) --- */}
            <div className="mt-8">
                <div className="relative max-w-lg mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        placeholder="Search table by ID, summary, category, or urgency..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-10 transition-all focus:scale-[1.01]"
                        disabled={isUploading || feedbackList.length === 0}
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
                <FeedbackDataTable 
                    feedbackList={feedbackList} 
                    setFeedbackData={setFeedbackData}
                    searchQuery={searchQuery}
                />
            </div>
            {/* The original summary cards are removed to make room for the table, 
                but you can add them back below the table if needed. */}

        </div>
    );
};

export default Dashboard;