import time
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app) # Enable CORS for React frontend

# Keyword mapping for categories
KEYWORD_CATEGORIES = {
    "Feature Request": [
        "feature", "add", "wish", "would be great", "please add", "could you add",
        "suggestion", "implement", "new feature", "enhancement", "would love to see",
        "missing", "lacks", "doesn't have", "should have", "hope to see"
    ],
    "Bug / Issue Report": [
        "bug", "broken", "error", "crash", "not working", "issue", "problem",
        "glitch", "fails", "doesn't work", "stopped working", "malfunction",
        "freeze", "stuck", "won't load", "can't access", "unable to"
    ],
    "User Experience (UX) Feedback": [
        "confusing", "hard to use", "difficult", "complicated", "unintuitive",
        "navigation", "layout", "design", "interface", "ui", "ux", "user friendly",
        "easier", "simpler", "cluttered", "messy", "unclear"
    ],
    "Performance / Speed": [
        "slow", "fast", "performance", "lag", "loading", "speed", "responsive",
        "takes too long", "delays", "timeout", "hanging", "freezing",
        "quick", "sluggish", "unresponsive"
    ],
    "Pricing & Value": [
        "price", "pricing", "cost", "expensive", "cheap", "value", "subscription",
        "plan", "free", "paid", "worth", "money", "refund", "billing",
        "overpriced", "affordable", "budget"
    ],
    "Positive / Praise": [
        "love", "great", "awesome", "excellent", "amazing", "fantastic",
        "wonderful", "best", "perfect", "thank you", "appreciate", "impressed",
        "happy", "satisfied", "helpful", "good job", "well done"
    ],
    "Security / Privacy Concern": [
        "security", "privacy", "data", "safe", "hack", "breach", "leak",
        "encryption", "password", "secure", "vulnerable", "protect",
        "confidential", "gdpr", "compliance", "unauthorized"
    ],
    "Customer Support Experience": [
        "support", "help", "service", "response", "ticket", "agent",
        "customer service", "replied", "assistance", "helpful", "unhelpful",
        "waiting", "no response", "ignored", "support team"
    ],
    "Comparison with Competitor": [
        "competitor", "alternative", "better than", "worse than", "compared to",
        "vs", "versus", "other tools", "switch from", "similar to",
        "like other", "unlike other"
    ]
}

# Urgency keywords
URGENCY_HIGH = ["urgent", "critical", "immediately", "asap", "broken", "can't use", "blocking"]
URGENCY_MEDIUM = ["important", "soon", "annoying", "frustrating", "problem"]
URGENCY_LOW = ["minor", "eventually", "nice to have", "suggestion", "when possible"]


def analyze_feedback(feedback_text):
    """Analyze feedback using keyword matching."""
    text_lower = feedback_text.lower()
    
    # Find category with most keyword matches
    category_scores = {}
    for category, keywords in KEYWORD_CATEGORIES.items():
        score = sum(1 for keyword in keywords if keyword in text_lower)
        if score > 0:
            category_scores[category] = score
    
    # Assign category
    if category_scores:
        category = max(category_scores, key=category_scores.get)
    else:
        category = "General Feedback"
    
    # Map to frontend categories
    category_map = {
        "Feature Request": "feature",
        "Bug / Issue Report": "bug",
        "User Experience (UX) Feedback": "ux",
        "Performance / Speed": "performance",
        "Pricing & Value": "pricing",
        "Positive / Praise": "positive",
        "Security / Privacy Concern": "security",
        "Customer Support Experience": "support",
        "Comparison with Competitor": "competitor",
        "General Feedback": "general"
    }
    
    # Determine urgency
    urgency = "low"
    for keyword in URGENCY_HIGH:
        if keyword in text_lower:
            urgency = "high"
            break
    if urgency == "low":
        for keyword in URGENCY_MEDIUM:
            if keyword in text_lower:
                urgency = "medium"
                break
    
    # Generate summary
    summary = feedback_text[:150] + "..." if len(feedback_text) > 150 else feedback_text
    
    # Root cause mapping
    root_cause_map = {
        "feature": "User needs functionality that is not currently available",
        "bug": "Technical issue preventing proper functionality",
        "ux": "Interface or usability concern affecting user experience",
        "performance": "Performance optimization needed",
        "pricing": "Pricing structure or value perception concern",
        "positive": "User expressing satisfaction with the product",
        "security": "Security or privacy feature concern",
        "support": "Customer support interaction feedback",
        "competitor": "User comparing product with alternatives",
        "general": "General user feedback"
    }
    
    frontend_category = category_map.get(category, "general")
    root_cause = root_cause_map.get(frontend_category, "General user feedback")
    
    return {
        "category": frontend_category,
        "summary": summary,
        "root_cause": root_cause,
        "urgency": urgency,
        "full_category": category
    }


@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "ok", "message": "Feedback processor is running"})


@app.route("/api/analyze-csv", methods=["POST"])
def analyze_csv():
    """
    Accepts CSV file upload and returns analyzed feedback data.
    Returns JSON format compatible with React frontend.
    """
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    if not file.filename:
        return jsonify({"error": "Empty filename"}), 400

    try:
        # Read CSV file
        if file.filename.endswith(".csv"):
            df = pd.read_csv(file)
        elif file.filename.endswith((".xlsx", ".xls")):
            df = pd.read_excel(file)
        else:
            return jsonify({"error": "Invalid file format. Please upload CSV or Excel file"}), 400

        if df.empty:
            return jsonify({"error": "The uploaded file is empty"}), 400
        
        # --- START OF TRANSFORMATION / COLUMN ROBUSTNESS CHANGE ---
        
        # 1. Standardize all column names to lowercase to ensure case-insensitive matching
        df.columns = df.columns.str.lower()

        # 2. Try to find feedback column using lowercase names
        # Removed "FEEDBACK_TEXT" from possible_cols since all columns are now lowercase
        possible_cols = ["feedback_text", "text", "feedback", "comment"] 
        text_col = next((col for col in possible_cols if col in df.columns), None)
        
        if not text_col:
            # Fallback to the first column name if no recognized text column is found
            text_col = df.columns[0]
            
        # Define the expected ID and Task columns (now in lowercase)
        id_col = "feedback_id"
        task_col = "task"
        
        # --- END OF TRANSFORMATION / COLUMN ROBUSTNESS CHANGE ---

        timestamp = int(time.time())
        analyzed_feedbacks = []

        for i, row in df.iterrows():
            # Use the lowercase column names for reliable lookup now that columns are standardized
            # This handles 'FEEDBACK_ID' -> 'feedback_id', 'TASK' -> 'task' automatically
            
            feedback_id = row.get(id_col, f"FB{timestamp}{i+1:03d}")
            # Ensure the task column exists before trying to access it
            task_status = str(row.get(task_col, "not_completed")).lower() if task_col in row else "not_completed"
            
            feedback_text = str(row.get(text_col, "")).strip()

            if not feedback_text or feedback_text == "nan":
                continue

            # Analyze the feedback
            analysis = analyze_feedback(feedback_text)

            # Map task status
            status_map = {
                "completed": "completed",
                "not_completed": "pending",
                "ongoing": "in-progress",
                "in_progress": "in-progress"
            }
            status = status_map.get(task_status, "pending")

            analyzed_feedbacks.append({
                "id": feedback_id,
                "category": analysis["category"],
                "summary": analysis["summary"],
                "status": status,
                "urgency": analysis["urgency"],
                "rootCause": analysis["root_cause"],
                "fullText": feedback_text,
                "fullCategory": analysis["full_category"]
            })

        # Calculate statistics
        total = len(analyzed_feedbacks)
        categories_count = {}
        urgency_count = {"high": 0, "medium": 0, "low": 0}
        status_count = {"pending": 0, "in-progress": 0, "completed": 0}

        for feedback in analyzed_feedbacks:
            # Count categories
            cat = feedback["category"]
            categories_count[cat] = categories_count.get(cat, 0) + 1
            
            # Count urgency
            urgency_count[feedback["urgency"]] += 1
            
            # Count status
            status_count[feedback["status"]] += 1

        return jsonify({
            "success": True,
            "data": {
                "feedbacks": analyzed_feedbacks,
                "stats": {
                    "total": total,
                    "categories": categories_count,
                    "urgency": urgency_count,
                    "status": status_count
                }
            }
        })

    except Exception as e:
        # A more detailed error for debugging file reading issues
        return jsonify({"error": f"Error processing file: {type(e).__name__}: {str(e)}"}), 500


@app.route("/api/keywords", methods=["GET"])
def get_keywords():
    """Returns the keyword mappings for reference"""
    return jsonify(KEYWORD_CATEGORIES)


if __name__ == "__main__":
    # Get port from environment (Render provides this)
    port = int(os.environ.get('PORT', 5000))
    
    print("🚀 Feedback Processor API starting...")
    print(f"📡 Server running on port {port}")
    
    # IMPORTANT: Set debug=False for production
    app.run(host="0.0.0.0", port=port, debug=False)